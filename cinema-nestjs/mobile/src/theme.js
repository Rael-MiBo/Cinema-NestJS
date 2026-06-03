"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shared = exports.colors = void 0;
const react_native_1 = require("react-native");
exports.colors = {
    bg: '#0f172a',
    card: '#1e293b',
    primary: '#3b82f6',
    text: '#f8fafc',
    muted: '#94a3b8',
    danger: '#ef4444',
    success: '#22c55e',
};
exports.shared = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: exports.colors.bg,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: exports.colors.text,
        marginBottom: 16,
    },
    card: {
        backgroundColor: exports.colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    label: { color: exports.colors.muted, marginBottom: 6 },
    input: {
        backgroundColor: '#334155',
        color: exports.colors.text,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    button: {
        backgroundColor: exports.colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '600' },
    link: { color: exports.colors.primary, marginTop: 12, textAlign: 'center' },
    error: { color: exports.colors.danger, marginBottom: 8 },
});
//# sourceMappingURL=theme.js.map