import axios from "axios";

const api = axios.create({
  baseURL: "https://crudcrud.com/api/f7341a137ee040b383f8049c0991c1f7",
  headers: { "Content-Type": "application/json" },
});

export default {
  getAll: () => api.get("/diskon"),
  create: (data) => api.post("/diskon", data),
  update: (id, data) => api.put(`/diskon/${id}`, data),
  delete: (id) => api.delete(`/diskon/${id}`),
};
