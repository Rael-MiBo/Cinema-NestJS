"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL = void 0;
const expo_constants_1 = __importDefault(require("expo-constants"));
const fallback = 'http://localhost:3000';
exports.API_URL = process.env.EXPO_PUBLIC_API_URL ??
    expo_constants_1.default.expoConfig?.extra?.apiUrl ??
    fallback;
//# sourceMappingURL=config.js.map