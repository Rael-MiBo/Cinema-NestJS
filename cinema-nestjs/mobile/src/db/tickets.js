"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePedidoLocal = savePedidoLocal;
exports.savePedidosFromServer = savePedidosFromServer;
exports.listPedidosLocal = listPedidosLocal;
exports.getPedidoLocal = getPedidoLocal;
const SQLite = __importStar(require("expo-sqlite"));
let db = null;
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
async function savePedidoLocal(pedido, synced = true) {
    const conn = await database();
    await conn.runAsync(`INSERT OR REPLACE INTO pedidos_local (id, payload, synced, updated_at)
     VALUES (?, ?, ?, ?)`, pedido.id, JSON.stringify(pedido), synced ? 1 : 0, new Date().toISOString());
}
async function savePedidosFromServer(pedidos) {
    for (const p of pedidos) {
        await savePedidoLocal(p, true);
    }
}
async function listPedidosLocal() {
    const conn = await database();
    const rows = await conn.getAllAsync('SELECT payload FROM pedidos_local ORDER BY updated_at DESC');
    return rows.map((r) => JSON.parse(r.payload));
}
async function getPedidoLocal(id) {
    const conn = await database();
    const row = await conn.getFirstAsync('SELECT payload FROM pedidos_local WHERE id = ?', id);
    return row ? JSON.parse(row.payload) : null;
}
//# sourceMappingURL=tickets.js.map