"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Index;
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const AuthContext_1 = require("../src/context/AuthContext");
function Index() {
    const { user, loading } = (0, AuthContext_1.useAuth)();
    if (loading) {
        return (<react_native_1.View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <react_native_1.ActivityIndicator color="#3b82f6"/>
      </react_native_1.View>);
    }
    if (user)
        return <expo_router_1.Redirect href="/(app)/filmes"/>;
    return <expo_router_1.Redirect href="/(auth)/login"/>;
}
//# sourceMappingURL=index.js.map