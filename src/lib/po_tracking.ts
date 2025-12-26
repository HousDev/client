import axios from "axios";
import { api, unwrap } from "./Api"; // adjust import path if needed

async function getTrackings() {
  const res = await api.get("/po-material-tracking");
  return unwrap(res) ?? [];
}

export async function updateMaterialQty(id: any, payload: FormData) {
  const res = await axios.put(
    `${import.meta.env.VITE_API_URL}/po-material-tracking/${id}`,
    payload
  );
  return unwrap(res);
}

const po_trackingApi = {
  getTrackings,
  updateMaterialQty,
};
export default po_trackingApi;
