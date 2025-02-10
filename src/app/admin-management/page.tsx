'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
} from '@mui/material';

interface AdminFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
}

export default function AdminManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
  });

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/');
    } else {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    const response = await fetch('/api/admin/list');
    const data = await response.json();
    setAdmins(data.admins);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const adminRoles = [
    'LEGAL_ADMIN',
    'FACULTY_ADMIN',
    'SENATE_ADMIN',
    'UGC_ADMIN',
  ];

  // Add this function inside the AdminManagement component
  const handleDeactivateAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });

      if (response.ok) {
        fetchAdmins(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deactivating admin:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add New Admin
        </Button>
      </div>

      <Paper className="overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin: any) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>{admin.department}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => handleDeactivateAdmin(admin.id)}
                  >
                    Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {adminRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Add Admin
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}