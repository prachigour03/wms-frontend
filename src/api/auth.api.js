import api from "./axios";


/**
 * LOGIN
 * POST /api/auth/login
 */
export const loginApi = async (payload) => {
  const res = await api.post("/api/auth/login", payload);
  return res.data;
};

/**
 * FORGOT PASSWORD (SEND OTP)
 * POST /api/auth/forgot-password
 */
export const forgotPasswordApi = async (email) => {
  const res = await api.post("/api/auth/forgot-password", { email });
  return res.data;
};

/**
 * VERIFY OTP
 * POST /api/auth/verify-otp
 */
export const verifyOtpApi = async ({ email, otp }) => {
  const res = await api.post("/api/auth/verify-otp", { email, otp });
  return res.data;
};

/**
 * RESET PASSWORD
 * POST /api/auth/reset-password
 */
export const resetPasswordApi = async ({ email, newPassword }) => {
  const res = await api.post("/api/auth/reset-password", {
    email,
    newPassword,
  });
  return res.data;
};
