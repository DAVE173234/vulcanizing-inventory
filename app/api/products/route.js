import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY name");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const price = Math.max(0, Number(body.price) || 0);
    const quantity = Math.max(0, Math.floor(Number(body.quantity) || 0));
    const category = String(body.category ?? "").trim() || null;

    const result = await pool.query(
      `INSERT INTO products (name, category, price, quantity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, category, price, quantity]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Add or remove stock: change = 5 adds 5, change = -2 removes 2
export async function PATCH(request) {
  try {
    const { id, change } = await request.json();
    const amount = Math.floor(Number(change));
    if (!id || !amount) {
      return NextResponse.json({ error: "Enter a valid number" }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE products SET quantity = quantity + $1
       WHERE id = $2 AND quantity + $1 >= 0 RETURNING *`,
      [amount, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}