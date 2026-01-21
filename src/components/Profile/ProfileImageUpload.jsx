import { useRef, useState, useEffect } from "react";
import { Box, Avatar, Button } from "@mui/material";
import { updateProfile } from "../../api/profile.api";

const BACKEND_URL = "http://localhost:5001";

export default function ProfileImageUpload({ profile, setProfile }) {
  const inputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     Sync image when profile updates
  =============================== */
  useEffect(() => {
    if (profile?.profileImage) {
      setImage(`${BACKEND_URL}${profile.profileImage}`);
    }
  }, [profile]);

  /* ===============================
     Handle file selection
  =============================== */
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  /* ===============================
     Upload image
  =============================== */
  const handleUpload = async () => {
    if (!file || !profile?.id) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await updateProfile(profile.id, formData);

      if (res?.success) {
        setProfile(res.data);
        setFile(null);
      }
    } catch (error) {
      console.error("Profile image upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center">
      <Avatar
        src={image}
        sx={{ width: 120, height: 120, margin: "auto" }}
      />

      <input
        type="file"
        accept="image/*"
        hidden
        ref={inputRef}
        onChange={handleImageChange}
      />

      <Box mt={2} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          onClick={() => inputRef.current.click()}
        >
          Choose Image
        </Button>

        {file && (
          <Button
            variant="contained"
            color="success"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
