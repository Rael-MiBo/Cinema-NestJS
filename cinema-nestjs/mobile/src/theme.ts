import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  primary: '#3b82f6',
  text: '#f8fafc',
  muted: '#94a3b8',
  danger: '#ef4444',
  success: '#22c55e',
};

export const shared = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: { color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: '#334155',
    color: colors.text,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: colors.primary, marginTop: 12, textAlign: 'center' },
  error: { color: colors.danger, marginBottom: 8 },
});
