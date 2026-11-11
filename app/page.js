"use client";

import { useEffect, useState } from "react";

const empty = { name: "", category: "", price: "", quantity: "" };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load products");
      return;
    }
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not add the product");
      return;
    }
    setForm(empty);
    load();
  }

  async function changeStock(p, direction) {
    const text = prompt(
      direction === 1 ? `Add how many "${p.name}"?` : `Remove how many "${p.name}"?`
    );
    const amount = Math.floor(Number(text));
    if (!text || !(amount > 0)) return;

    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, change: amount * direction }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Something went wrong");
      return;
    }
    load();
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    load();
  }

  const shown = products.filter((p) =>
    `${p.name} ${p.category ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Vulcanizing Shop Inventory</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-header">Add product</div>
        <div className="card-body">
          <form onSubmit={addProduct} className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Name (e.g. Motorcycle tire)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Category (Tire, Tube...)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-dark w-100">Add</button>
            </div>
          </form>
        </div>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">No products yet.</td>
                </tr>
              )}
              {shown.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₱{Number(p.price).toFixed(2)}</td>
                  <td>
                    {p.quantity}
                    {p.quantity <= p.low_stock_level && (
                      <span className="badge bg-danger ms-2">Low</span>
                    )}
                  </td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-success me-1" onClick={() => changeStock(p, 1)}>
                      + Stock
                    </button>
                    <button className="btn btn-sm btn-warning me-1" onClick={() => changeStock(p, -1)}>
                      - Stock
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}