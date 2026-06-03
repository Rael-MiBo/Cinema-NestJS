"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompraScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const client_1 = require("../../src/api/client");
const SeatMap_1 = require("../../src/components/SeatMap");
const tickets_1 = require("../../src/db/tickets");
const theme_1 = require("../../src/theme");
function CompraScreen() {
    const { sessaoId } = (0, expo_router_1.useLocalSearchParams)();
    const [sessao, setSessao] = (0, react_1.useState)(null);
    const [lanches, setLanches] = (0, react_1.useState)([]);
    const [step, setStep] = (0, react_1.useState)('assentos');
    const [selected, setSelected] = (0, react_1.useState)([]);
    const [lancheIds, setLancheIds] = (0, react_1.useState)([]);
    const [metodo, setMetodo] = (0, react_1.useState)('PIX');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [paying, setPaying] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        (async () => {
            try {
                const [s, l] = await Promise.all([
                    (0, client_1.api)(`/sessoes/${sessaoId}`),
                    (0, client_1.api)('/lanches-combos'),
                ]);
                setSessao(s);
                setLanches(l.filter((x) => x.qtUnidade > 0));
            }
            catch (e) {
                setError(e instanceof Error ? e.message : 'Erro');
            }
            finally {
                setLoading(false);
            }
        })();
    }, [sessaoId]);
    const toggleSeat = (0, react_1.useCallback)((seat) => {
        setSelected((prev) => {
            const exists = prev.find((s) => s.fila === seat.fila && s.assento === seat.assento);
            if (exists) {
                return prev.filter((s) => !(s.fila === seat.fila && s.assento === seat.assento));
            }
            return [...prev, { ...seat, tipo: 'inteira' }];
        });
    }, []);
    const toggleTipo = (fila, assento) => {
        setSelected((prev) => prev.map((s) => s.fila === fila && s.assento === assento
            ? { ...s, tipo: s.tipo === 'inteira' ? 'meia' : 'inteira' }
            : s));
    };
    const toggleLanche = (id) => {
        setLancheIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };
    const totalIngressos = (0, react_1.useMemo)(() => {
        if (!sessao)
            return 0;
        return selected.reduce((acc, s) => {
            const v = s.tipo === 'meia' ? sessao.valorIngresso / 2 : sessao.valorIngresso;
            return acc + v;
        }, 0);
    }, [selected, sessao]);
    const totalLanches = (0, react_1.useMemo)(() => lancheIds.reduce((acc, id) => {
        const l = lanches.find((x) => x.id === id);
        return acc + (l?.valorUnitario ?? 0);
    }, 0), [lancheIds, lanches]);
    const total = totalIngressos + totalLanches;
    const pagar = async () => {
        if (!selected.length) {
            setError('Selecione ao menos um assento.');
            return;
        }
        setPaying(true);
        setError('');
        try {
            const pedido = await (0, client_1.api)('/pedidos/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    sessaoId: Number(sessaoId),
                    ingressos: selected.map((s) => ({
                        fila: s.fila,
                        assento: s.assento,
                        tipo: s.tipo,
                    })),
                    lancheComboIds: lancheIds,
                    metodoPagamento: metodo,
                }),
            });
            await (0, tickets_1.savePedidoLocal)(pedido, true);
            expo_router_1.router.replace({
                pathname: '/comprovante/[pedidoId]',
                params: { pedidoId: String(pedido.id) },
            });
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Pagamento falhou');
        }
        finally {
            setPaying(false);
        }
    };
    if (loading || !sessao) {
        return (<react_native_1.View style={[theme_1.shared.container, { justifyContent: 'center' }]}>
        <react_native_1.ActivityIndicator color="#3b82f6"/>
      </react_native_1.View>);
    }
    const mapa = sessao.sala?.poltronas ?? [];
    const ocupados = sessao.ingressos ?? [];
    return (<>
      <expo_router_1.Stack.Screen options={{ title: sessao.filme?.titulo ?? 'Compra' }}/>
      <react_native_1.ScrollView style={theme_1.shared.container}>
        {error ? <react_native_1.Text style={theme_1.shared.error}>{error}</react_native_1.Text> : null}

        <react_native_1.View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['assentos', 'lanches', 'pagamento'].map((s) => (<react_native_1.Text key={s} style={{
                color: step === s ? theme_1.colors.primary : theme_1.colors.muted,
                fontWeight: step === s ? '700' : '400',
            }}>
              {s === 'assentos' ? '1.Assentos' : s === 'lanches' ? '2.Lanches' : '3.Pagar'}
            </react_native_1.Text>))}
        </react_native_1.View>

        {step === 'assentos' && (<>
            <SeatMap_1.SeatMap mapa={mapa} ocupados={ocupados} selected={selected} onToggle={toggleSeat}/>
            {selected.map((s) => (<react_native_1.Pressable key={`${s.fila}-${s.assento}`} style={[theme_1.shared.card, { flexDirection: 'row', justifyContent: 'space-between' }]} onPress={() => toggleTipo(s.fila, s.assento)}>
                <react_native_1.Text style={{ color: '#fff' }}>
                  Fila {s.fila + 1} · Assento {s.assento + 1}
                </react_native_1.Text>
                <react_native_1.Text style={{ color: theme_1.colors.primary }}>
                  {s.tipo.toUpperCase()} (toque para alternar)
                </react_native_1.Text>
              </react_native_1.Pressable>))}
            <react_native_1.Pressable style={[theme_1.shared.button, { marginTop: 12 }]} onPress={() => selected.length && setStep('lanches')}>
              <react_native_1.Text style={theme_1.shared.buttonText}>Continuar</react_native_1.Text>
            </react_native_1.Pressable>
          </>)}

        {step === 'lanches' && (<>
            {lanches.map((l) => (<react_native_1.Pressable key={l.id} style={[
                    theme_1.shared.card,
                    lancheIds.includes(l.id) && { borderWidth: 2, borderColor: theme_1.colors.primary },
                ]} onPress={() => toggleLanche(l.id)}>
                <react_native_1.Text style={{ color: '#fff', fontWeight: '600' }}>{l.nome}</react_native_1.Text>
                <react_native_1.Text style={{ color: '#94a3b8' }}>R$ {l.valorUnitario.toFixed(2)}</react_native_1.Text>
              </react_native_1.Pressable>))}
            <react_native_1.Pressable style={theme_1.shared.button} onPress={() => setStep('pagamento')}>
              <react_native_1.Text style={theme_1.shared.buttonText}>Ir para pagamento</react_native_1.Text>
            </react_native_1.Pressable>
          </>)}

        {step === 'pagamento' && (<>
            <react_native_1.Text style={{ color: '#fff', marginBottom: 8 }}>
              Total: R$ {total.toFixed(2)}
            </react_native_1.Text>
            {['PIX', 'Cartão', 'Dinheiro'].map((m) => (<react_native_1.Pressable key={m} style={[theme_1.shared.card, metodo === m && { borderColor: theme_1.colors.primary, borderWidth: 2 }]} onPress={() => setMetodo(m)}>
                <react_native_1.Text style={{ color: '#fff' }}>{m}</react_native_1.Text>
              </react_native_1.Pressable>))}
            <react_native_1.Pressable style={theme_1.shared.button} onPress={pagar} disabled={paying}>
              <react_native_1.Text style={theme_1.shared.buttonText}>
                {paying ? 'Processando...' : 'Confirmar pagamento'}
              </react_native_1.Text>
            </react_native_1.Pressable>
          </>)}
      </react_native_1.ScrollView>
    </>);
}
//# sourceMappingURL=%5BsessaoId%5D.js.map