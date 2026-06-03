import type { Pedido } from '../types';
export declare function savePedidoLocal(pedido: Pedido, synced?: boolean): Promise<void>;
export declare function savePedidosFromServer(pedidos: Pedido[]): Promise<void>;
export declare function listPedidosLocal(): Promise<Pedido[]>;
export declare function getPedidoLocal(id: number): Promise<Pedido | null>;
