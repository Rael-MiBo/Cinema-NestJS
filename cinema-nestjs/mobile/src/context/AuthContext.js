"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = __importStar(require("react"));
const client_1 = require("../api/client");
const sync_1 = require("../services/sync");
const AuthContext = (0, react_1.createContext)(null);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const applyAuth = (0, react_1.useCallback)(async (data) => {
        await (0, client_1.setToken)(data.access_token);
        setUser(data.user);
        try {
            await (0, sync_1.syncPedidosFromServer)();
        }
        catch {
        }
    }, []);
    const refreshUser = (0, react_1.useCallback)(async () => {
        const token = await (0, client_1.getToken)();
        if (!token) {
            setUser(null);
            return;
        }
        const me = await (0, client_1.api)('/auth/me');
        setUser({
            id: me.id,
            email: me.email,
            name: me.name,
            role: me.profile?.name ?? 'CLIENTE',
        });
        await (0, sync_1.syncPedidosFromServer)();
    }, []);
    (0, react_1.useEffect)(() => {
        (async () => {
            try {
                await refreshUser();
            }
            catch {
                await (0, client_1.setToken)(null);
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [refreshUser]);
    const login = async (email, password) => {
        const data = await (0, client_1.api)('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            auth: false,
        });
        await applyAuth(data);
    };
    const register = async (name, email, password) => {
        const data = await (0, client_1.api)('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
            auth: false,
        });
        await applyAuth(data);
    };
    const logout = async () => {
        await (0, client_1.setToken)(null);
        setUser(null);
    };
    return (<AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>);
}
function useAuth() {
    const ctx = (0, react_1.useContext)(AuthContext);
    if (!ctx)
        throw new Error('useAuth deve estar dentro de AuthProvider');
    return ctx;
}
//# sourceMappingURL=AuthContext.js.map