import { api } from '../api/client';
import { savePedidosFromServer } from '../db/tickets';
import type { Pedido } from '../types';

export async function syncPedidosFromServer(): Promise<Pedido[]> {
  const pedidos = await api<Pedido[]>('/pedidos/me');
  await savePedidosFromServer(pedidos);
  return pedidos;
}
