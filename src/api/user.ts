import api from "@/lib/axios";

export const getUser = async () => {
  try {
    const response = await api.get("/api/", {
        withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};