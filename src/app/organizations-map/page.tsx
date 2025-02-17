'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface Organization {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

interface MOUSubmission {
  id: string;
  title: string;
  dateSubmitted: string;
}

export default function OrganizationsMapPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgMous, setOrgMous] = useState<MOUSubmission[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  // Allow only SUPER_ADMIN access
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast.error('Access Denied: Only Super Admin can access this page.');
      router.push('/');
      return;
    }
    fetchOrganizations();
  }, [user, router]);

  async function fetchOrganizations() {
    try {
      const res = await fetch('/api/organizations');
      if (!res.ok) {
        throw new Error('Failed to fetch organizations');
      }
      const data: Organization[] = await res.json();
      // Filter organizations with valid coordinates
      setOrganizations(data.filter((org) => org.lat != null && org.lng != null));
    } catch (error) {
      console.error(error);
      toast.error('Error fetching organizations');
    }
  }

  async function fetchMOUForOrganization(orgId: string) {
    try {
      const res = await fetch(`/api/mous/by-organization?orgId=${orgId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch MOU submissions for organization');
      }
      const data: MOUSubmission[] = await res.json();
      setOrgMous(data);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching MOU submissions for organization');
    }
  }

  const containerStyle = { width: '100%', height: '500px' };

  // Default map center to show the whole world
  const worldView = { lat: 0, lng: 0 };

  const handleMarkerClick = (org: Organization) => {
    setSelectedOrg(org);
  };

  const handleViewMOUs = async () => {
    if (selectedOrg) {
      await fetchMOUForOrganization(selectedOrg.id);
      setOpenDialog(true);
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Organizations Map</h1>
      <GoogleMap mapContainerStyle={containerStyle} center={worldView} zoom={2}>
        {organizations.map((org) => (
          <Marker
            key={org.id}
            position={{ lat: org.lat, lng: org.lng }}
            onClick={() => handleMarkerClick(org)}
          />
        ))}
        {selectedOrg && (
          <InfoWindow
            position={{ lat: selectedOrg.lat, lng: selectedOrg.lng }}
            onCloseClick={() => setSelectedOrg(null)}
          >
            <div className="p-2">
              <h2 className="font-bold">{selectedOrg.name}</h2>
              {selectedOrg.address && <p className="text-sm">{selectedOrg.address}</p>}
              <Button
                variant="contained"
                color="primary"
                onClick={handleViewMOUs}
                sx={{ mt: 1 }}
              >
                View MOU Submissions
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Dialog to show MOUs for the selected organization */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>MOU Submissions for {selectedOrg?.name}</DialogTitle>
        <DialogContent dividers>
          {orgMous.length === 0 ? (
            <p>No MOU submissions found for this organization.</p>
          ) : (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {orgMous.map((mou) => (
                  <tr key={mou.id} className="border-b">
                    <td className="px-4 py-2">{mou.id}</td>
                    <td className="px-4 py-2">{mou.title}</td>
                    <td className="px-4 py-2">
                      {new Date(mou.dateSubmitted).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
