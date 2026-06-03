"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootLayout;
const expo_router_1 = require("expo-router");
const expo_status_bar_1 = require("expo-status-bar");
const AuthContext_1 = require("../src/context/AuthContext");
function RootLayout() {
    return (<AuthContext_1.AuthProvider>
      <expo_status_bar_1.StatusBar style="light"/>
      <expo_router_1.Stack screenOptions={{ headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#0f172a' } }}/>
    </AuthContext_1.AuthProvider>);
}
//# sourceMappingURL=_layout.js.map