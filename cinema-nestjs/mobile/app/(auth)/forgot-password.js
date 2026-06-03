"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ForgotPasswordScreen;
const react_1 = require("react");
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const client_1 = require("../../src/api/client");
const theme_1 = require("../../src/theme");
function ForgotPasswordScreen() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [token, setToken] = (0, react_1.useState)('');
    const [message, setMessage] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const solicitar = async () => {
        setError('');
        setMessage('');
        try {
            const res = await (0, client_1.api)('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.trim() }), auth: false });
            setMessage(res.message);
            if (res.resetToken)
                setToken(res.resetToken);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Erro');
        }
    };
    return (<react_native_1.View style={theme_1.shared.container}>
      <react_native_1.Text style={theme_1.shared.title}>Recuperar senha</react_native_1.Text>
      {error ? <react_native_1.Text style={theme_1.shared.error}>{error}</react_native_1.Text> : null}
      {message ? <react_native_1.Text style={{ color: '#22c55e', marginBottom: 8 }}>{message}</react_native_1.Text> : null}
      <react_native_1.TextInput style={theme_1.shared.input} placeholder="E-mail" placeholderTextColor="#64748b" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <react_native_1.Pressable style={theme_1.shared.button} onPress={solicitar}>
        <react_native_1.Text style={theme_1.shared.buttonText}>Gerar token</react_native_1.Text>
      </react_native_1.Pressable>
      {token ? (<react_native_1.Text style={{ color: '#fbbf24', marginTop: 16 }}>
          Token (demo): {token}{'\n'}Use na tela de redefinição.
        </react_native_1.Text>) : null}
      <expo_router_1.Link href={{ pathname: '/(auth)/reset-password', params: { token } }} style={theme_1.shared.link}>
        Ir para redefinir senha
      </expo_router_1.Link>
      <expo_router_1.Link href="/(auth)/login" style={theme_1.shared.link}>Voltar ao login</expo_router_1.Link>
    </react_native_1.View>);
}
//# sourceMappingURL=forgot-password.js.map