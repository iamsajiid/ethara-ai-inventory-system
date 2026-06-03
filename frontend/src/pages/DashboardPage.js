import React, { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (error) return (
    <div className="empty-state" style={{ color: "var(--danger)" }}>{error}</div>
  );

  const stats = [
    { label: "Total Products", value: summary.total_products, cls: "primary" },
    { label: "Total Customers", value: summary.total_customers, cls: "success" },
    { label: "Total Orders", value: summary.total_orders, cls: "" },
    { label: "Low Stock Items", value: summary.low_stock_products.length, cls: "warning" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your inventory and orders</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          {summary.low_stock_products.length > 0 ? (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--warning)" }}>
                ⚠️ Low Stock Alerts
              </h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Qty Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.low_stock_products.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td><code>{p.sku}</code></td>
                        <td>
                          <span
                            className={`badge ${
                              p.quantity === 0 ? "badge-danger" : "badge-warning"
                            }`}
                          >
                            {p.quantity} left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>✅ All products are well stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}