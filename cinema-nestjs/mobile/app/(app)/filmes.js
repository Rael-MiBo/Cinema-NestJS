"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FilmesScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const expo_router_1 = require("expo-router");
const client_1 = require("../../src/api/client");
const theme_1 = require("../../src/theme");
function FilmesScreen() {
    const [filmes, setFilmes] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const load = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await (0, client_1.api)('/filmes');
            setFilmes(data);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao carregar filmes');
        }
        finally {
            setLoading(false);
        }
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
      {error ? <react_native_1.Text style={theme_1.shared.error}>{error}</react_native_1.Text> : null}
      <react_native_1.FlatList data={filmes} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => (<react_native_1.Pressable style={theme_1.shared.card} onPress={() => expo_router_1.router.push({
                pathname: '/sessoes/[filmeId]',
                params: { filmeId: String(item.id), titulo: item.titulo },
            })}>
            <react_native_1.Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {item.titulo}
            </react_native_1.Text>
            <react_native_1.Text style={{ color: '#94a3b8', marginTop: 4 }}>
              {item.genero?.nome} · {item.duracao} min · {item.classificacao}
            </react_native_1.Text>
            {item.sinopse ? (<react_native_1.Text style={{ color: '#cbd5e1', marginTop: 8 }} numberOfLines={2}>
                {item.sinopse}
              </react_native_1.Text>) : null}
          </react_native_1.Pressable>)} ListEmptyComponent={<react_native_1.Text style={{ color: '#94a3b8' }}>Nenhum filme cadastrado. Rode o seed da API.</react_native_1.Text>}/>
    </react_native_1.View>);
}
//# sourceMappingURL=filmes.js.map