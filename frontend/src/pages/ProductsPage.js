import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";

const EMPTY_FORM = { name: "", sku: "", price: "", quantity: "", description: "" };

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price === "" || Number(form.price) < 0) e.price = "Valid price required";
    if (form.quantity === "" || Number(form.quantity) < 0) e.quantity = "Quantity ≥ 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, type = "text", extra = {}) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...extra}
      />
      {errors[key] && <p className="error-msg">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h2>{initial ? "Edit Product" : "Add Product"}</h2>
        {field("name", "Product Name", "text", { placeholder: "e.g. Wireless Mouse" })}
        {field("sku", "SKU / Code", "text", { placeholder: "e.g. WM-001" })}
        {field("price", "Price ($)", "number", { min: 0, step: "0.01", placeholder: "0.00" })}
        {field("quantity", "Quantity in Stock", "number", { min: 0, placeholder: "0" })}
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description…"
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : initial ? "Update" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () =>
    getProducts().then((r) => setProducts(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleAdd = async (payload) => {
    try {
      await createProduct(payload);
      toast.success("Product created!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create product");
    }
  };

  const handleEdit = async (payload) => {
    try {
      await updateProduct(editing.id, payload);
      toast.success("Product updated!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update product");
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete product");
    }
  };

  if (loading) return <div className="loading">Loading products…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} product{products.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && <ProductForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
      {editing && <ProductForm initial={editing} onSave={handleEdit} onCancel={() => setEditing(null)} />}

      <div className="card">
        <div className="table-wrapper">
          {products.length === 0 ? (
            <div className="empty-state"><p>No products yet. Click "Add Product" to get started.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description && <><br /><small style={{ color: "var(--gray-500)" }}>{p.description}</small></>}
                    </td>
                    <td><code>{p.sku}</code></td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity <= 10 ? "badge-warning" : "badge-success"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}