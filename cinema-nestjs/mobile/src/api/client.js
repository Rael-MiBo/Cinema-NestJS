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
exports.getToken = getToken;
exports.setToken = setToken;
exports.api = api;
const config_1 = require("../config");
const SecureStore = __importStar(require("expo-secure-store"));
const TOKEN_KEY = 'cinema_jwt';
async function getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}
async function setToken(token) {
    if (!token) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}
async function api(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (options.auth !== false) {
        const token = await getToken();
        if (token)
            headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${config_1.API_URL}${path}`, {
        ...options,
        headers,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const message = data?.message ??
            (Array.isArray(data?.message) ? data.message.join(', ') : null) ??
            `Erro ${res.status}`;
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
    return data;
}
//# sourceMappingURL=client.js.map