import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Switch,
  Snackbar,
  Alert,
  Chip,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import { Delete, ModeEdit } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/NewUsers.api.js";
import { getAllRolesApi } from "../../api/roles.api.js";
import { getAllPermissionsApi } from "../../api/permissions.api.js";
import PermissionGuard from "../../auth/PermissionGuard";

/* ===================== VALIDATION ===================== */

const UserSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email().required("Email is required"),
  password: Yup.string().when("id", {
    is: (id) => !id,
    then: (s) => s.required("Password is required"),
  }),
  roleId: Yup.string().required("Role is required"),
});

export default function NewUsers() {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isCustomPermissions, setIsCustomPermissions] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [permUser, setPermUser] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const rowsPerPage = 5;

  /* ===================== DATA ===================== */

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: rolesRes } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRolesApi,
  });

  const { data: permissionsRes } = useQuery({
    queryKey: ["permissions"],
    queryFn: getAllPermissionsApi,
  });

  const users = usersRes?.users || [];
  const roles = rolesRes?.roles || [];
  const groupedPermissions = permissionsRes?.permissions || {};

  /* ===================== MUTATIONS ===================== */

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries(["users"]);
      setOpen(false);
      setSnack({
        open: true,
        severity: "success",
        message: "User created successfully",
      });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create user";
      setSnack({ open: true, severity: "error", message });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["users"]);
      setOpen(false);
      setSnack({
        open: true,
        severity: "success",
        message: "User updated successfully",
      });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user";
      setSnack({ open: true, severity: "error", message });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries(["users"]);
      setSnack({
        open: true,
        severity: "success",
        message: "User deleted successfully",
      });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete user";
      setSnack({ open: true, severity: "error", message });
    },
  });

  const handleCloseDialog = () => {
    setOpen(false);
    setEditId(null);
    setSelectedUser(null);
    setSelectedRoleId("");
    setIsCustomPermissions(false);
  };

  /* ===================== HELPERS ===================== */

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, page]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId),
    [roles, selectedRoleId]
  );

  const rolePermissionKeys = useMemo(() => {
    return selectedRole?.Permissions?.map((p) => `${p.module}:${p.action}`) || [];
  }, [selectedRole]);

  const initialPermissionKeys = useMemo(() => {
    if (selectedUser?.permissions?.length) return selectedUser.permissions;
    return rolePermissionKeys;
  }, [selectedUser, rolePermissionKeys]);

  const permUserRole = useMemo(() => {
    if (!permUser?.roleId) return "";
    return roles.find((r) => r.id === permUser.roleId)?.name || "";
  }, [permUser, roles]);

  const totalPermissionCount = useMemo(
    () => (Array.isArray(permUser?.permissions) ? permUser.permissions.length : 0),
    [permUser]
  );

  const groupedUserPermissions = useMemo(() => {
    const perms = permUser?.permissions || [];
    return perms.reduce((acc, key) => {
      const [module, action] = (key || "").split(":");
      if (!module || !action) {
        acc.other = acc.other || [];
        acc.other.push(key);
        return acc;
      }
      acc[module] = acc[module] || [];
      acc[module].push(action);
      return acc;
    }, {});
  }, [permUser]);

  /* ===================== UI ===================== */

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Users</Typography>
        <PermissionGuard permission="users:create">
          <Button
            variant="contained"
            onClick={() => {
              setEditId(null);
              setSelectedUser(null);
              setSelectedRoleId("");
              setIsCustomPermissions(false);
              setOpen(true);
            }}
          >
            Add User
          </Button>
        </PermissionGuard>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              paginated?.map((u, i) => (
                <TableRow key={u.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {roles.find((r) => r.id === u.roleId)?.name}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip size="small" label={u.permissions?.length || 0} />
                      <Tooltip title="View permissions">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setPermUser(u);
                            setPermOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <PermissionGuard permission="users:update">
                      <IconButton
                        onClick={() => {
                          setEditId(u.id);
                          setSelectedUser(u);
                          setSelectedRoleId(u.roleId);
                          setIsCustomPermissions(Boolean(u.UserPermissions?.length));
                          setOpen(true);
                        }}
                      >
                        <ModeEdit />
                      </IconButton>
                    </PermissionGuard>
                    <PermissionGuard permission="users:delete">
                      <IconButton
                        color="error"
                        onClick={() => deleteMut.mutate(u.id)}
                      >
                        <Delete />
                      </IconButton>
                    </PermissionGuard>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
        count={Math.ceil(users.length / rowsPerPage)}
        page={page}
        onChange={(_, v) => setPage(v)}
      />

      {/* ===================== MODAL ===================== */}

      <Dialog open={open} onClose={handleCloseDialog} fullWidth>
        <Formik
          enableReinitialize
          initialValues={{
            id: editId || "",
            name: selectedUser?.name || "",
            email: selectedUser?.email || "",
            password: "",
            roleId: selectedRoleId,
            permissionKeys: initialPermissionKeys,
          }}
          validationSchema={UserSchema}
          onSubmit={(v) => {
            const { permissionKeys, ...rest } = v;
            const payload = { ...rest };

            if (isCustomPermissions) {
              payload.permissionKeys = permissionKeys;
            } else if (editId && selectedUser?.UserPermissions?.length) {
              payload.permissionKeys = [];
            }

            editId
              ? updateMut.mutate({ id: editId, data: payload })
              : createMut.mutate(payload);
          }}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <DialogTitle>{editId ? "Edit User" : "Add User"}</DialogTitle>

              <DialogContent>
                <Field
                  as={TextField}
                  fullWidth
                  name="name"
                  label="Name"
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email"
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  fullWidth
                  name="password"
                  type="password"
                  label="Password"
                  sx={{ mb: 2 }}
                />

                <Field
                  as={TextField}
                  select
                  fullWidth
                  name="roleId"
                  label="Role"
                  onChange={(e) => {
                    const newRoleId = e.target.value;
                    const role = roles.find((r) => r.id === newRoleId);
                    const nextPermissionKeys =
                      role?.Permissions?.map((p) => `${p.module}:${p.action}`) || [];

                    setFieldValue("roleId", newRoleId);
                    setSelectedRoleId(newRoleId);
                    setFieldValue("permissionKeys", nextPermissionKeys);
                    setIsCustomPermissions(false);
                  }}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Field>
                {roles.length === 0 && (
                  <Typography color="error" mt={1}>
                    No roles available. Create roles first.
                  </Typography>
                )}

                {/* ===== PERMISSIONS ===== */}
                <Box mt={3} display="flex" alignItems="center" gap={2}>
                  <Typography fontWeight={600}>Role Permissions</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isCustomPermissions}
                        onChange={(e) => setIsCustomPermissions(e.target.checked)}
                      />
                    }
                    label="Customize for user"
                  />
                </Box>

                {Object.entries(groupedPermissions).length === 0 ? (
                  <Typography color="text.secondary" mt={1}>
                    No permissions found. Create permissions first.
                  </Typography>
                ) : (
                  Object.entries(groupedPermissions).map(([module, perms]) => (
                    <Box key={module} mt={1} p={1} border="1px solid #ddd">
                      <Typography fontWeight={600}>{module}</Typography>
                      <FormGroup row>
                        {perms.map((p) => {
                          const checked = values.permissionKeys.includes(p.key);
                          return (
                            <FormControlLabel
                              key={p.key}
                              control={
                                <Checkbox
                                  checked={checked}
                                  disabled={!isCustomPermissions}
                                  onChange={() => {
                                    if (!isCustomPermissions) return;
                                    const next = checked
                                      ? values.permissionKeys.filter((k) => k !== p.key)
                                      : [...values.permissionKeys, p.key];
                                    setFieldValue("permissionKeys", next);
                                  }}
                                />
                              }
                              label={p.description}
                            />
                          );
                        })}
                      </FormGroup>
                    </Box>
                  ))
                )}

              </DialogContent>

              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog
        open={permOpen}
        onClose={() => {
          setPermOpen(false);
          setPermUser(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Permissions</DialogTitle>
        <DialogContent>
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} mb={2}>
            <Typography fontWeight={600}>{permUser?.name || "User"}</Typography>
            {permUserRole ? (
              <Chip size="small" label={`Role: ${permUserRole}`} />
            ) : null}
            <Chip size="small" label={`Total: ${totalPermissionCount}`} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          {Object.keys(groupedUserPermissions).length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No permissions assigned.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {Object.entries(groupedUserPermissions).map(([module, actions]) => (
                <Grid key={module} item xs={12} sm={6} md={4}>
                  <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography fontWeight={600} sx={{ textTransform: "capitalize" }}>
                        {module === "other"
                          ? "Other"
                          : module.replace(/_/g, " ")}
                      </Typography>
                      <Chip size="small" label={actions.length} />
                    </Box>
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                      {actions.map((action) => {
                        const key = module === "other" ? action : `${module}:${action}`;
                        return (
                          <Chip
                            key={key}
                            label={key}
                            size="small"
                            variant="outlined"
                          />
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPermOpen(false);
              setPermUser(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
