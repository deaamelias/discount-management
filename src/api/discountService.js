import axios from "axios";

const api = axios.create({
  baseURL: "https://crudcrud.com/api/9ab605bfe68b4c0f964d6857b35920d4",
  headers: { "Content-Type": "application/json" },
});

export default {
  getAll: () => api.get("/diskon"),
  create: (data) => api.post("/diskon", data),
  update: (id, data) => api.put(`/diskon/${id}`, data),
  delete: (id) => api.delete(`/diskon/${id}`),
};
