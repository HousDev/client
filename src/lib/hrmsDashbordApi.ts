// src/lib/itemsApi.ts
import { api, unwrap } from "../lib/Api";

export const hrmsDashbordApi = {
  // ✅ GET ALL ITEMS
  getItems: async (): Promise<any> => unwrap(api.get("/items")),
};

export default hrmsDashbordApi;
