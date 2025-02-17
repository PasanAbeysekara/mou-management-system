'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { storage } from "@/lib/firebase"; // your firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Button from "@mui/material/Button";

// Update FormDataType to include organizationId
interface FormDataType {
  title: string;
  partnerOrganization: string;
  organizationId: string; // New: to store selected organization's id (if available)
  purpose: string;
  description: string;
  datesSigned: string;
  validUntil: string;
  renewalOf: string|null;
  documents: any; // We'll store PDF URLs in { justification: string }
}

interface OrganizationOption {
  id: string;
  name: string;
}

export default function MOUSubmissionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const renewId = searchParams.get("renewId"); // For renewal

  // State for available organizations
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  // State for "Other" input
  const [otherOrganization, setOtherOrganization] = useState("");

  // Form state updated to include organizationId
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    partnerOrganization: "",
    organizationId: "",
    purpose: "",
    description: "",
    datesSigned: "",
    validUntil: "",
    renewalOf: "",
    documents: {}, // We'll store the PDF URL here under "justification"
  });
  const [loading, setLoading] = useState(true);

  const handleTemplateDownload = () => {
    window.open("/template.pdf", "_blank");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    const fileRef = ref(storage, `justificationDocuments/${file.name}`);
    try {
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, file);
      // Get public download URL
      const downloadURL = await getDownloadURL(fileRef);
      toast.success("File uploaded successfully.");
      setLoading(false);
      // Update form data with the PDF URL
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, justification: downloadURL },
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
    }
  };

  // If renewing, fetch existing MOU details and pre-fill form
  useEffect(() => {
    const fetchMOU = async () => {
      if (!renewId) return;
      try {
        const res = await fetch(`/api/mou-submissions/${renewId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch MOU for renewal");
        }
        const existingMou = await res.json();
        setFormData({
          title: existingMou.title,
          partnerOrganization: existingMou.partnerOrganization,
          organizationId: existingMou.organizationId || "",
          purpose: existingMou.purpose,
          description: existingMou.description,
          datesSigned: existingMou.datesSigned
            ? existingMou.datesSigned.slice(0, 10)
            : "",
          validUntil: existingMou.validUntil
            ? existingMou.validUntil.slice(0, 10)
            : "",
          renewalOf: renewId || "",
          documents: existingMou.documents,
        });
      } catch (err) {
        console.error(err);
        toast.error("Error fetching MOU details");
      }
    };
    fetchMOU();
  }, [renewId]);

  // Fetch organizations for Autocomplete
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch("/api/organizations");
        if (!res.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data: OrganizationOption[] = await res.json();
        // Add "Other" option manually
        setOrganizations([...data, { id: "other", name: "Other" }]);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching organizations");
      }
    }
    fetchOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Determine partnerOrganization value:
      // If the selected option is "Other", use the value from otherOrganization.
      const partnerOrg =
        formData.partnerOrganization === "Other"
          ? otherOrganization
          : formData.partnerOrganization;
      if (!partnerOrg) {
        throw new Error("Please select or enter a Partner Organization");
      }
      const payload = {
        ...formData,
        partnerOrganization: partnerOrg,
        organizationId: formData.organizationId || null,
        renewalOf: renewId || null,
        // Provide default JSON values for required fields
        status: {
          legal: { approved: false, date: null },
          faculty: { approved: false, date: null },
          senate: { approved: false, date: null },
          ugc: { approved: false, date: null },
        },
        history: [
          {
            action: "Created",
            date: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch("/api/mou-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit MOU");
      }

      toast.success("MOU submitted successfully!");
      router.push("/mou-submission/success");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        {renewId ? "Renew" : "Create"} MOU Submission Form
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            placeholder="Title of the MOU"
            className="w-full p-3 border rounded-md"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>
        {/* Partner Organization: Autocomplete with "Other" option */}
        <div>
          <label className="block mb-1 font-medium">Partner Organization</label>
          <Autocomplete
            options={organizations}
            getOptionLabel={(option) => option.name}
            // Set the value by matching organization's name
            value={
              organizations.find(
                (org) => org.name === formData.partnerOrganization
              ) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                partnerOrganization: newValue ? newValue.name : "",
                organizationId: newValue && newValue.id !== "other" ? newValue.id : "",
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Organization"
                variant="outlined"
                required
                sx={{ backgroundColor: "white" }}
              />
            )}
          />
          {/* If "Other" is selected, show additional text input */}
          {formData.partnerOrganization === "Other" && (
            <div className="mt-2">
              <label className="block mb-1 font-medium">
                Enter Organization Name
              </label>
              <input
                type="text"
                placeholder="Enter organization name"
                className="w-full p-3 border rounded-md"
                value={otherOrganization}
                onChange={(e) => setOtherOrganization(e.target.value)}
                required
              />
            </div>
          )}
        </div>
        {/* Purpose */}
        <div>
          <label className="block mb-1 font-medium">
            Purpose of the MOU
          </label>
          <input
            type="text"
            placeholder="Brief purpose statement"
            className="w-full p-3 border rounded-md"
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            required
          />
        </div>
        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            placeholder="Detailed description"
            className="w-full p-3 border rounded-md h-32"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          {/* <div>
            <label className="block mb-1 font-medium">
              Date Signed (optional)
            </label>
            <input
              type="date"
              className="w-full p-3 border rounded-md"
              value={formData.datesSigned}
              onChange={(e) =>
                setFormData({ ...formData, datesSigned: e.target.value })
              }
            />
          </div> */}
          <div>
            <label className="block mb-1 font-medium">Valid Until</label>
            <input
              type="date"
              className="w-full p-3 border rounded-md"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
              required
            />
          </div>
        </div>
        {/* Renewal Of (optional) */}
        <div>
          <label className="block mb-1 font-medium">
            Renewal Of (optional)
          </label>
          <input
            type="text"
            placeholder="ID of the MOU being renewed"
            className="w-full p-3 border rounded-md"
            value={formData.renewalOf || ""}
            onChange={(e) =>
              setFormData({ ...formData, renewalOf: e.target.value })
            }
          />
        </div>
        {/* Additional Buttons for Documents */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleTemplateDownload}
          fullWidth
          sx={{ mb: 1 }}
        >
          Download MOU Justification Template
        </Button>
        <label htmlFor="justification-file">
          <Button
            variant="contained"
            component="span"
            color="success"
            fullWidth
            sx={{ my: 1 }}
          >
            Upload the filled Justification Document
          </Button>
        </label>
        <input
          id="justification-file"
          style={{ display: "none" }}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        {formData.documents?.justification && (
          <p className="text-sm text-green-600">
            Uploaded Document: {formData.documents.justification}
          </p>
        )}
        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={loading}
          fullWidth
        >
           Submit
        </Button>
      </form>
    </div>
  );
}
