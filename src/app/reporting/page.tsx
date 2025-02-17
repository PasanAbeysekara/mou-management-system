"use client";

import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridCellParams,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface MOUSubmission {
  id: string;
  title: string;
  partnerOrganization: string;
  purpose: string;
  description: string;
  dateSubmitted: string; // Expected ISO string
  datesSigned?: string | null;
  validUntil: string; // Expected ISO string
  submittedBy: string;
  status: any; // JSON object (e.g., { legal: { approved: boolean, date?: string|null }, ... })
  documents: any;
  renewalOf?: string | null;
  history: any;
}

export default function ReportingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mous, setMous] = useState<MOUSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === "USER") {
      toast.error("Access Denied: Reporting is for admins only.");
      router.push("/");
      return;
    }
    fetchMous();
  }, [user, router]);

  async function fetchMous() {
    try {
      const res = await fetch("/api/mous/reporting");
      if (!res.ok) {
        throw new Error("Failed to fetch report data");
      }
      const data = await res.json();
      setMous(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching report data");
    } finally {
      setLoading(false);
    }
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "partnerOrganization", headerName: "Partner", width: 150 },
    { field: "purpose", headerName: "Purpose", width: 150 },
    {
      field: "dateSubmitted",
      headerName: "Submitted",
      width: 150,
      valueFormatter: (value) => {
        const d = new Date(value as string);
        return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
      },
    },
    {
      field: "validUntil",
      headerName: "Valid Until",
      width: 150,
      valueFormatter: (value) => {
        const d = new Date(value as string);
        return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
      },
    },
    {
      field: "remaining",
      headerName: "Remaining",
      width: 150,
      valueGetter: (value, row) => {
        const validUntilStr = row?.validUntil;
        if (!validUntilStr) return "";
        const validUntil = new Date(validUntilStr as string);
        if (isNaN(validUntil.getTime())) return "";
        const daysLeft = Math.ceil(
          (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysLeft > 0 ? `${daysLeft} days left` : "Expired";
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params: GridCellParams) => {
        const status = params.value;
        if (!status || typeof status !== "object") return <span>N/A</span>;
        const approvedSteps = Object.entries(status)
          .filter(([key, val]) => val.approved)
          .map(([key]) => key)
          .join(", ");
        return <span>{approvedSteps || "Pending"}</span>;
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Reporting Dashboard
      </h1>
      <div className="bg-white shadow rounded-lg p-4">
        {loading ? (
          <p className="text-center">Loading report data...</p>
        ) : (
          <DataGrid
            rows={mous}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 20, 50]}
            slots={{ toolbar: GridToolbar }}
            getRowId={(row) => row.id}
            autoHeight
            sx={{
              border: "none", // Remove outer border
              boxShadow: "none",
              outline: "none",
              "& .MuiDataGrid-columnHeaders": {
                borderBottom: "none", // Remove bottom border from headers
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none", // Remove top border from footer
              },
              "& .MuiDataGrid-cell": {
                outline: "none", // Remove cell outline on focus
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none", // Hide the column separator lines
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
