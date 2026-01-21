import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// API
import { getLocations } from "../../api/Locations.api";
import { getSubsidiaries } from "../../api/Subsidiaries.api";
import { createEmployee } from "../../api/Employees.api";
import { useCrudNotification } from "../../hooks/useCrudNotification";

/* ---------------- VALIDATION ---------------- */
const EmployeeSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  password: Yup.string()
    .min(6, "Min 6 characters")
    .required("Password is required"),
  designation: Yup.string().required("Designation is required"),
  locationId: Yup.string().required("Work location is required"),
  subsidiaryId: Yup.string().required("Subsidiary is required"),
});

export default function AddEmployee() {
  const [locations, setLocations] = useState([]);
  const [subsidiaries, setSubsidiaries] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const { notifySuccess } = useCrudNotification();

  /* ---------------- FETCH DROPDOWNS ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await getLocations();
        const subRes = await getSubsidiaries();

        setLocations(Array.isArray(locRes?.data?.data) ? locRes.data.data : []);
        setSubsidiaries(Array.isArray(subRes?.data?.data) ? subRes.data.data : []);
      } catch (error) {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load dropdown data",
        });
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h5" mb={3}>
        Add Employee
      </Typography>

      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          designation: "",
          locationId: "",
          subsidiaryId: "",
        }}
        validationSchema={EmployeeSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            await createEmployee(values);
            notifySuccess("Employee added successfully");

            setSnack({
              open: true,
              severity: "success",
              message: "Employee added successfully",
            });

            resetForm();
          } catch (error) {
            setSnack({
              open: true,
              severity: "error",
              message:
                error?.response?.data?.message || "Failed to add employee",
            });
          }
        }}
      >
        {({ values, errors, touched, handleChange }) => (
          <Form noValidate>
            {/* PERSONAL INFO */}
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Personal Information
            </Typography>

            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              margin="normal"
              value={values.firstName}
              onChange={handleChange}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
            />

            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              margin="normal"
              value={values.lastName}
              onChange={handleChange}
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={values.email}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />

            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              margin="normal"
              value={values.phone}
              onChange={handleChange}
              error={touched.phone && Boolean(errors.phone)}
              helperText={touched.phone && errors.phone}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={values.password}
              onChange={handleChange}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />

            <Divider sx={{ my: 3 }} />

            {/* PROFESSIONAL INFO */}
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Professional Information
            </Typography>

            <TextField
              label="Designation"
              name="designation"
              fullWidth
              margin="normal"
              value={values.designation}
              onChange={handleChange}
              error={touched.designation && Boolean(errors.designation)}
              helperText={touched.designation && errors.designation}
            />

            <TextField
              select
              label="Work Location (City)"
              name="locationId"
              fullWidth
              margin="normal"
              value={values.locationId}
              onChange={handleChange}
              error={touched.locationId && Boolean(errors.locationId)}
              helperText={touched.locationId && errors.locationId}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.locationName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Subsidiary"
              name="subsidiaryId"
              fullWidth
              margin="normal"
              value={values.subsidiaryId}
              onChange={handleChange}
              error={touched.subsidiaryId && Boolean(errors.subsidiaryId)}
              helperText={touched.subsidiaryId && errors.subsidiaryId}
            >
              {subsidiaries.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Add Employee
            </Button>
          </Form>
        )}
      </Formik>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
