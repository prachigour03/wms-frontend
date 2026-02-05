import axios from "../utils/axios";

export const getDashboardOverview = async (range) => {
  const res = await axios.get("/api/dashboard/overview", { params: { range } });
  return res.data;
};
