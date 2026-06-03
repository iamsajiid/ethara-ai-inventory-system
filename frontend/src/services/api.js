import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Products
export const getProducts = () => api.get("/products/");
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products/", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getLowStock = (threshold = 10) =>
  api.get(`/products/low-stock?threshold=${threshold}`);

// Customers
export const getCustomers = () => api.get("/customers/");
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post("/customers/", data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Orders
export const getOrders = (status = null) =>
  api.get("/orders/", { params: status ? { status } : {} });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post("/orders/", data);
export const fulfillOrder = (id) => api.patch(`/orders/${id}/fulfill`, {});
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Dashboard
export const getDashboardSummary = () => api.get("/dashboard/summary");

export default api;