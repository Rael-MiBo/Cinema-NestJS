"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppLayout;
const expo_router_1 = require("expo-router");
const react_native_1 = require("react-native");
const AuthContext_1 = require("../../src/context/AuthContext");
function AppLayout() {
    const { logout, user } = (0, AuthContext_1.useAuth)();
    return (<expo_router_1.Tabs screenOptions={{
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            tabBarStyle: { backgroundColor: '#1e293b' },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#94a3b8',
            headerRight: () => (<react_native_1.Pressable onPress={async () => {
                    await logout();
                    expo_router_1.router.replace('/(auth)/login');
                }} style={{ marginRight: 12 }}>
            <react_native_1.Text style={{ color: '#ef4444' }}>Sair</react_native_1.Text>
          </react_native_1.Pressable>),
            title: user?.name ?? 'Cinema',
        }}>
      <expo_router_1.Tabs.Screen name="filmes" options={{ title: 'Filmes', tabBarLabel: 'Filmes' }}/>
      <expo_router_1.Tabs.Screen name="ingressos" options={{ title: 'Meus ingressos', tabBarLabel: 'Ingressos' }}/>
    </expo_router_1.Tabs>);
}
//# sourceMappingURL=_layout.js.map