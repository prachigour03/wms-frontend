import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import ProfileImageUpload from "../../components/Profile/ProfileImageUpload";
import { getMyProfile, updateProfileData } from "../../api/profile.api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH LOGGED-IN PROFILE
     ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        // backend returns { success, data }
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* =========================
     HANDLE INPUT CHANGE
     ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     UPDATE PROFILE
     ========================= */
  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      // Send only updatable fields
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        department: profile.department,
        bio: profile.bio,
        status: profile.status,
      };

      const res = await updateProfileData(profile.id, payload);
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!loading && !profile) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">Failed to load profile. Please try refreshing the page.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        mt: 5,
        p: 3,
        border: "1px solid #ddd",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Admin Profile
        </Typography>

        {/* =========================
            PROFILE IMAGE
           ========================= */}
        <Box display="flex" justifyContent="center" my={4}>
          <ProfileImageUpload profile={profile} setProfile={setProfile} />
        </Box>

        <Typography variant="h6" gutterBottom>
          Profile Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={ 12 } md={ 6 }>
            <Typography variant="subtitle2">First Name</Typography>
            <TextField
              fullWidth
              size="small"
              name="firstName"
              value={profile.firstName || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <Typography variant="subtitle2">Last Name</Typography>
            <TextField
              fullWidth
              size="small"
              name="lastName"
              value={profile.lastName || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <Typography variant="subtitle2">Email</Typography>
            <TextField
              fullWidth
              size="small"
              value={profile.email || ""}
              disabled
              sx={{ bgcolor: "#f5f5f5" }}
            />
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <Typography variant="subtitle2">Phone</Typography>
            <TextField
              fullWidth
              size="small"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <Typography variant="subtitle2">Role</Typography>
            <TextField
              fullWidth
              size="small"
              value={profile.role || "Admin"}
              disabled
              sx={{ bgcolor: "#f5f5f5" }}
            />
          </Grid>

          <Grid item xs={ 12 } md={ 6 }>
            <Typography variant="subtitle2">Department</Typography>
            <TextField
              fullWidth
              size="small"
              name="department"
              value={profile.department || ""}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={ 12 }>
            <Typography variant="subtitle2">Bio</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="bio"
              value={profile.bio || ""}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
