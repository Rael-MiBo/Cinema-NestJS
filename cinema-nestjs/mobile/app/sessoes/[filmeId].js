"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessoesScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const expo_router_2 = require("expo-router");
const client_1 = require("../../src/api/client");
const theme_1 = require("../../src/theme");
function SessoesScreen() {
    const { filmeId, titulo } = (0, expo_router_1.useLocalSearchParams)();
    const [sessoes, setSessoes] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const load = (0, react_1.useCallback)(async () => {
        setLoading(true);
        const data = await (0, client_1.api)(`/sessoes?filmeId=${filmeId}`);
        setSessoes(data);
        setLoading(false);
    }, [filmeId]);
    (0, expo_router_2.useFocusEffect)((0, react_1.useCallback)(() => {
        load();
    }, [load]));
    return (<>
      <expo_router_1.Stack.Screen options={{ title: titulo ?? 'Sessões' }}/>
      <react_native_1.View style={theme_1.shared.container}>
        {loading ? (<react_native_1.ActivityIndicator color="#3b82f6"/>) : (<react_native_1.FlatList data={sessoes} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => (<react_native_1.Pressable style={theme_1.shared.card} onPress={() => expo_router_1.router.push({
                    pathname: '/compra/[sessaoId]',
                    params: { sessaoId: String(item.id) },
                })}>
                <react_native_1.Text style={{ color: '#fff', fontWeight: '600' }}>
                  {new Date(item.data).toLocaleString('pt-BR')}
                </react_native_1.Text>
                <react_native_1.Text style={{ color: '#94a3b8', marginTop: 4 }}>
                  Sala {item.sala?.numero} · R$ {item.valorIngresso.toFixed(2)}
                </react_native_1.Text>
              </react_native_1.Pressable>)} ListEmptyComponent={<react_native_1.Text style={{ color: '#94a3b8' }}>Sem sessões para este filme.</react_native_1.Text>}/>)}
      </react_native_1.View>
    </>);
}
//# sourceMappingURL=%5BfilmeId%5D.js.map