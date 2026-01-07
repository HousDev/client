import { api } from "./Api";
export const getAllRoles = async () => {
  try {
    const response = await api.get(`/roles`);
    console.log(response, "response of all roles");
    return await response.data.data;
  } catch (error) {
    console.log(error, "errorr of users");
    alert(error);
  }
};
