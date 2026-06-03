"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResetPasswordScreen;
const react_1 = require("react");
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const client_1 = require("../../src/api/client");
const theme_1 = require("../../src/theme");
function ResetPasswordScreen() {
    const params = (0, expo_router_1.useLocalSearchParams)();
    const [token, setToken] = (0, react_1.useState)(params.token ?? '');
    const [newPassword, setNewPassword] = (0, react_1.useState)('');
    const [message, setMessage] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const onSubmit = async () => {
        setError('');
        try {
            const res = await (0, client_1.api)('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token: token.trim(), newPassword }),
                auth: false,
            });
            setMessage(res.message);
            setTimeout(() => expo_router_1.router.replace('/(auth)/login'), 1500);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Erro');
        }
    };
    return (<react_native_1.View style={theme_1.shared.container}>
      <react_native_1.Text style={theme_1.shared.title}>Nova senha</react_native_1.Text>
      {error ? <react_native_1.Text style={theme_1.shared.error}>{error}</react_native_1.Text> : null}
      {message ? <react_native_1.Text style={{ color: '#22c55e', marginBottom: 8 }}>{message}</react_native_1.Text> : null}
      <react_native_1.TextInput style={theme_1.shared.input} placeholder="Token" placeholderTextColor="#64748b" value={token} onChangeText={setToken}/>
      <react_native_1.TextInput style={theme_1.shared.input} placeholder="Nova senha" placeholderTextColor="#64748b" secureTextEntry value={newPassword} onChangeText={setNewPassword}/>
      <react_native_1.Pressable style={theme_1.shared.button} onPress={onSubmit}>
        <react_native_1.Text style={theme_1.shared.buttonText}>Redefinir</react_native_1.Text>
      </react_native_1.Pressable>
      <expo_router_1.Link href="/(auth)/login" style={theme_1.shared.link}>Login</expo_router_1.Link>
    </react_native_1.View>);
}
//# sourceMappingURL=reset-password.js.map