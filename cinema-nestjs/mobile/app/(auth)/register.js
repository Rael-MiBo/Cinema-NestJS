"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegisterScreen;
const react_1 = require("react");
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const AuthContext_1 = require("../../src/context/AuthContext");
const theme_1 = require("../../src/theme");
function RegisterScreen() {
    const { register } = (0, AuthContext_1.useAuth)();
    const [name, setName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const onSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            await register(name.trim(), email.trim(), password);
            expo_router_1.router.replace('/(app)/filmes');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Falha no cadastro');
        }
        finally {
            setLoading(false);
        }
    };
    return (<react_native_1.View style={theme_1.shared.container}>
      <react_native_1.Text style={theme_1.shared.title}>Cadastro</react_native_1.Text>
      {error ? <react_native_1.Text style={theme_1.shared.error}>{error}</react_native_1.Text> : null}
      <react_native_1.TextInput style={theme_1.shared.input} placeholder="Nome" placeholderTextColor="#64748b" value={name} onChangeText={setName}/>
      <react_native_1.TextInput style={theme_1.shared.input} placeholder="E-mail" placeholderTextColor="#64748b" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <react_native_1.TextInput style={theme_1.shared.input} placeholder="Senha (mín. 6)" placeholderTextColor="#64748b" secureTextEntry value={password} onChangeText={setPassword}/>
      <react_native_1.Pressable style={theme_1.shared.button} onPress={onSubmit} disabled={loading}>
        <react_native_1.Text style={theme_1.shared.buttonText}>{loading ? 'Salvando...' : 'Registrar'}</react_native_1.Text>
      </react_native_1.Pressable>
      <expo_router_1.Link href="/(auth)/login" style={theme_1.shared.link}>Já tenho conta</expo_router_1.Link>
    </react_native_1.View>);
}
//# sourceMappingURL=register.js.map