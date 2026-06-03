"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPedidosFromServer = syncPedidosFromServer;
const client_1 = require("../api/client");
const tickets_1 = require("../db/tickets");
async function syncPedidosFromServer() {
    const pedidos = await (0, client_1.api)('/pedidos/me');
    await (0, tickets_1.savePedidosFromServer)(pedidos);
    return pedidos;
}
//# sourceMappingURL=sync.js.map