"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IngressosScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const tickets_1 = require("../../src/db/tickets");
const sync_1 = require("../../src/services/sync");
const theme_1 = require("../../src/theme");
function IngressosScreen() {
    const [pedidos, setPedidos] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const load = (0, react_1.useCallback)(async () => {
        setLoading(true);
        try {
            await (0, sync_1.syncPedidosFromServer)();
        }
        catch {
        }
        const local = await (0, tickets_1.listPedidosLocal)();
        setPedidos(local);
        setLoading(false);
    }, []);
    (0, expo_router_1.useFocusEffect)((0, react_1.useCallback)(() => {
        load();
    }, [load]));
    if (loading) {
        return (<react_native_1.View style={[theme_1.shared.container, { justifyContent: 'center' }]}>
        <react_native_1.ActivityIndicator color="#3b82f6"/>
      </react_native_1.View>);
    }
    return (<react_native_1.View style={theme_1.shared.container}>
      <react_native_1.Pressable style={[theme_1.shared.button, { marginBottom: 12 }]} onPress={load}>
        <react_native_1.Text style={theme_1.shared.buttonText}>Sincronizar com servidor</react_native_1.Text>
      </react_native_1.Pressable>
      <react_native_1.FlatList data={pedidos} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => (<react_native_1.Pressable style={theme_1.shared.card} onPress={() => expo_router_1.router.push({
                pathname: '/comprovante/[pedidoId]',
                params: { pedidoId: String(item.id) },
            })}>
            <react_native_1.Text style={{ color: '#fff', fontWeight: '600' }}>
              Pedido #{item.id} · R$ {item.valorTotal.toFixed(2)}
            </react_native_1.Text>
            <react_native_1.Text style={{ color: '#94a3b8', marginTop: 4 }}>
              {new Date(item.dataHora).toLocaleString('pt-BR')} · {item.status}
            </react_native_1.Text>
            <react_native_1.Text style={{ color: '#cbd5e1', marginTop: 4 }}>
              {item.ingressos.length} ingresso(s)
              {item.lanches.length ? ` · ${item.lanches.length} combo(s)` : ''}
            </react_native_1.Text>
          </react_native_1.Pressable>)} ListEmptyComponent={<react_native_1.Text style={{ color: '#94a3b8' }}>Nenhum ingresso ainda. Compre na aba Filmes.</react_native_1.Text>}/>
    </react_native_1.View>);
}
//# sourceMappingURL=ingressos.js.map