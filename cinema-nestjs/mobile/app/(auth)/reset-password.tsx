import { useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { api } from '../../src/api/client';
import { shared } from '../../src/theme';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    try {
      const res = await api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: token.trim(), newPassword }),
        auth: false,
      });
      setMessage(res.message);
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    }
  };

  return (
    <View style={shared.container}>
      <Text style={shared.title}>Nova senha</Text>
      {error ? <Text style={shared.error}>{error}</Text> : null}
      {message ? <Text style={{ color: '#22c55e', marginBottom: 8 }}>{message}</Text> : null}
      <TextInput style={shared.input} placeholder="Token" placeholderTextColor="#64748b" value={token} onChangeText={setToken} />
      <TextInput style={shared.input} placeholder="Nova senha" placeholderTextColor="#64748b" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <Pressable style={shared.button} onPress={onSubmit}>
        <Text style={shared.buttonText}>Redefinir</Text>
      </Pressable>
      <Link href="/(auth)/login" style={shared.link}>Login</Link>
    </View>
  );
}
