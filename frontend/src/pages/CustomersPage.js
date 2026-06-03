import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { getCustomers, createCustomer, deleteCustomer } from "../services/api";

const EMPTY_FORM = { full_name: "", email: "", phone: "" };

function CustomerForm({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h2>Add Customer</h2>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Jane Doe"
          />
          {errors.full_name && <p className="error-msg">{errors.full_name}</p>}
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 555 000 0000"
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    getCustomers().then((r) => setCustomers(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleAdd = async (payload) => {
    try {
      await createCustomer(payload);
      toast.success("Customer added!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add customer");
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.full_name}"?`)) return;
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete customer");
    }
  };

  if (loading) return <div className="loading">Loading customers…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} customer{customers.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {showForm && <CustomerForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}

      <div className="card">
        <div className="table-wrapper">
          {customers.length === 0 ? (
            <div className="empty-state">
              <p>No customers yet. Click "Add Customer" to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="hide-mobile">Phone</th>
                  <th className="hide-mobile">Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.full_name}</strong></td>
                    <td style={{ wordBreak: "break-word", maxWidth: 200 }}>{c.email}</td>
                    <td className="hide-mobile">
                      {c.phone || <span style={{ color: "var(--gray-300)" }}>—</span>}
                    </td>
                    <td className="hide-mobile" style={{ color: "var(--gray-500)", fontSize: 13 }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c)}
                        title="Delete customer"
                      >
                        <Trash2 size={13} />
                      </button>
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