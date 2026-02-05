import Grid from "@mui/material/Grid";
import React, { useState, useMemo } from "react";
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination, Checkbox, FormControlLabel, FormGroup, CircularProgress } from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import {
  getAllRolesApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "../../api/roles.api.js";
import { getAllPermissionsApi } from "../../api/permissions.api.js";

const RoleSchema = Yup.object({
  name: Yup.string().required("Role name is required"),
});

export default function UserRoles() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  /* ===================== QUERIES ===================== */

  const { data: rolesRes, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRolesApi,
  });

  const { data: permissionsRes, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: getAllPermissionsApi,
  });

  /* ===================== MUTATIONS ===================== */

  const createMutation = useMutation({
    mutationFn: createRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRoleApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
    },
  });

  /* ===================== HANDLERS ===================== */

  const handleAdd = () => {
    setEditId(null);
    setOpen(true);
  };

  const handleEdit = (role) => {
    setEditId(role.id);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      deleteMutation.mutate(id);
    }
  };

  /* ===================== HELPERS ===================== */

  const roles = rolesRes?.roles || [];
  const groupedPermissions = permissionsRes?.permissions || {};

  const paginatedRoles = useMemo(() => {
    const rolesArray = Array.isArray(roles) ? roles : [];
    const start = (page - 1) * rowsPerPage;
    return rolesArray.slice(start, start + rowsPerPage);
  }, [roles, page]);

  const pageCount = Math.ceil((Array.isArray(roles) ? roles.length : 0) / rowsPerPage) || 1;

  const initialValues = (role) => ({
    id: role?.id || "",
    name: role?.name || "",
    permissionKeys:
      role?.permissions?.map((p) => `${p.module}:${p.action}`) ||
      role?.Permissions?.map((p) => `${p.module}:${p.action}`) ||
      [],
  });

  /* ===================== UI ===================== */

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">User Roles</Typography>
        <Button variant="contained" onClick={handleAdd}>
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr.</TableCell>
              <TableCell>Role Name</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rolesLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRoles.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(row)}>
                      <ModeEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
        count={pageCount}
        page={page}
        onChange={(e, v) => setPage(v)}
      />

      {/* ===================== MODAL ===================== */}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <Formik
          enableReinitialize
          initialValues={initialValues(Array.isArray(roles) ? roles.find((r) => r.id === editId) : undefined)}
          validationSchema={RoleSchema}
          onSubmit={(values) => {
            const { id, ...data } = values; // avoid sending id
            if (editId) {
              updateMutation.mutate({ id: editId, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <DialogTitle>{editId ? "Edit Role" : "Add Role"}</DialogTitle>

              <DialogContent>
                <Field
                  as={TextField}
                  name="name"
                  label="Role Name"
                  fullWidth
                  sx={{ mb: 3 }}
                />

                <Typography variant="h6">Permissions</Typography>
                {permissionsLoading ? (
                  <CircularProgress />
                ) : (
                  <Grid container spacing={2}>
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <Grid key={module} item xs={ 12 } sm={ 6 } md={ 4 }>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ textTransform: "capitalize" }}>
                        {module}
                      </Typography>
                      <FormGroup>
                            {perms.map((p) => (
                              <FormControlLabel
                                key={p.key}
                                control={
                                  <Checkbox
                                    checked={values.permissionKeys.includes(p.key)}
                                    onChange={(e) => {
                                      const { checked } = e.target;
                                      const { permissionKeys } = values;
                                      if (checked) {
                                        setFieldValue("permissionKeys", [...permissionKeys, p.key]);
                                      } else {
                                        setFieldValue(
                                          "permissionKeys",
                                          permissionKeys.filter((key) => key !== p.key)
                                        );
                                      }
                                    }}
                                  />
                                }
                                label={p.description || p.key}
                              />
                            ))}
                          </FormGroup>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </DialogContent>

              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}
