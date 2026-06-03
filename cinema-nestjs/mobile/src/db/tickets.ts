import * as SQLite from 'expo-sqlite';
import type { Pedido } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

async function database() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('cinema.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pedidos_local (
        id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function savePedidoLocal(pedido: Pedido, synced = true) {
  const conn = await database();
  await conn.runAsync(
    `INSERT OR REPLACE INTO pedidos_local (id, payload, synced, updated_at)
     VALUES (?, ?, ?, ?)`,
    pedido.id,
    JSON.stringify(pedido),
    synced ? 1 : 0,
    new Date().toISOString(),
  );
}

export async function savePedidosFromServer(pedidos: Pedido[]) {
  for (const p of pedidos) {
    await savePedidoLocal(p, true);
  }
}

export async function listPedidosLocal(): Promise<Pedido[]> {
  const conn = await database();
  const rows = await conn.getAllAsync<{ payload: string }>(
    'SELECT payload FROM pedidos_local ORDER BY updated_at DESC',
  );
  return rows.map((r) => JSON.parse(r.payload) as Pedido);
}

export async function getPedidoLocal(id: number): Promise<Pedido | null> {
  const conn = await database();
  const row = await conn.getFirstAsync<{ payload: string }>(
    'SELECT payload FROM pedidos_local WHERE id = ?',
    id,
  );
  return row ? (JSON.parse(row.payload) as Pedido) : null;
}
