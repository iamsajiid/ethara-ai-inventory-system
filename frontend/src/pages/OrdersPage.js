import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from "../services/api";

function OrderForm({ customers, products, onSave, onCancel }) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = "Please select a customer";
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) e.items = "Add at least one product with quantity > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, key, val) =>
    setItems(items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)));

  const estimatedTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === parseInt(item.product_id));
    if (!product || !item.quantity) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        customer_id: parseInt(customerId),
        items: items
          .filter((i) => i.product_id && i.quantity > 0)
          .map((i) => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-modal" style={{ maxWidth: 560 }}>
        <h2>Create New Order</h2>
        <div className="form-group">
          <label>Customer</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">— Select a customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
            ))}
          </select>
          {errors.customer && <p className="error-msg">{errors.customer}</p>}
        </div>
        <div className="form-group">
          <label>Order Items</label>
          <div className="order-items-list">
            {items.map((item, idx) => (
              <div className="order-item-row" key={idx}>
                <select value={item.product_id}
                  onChange={(e) => updateItem(idx, "product_id", e.target.value)}>
                  <option value="">— Product —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} (${p.price.toFixed(2)}, {p.quantity} in stock)
                    </option>
                  ))}
                </select>
                <input type="number" min={1} value={item.quantity} placeholder="Qty"
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                <button className="remove-item-btn" onClick={() => removeItem(idx)}
                  disabled={items.length === 1} title="Remove item">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {errors.items && <p className="error-msg">{errors.items}</p>}
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={addItem}>
            <Plus size={13} /> Add Item
          </button>
        </div>
        {estimatedTotal > 0 && (
          <p style={{ fontSize: 14, color: "var(--gray-700)", marginBottom: 4 }}>
            <strong>Estimated Total:</strong> ${estimatedTotal.toFixed(2)}
            <span style={{ fontSize: 12, color: "var(--gray-500)", marginLeft: 6 }}>
              (final calculated by server)
            </span>
          </p>
        )}
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Placing…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, customers, products, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const customer = customers.find((c) => c.id === order.customer_id);

  return (
    <>
      <tr>
        <td><strong>#{order.id}</strong></td>
        <td>{customer ? customer.full_name : `Customer #${order.customer_id}`}</td>
        <td>${Number(order.total_amount).toFixed(2)}</td>
        <td><span className="badge badge-primary">{order.status}</span></td>
        <td style={{ color: "var(--gray-500)", fontSize: 13 }}>
          {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(order)}>
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} style={{ background: "var(--gray-50)", padding: 0 }}>
            <div style={{ padding: "12px 24px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--gray-700)" }}>
                Order Items:
              </p>
              <table style={{ width: "auto" }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 11 }}>Product</th>
                    <th style={{ fontSize: 11 }}>Unit Price</th>
                    <th style={{ fontSize: 11 }}>Qty</th>
                    <th style={{ fontSize: 11 }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const product = products.find((p) => p.id === item.product_id);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontSize: 13 }}>{product ? product.name : `Product #${item.product_id}`}</td>
                        <td style={{ fontSize: 13 }}>${Number(item.unit_price).toFixed(2)}</td>
                        <td style={{ fontSize: 13 }}>{item.quantity}</td>
                        <td style={{ fontSize: 13 }}>${Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(oRes.data);
      setCustomers(cRes.data);
      setProducts(pRes.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    try {
      await createOrder(payload);
      toast.success("Order placed!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to place order");
    }
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Cancel Order #${order.id}? Inventory will be restored.`)) return;
    try {
      await deleteOrder(order.id);
      toast.success(`Order #${order.id} cancelled`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to cancel order");
    }
  };

  if (loading) return <div className="loading">Loading orders…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}
          disabled={customers.length === 0 || products.length === 0}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {showForm && (
        <OrderForm customers={customers} products={products}
          onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      <div className="card">
        <div className="table-wrapper">
          {orders.length === 0 ? (
            <div className="empty-state"><p>No orders yet. Click "New Order" to create one.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Total</th>
                  <th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order}
                    customers={customers} products={products} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}