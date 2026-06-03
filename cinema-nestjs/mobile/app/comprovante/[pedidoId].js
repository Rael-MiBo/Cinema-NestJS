"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ComprovanteScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const tickets_1 = require("../../src/db/tickets");
const client_1 = require("../../src/api/client");
const tickets_2 = require("../../src/db/tickets");
const theme_1 = require("../../src/theme");
function ComprovanteScreen() {
    const { pedidoId } = (0, expo_router_1.useLocalSearchParams)();
    const [pedido, setPedido] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (async () => {
            const id = Number(pedidoId);
            let p = await (0, tickets_1.getPedidoLocal)(id);
            if (!p) {
                try {
                    p = await (0, client_1.api)(`/pedidos/${pedidoId}`);
                    await (0, tickets_2.savePedidoLocal)(p, true);
                }
                catch {
                }
            }
            setPedido(p);
        })();
    }, [pedidoId]);
    if (!pedido) {
        return (<react_native_1.View style={[theme_1.shared.container, { justifyContent: 'center' }]}>
        <react_native_1.ActivityIndicator color="#3b82f6"/>
      </react_native_1.View>);
    }
    return (<>
      <expo_router_1.Stack.Screen options={{ title: 'Comprovante' }}/>
      <react_native_1.ScrollView style={theme_1.shared.container}>
        <react_native_1.View style={theme_1.shared.card}>
          <react_native_1.Text style={{ color: '#22c55e', fontSize: 20, fontWeight: '700' }}>
            Pagamento confirmado
          </react_native_1.Text>
          <react_native_1.Text style={{ color: '#94a3b8', marginTop: 8 }}>
            Pedido #{pedido.id}
          </react_native_1.Text>
          <react_native_1.Text style={{ color: '#94a3b8' }}>
            {new Date(pedido.dataHora).toLocaleString('pt-BR')}
          </react_native_1.Text>
          <react_native_1.Text style={{ color: '#fff', marginTop: 12, fontSize: 18 }}>
            Total: R$ {pedido.valorTotal.toFixed(2)}
          </react_native_1.Text>
          {pedido.metodoPagamento ? (<react_native_1.Text style={{ color: '#cbd5e1' }}>
              Pagamento: {pedido.metodoPagamento}
            </react_native_1.Text>) : null}
        </react_native_1.View>

        <react_native_1.Text style={theme_1.shared.title}>Ingressos</react_native_1.Text>
        {pedido.ingressos.map((ing) => (<react_native_1.View key={ing.id} style={theme_1.shared.card}>
            <react_native_1.Text style={{ color: '#fff', fontWeight: '600' }}>
              {ing.sessao?.filme?.titulo ?? 'Filme'}
            </react_native_1.Text>
            <react_native_1.Text style={{ color: '#94a3b8' }}>
              {ing.sessao?.data
                ? new Date(ing.sessao.data).toLocaleString('pt-BR')
                : ''}{' '}
              · Sala {ing.sessao?.sala?.numero}
            </react_native_1.Text>
            <react_native_1.Text style={{ color: '#cbd5e1', marginTop: 4 }}>
              Fila {ing.fila + 1} · Assento {ing.assento + 1} · {ing.tipo} · R${' '}
              {ing.valorPago.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>))}

        {pedido.lanches.length > 0 && (<>
            <react_native_1.Text style={theme_1.shared.title}>Combos</react_native_1.Text>
            {pedido.lanches.map((item) => (<react_native_1.View key={item.lanche.id} style={theme_1.shared.card}>
                <react_native_1.Text style={{ color: '#fff' }}>
                  {item.quantidade}x {item.lanche.nome}
                </react_native_1.Text>
              </react_native_1.View>))}
          </>)}

        <react_native_1.Text style={{ color: '#64748b', textAlign: 'center', marginTop: 24 }}>
          Apresente este comprovante na entrada. Dados salvos localmente e sincronizados com o servidor.
        </react_native_1.Text>
      </react_native_1.ScrollView>
    </>);
}
//# sourceMappingURL=%5BpedidoId%5D.js.map