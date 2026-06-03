"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginScreen;
const react_1 = require("react");
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const AuthContext_1 = require("../../src/context/AuthContext");
const theme_1 = require("../../src/theme");
function LoginScreen() {
    const { login } = (0, AuthContext_1.useAuth)();
    const [email, setEmail] = (0, react_1.useState)('demo@cinema.com');
    const [password, setPassword] = (0, react_1.useState)('123456');
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const onSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            await login(email.trim(), password);
            expo_router_1.router.replace('/(app)/filmes');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Falha no login');
        }
        finally {
            setLoading(false);
        }
    };
    return (<react_native_1.View style={theme_1.shared.container}>
      <react_native_1.Text style={theme_1.shared.title}>Cinema</react_native_1.Text>
      {error ? <react_native_1.Text style={theme_1.shared.error}>{error}</react_native_1.Text> : null}
      <react_native_1.Text style={theme_1.shared.label}>E-mail</react_native_1.Text>
      <react_native_1.TextInput style={theme_1.shared.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <react_native_1.Text style={theme_1.shared.label}>Senha</react_native_1.Text>
      <react_native_1.TextInput style={theme_1.shared.input} secureTextEntry value={password} onChangeText={setPassword}/>
      <react_native_1.Pressable style={theme_1.shared.button} onPress={onSubmit} disabled={loading}>
        <react_native_1.Text style={theme_1.shared.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</react_native_1.Text>
      </react_native_1.Pressable>
      <expo_router_1.Link href="/(auth)/register" style={theme_1.shared.link}>
        Criar conta
      </expo_router_1.Link>
      <expo_router_1.Link href="/(auth)/forgot-password" style={theme_1.shared.link}>
        Esqueci minha senha
      </expo_router_1.Link>
    </react_native_1.View>);
}
//# sourceMappingURL=login.js.map