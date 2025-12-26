import { api } from "./Api";
const BACKEND_URL = import.meta.env.VITE_API_URL;
export const getAllRoles = async () => {
  try {
    const response = await api.get(`${BACKEND_URL}/roles`);
    console.log(response, "response of all roles");
    return await response.data.data;
  } catch (error) {
    console.log(error, "errorr of users");
    alert(error);
  }
};
