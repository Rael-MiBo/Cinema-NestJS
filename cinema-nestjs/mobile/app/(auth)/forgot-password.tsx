import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { api } from '../../src/api/client';
import { shared } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const solicitar = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api<{ message: string; resetToken?: string }>(
        '/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email: email.trim() }), auth: false },
      );
      setMessage(res.message);
      if (res.resetToken) setToken(res.resetToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    }
  };

  return (
    <View style={shared.container}>
      <Text style={shared.title}>Recuperar senha</Text>
      {error ? <Text style={shared.error}>{error}</Text> : null}
      {message ? <Text style={{ color: '#22c55e', marginBottom: 8 }}>{message}</Text> : null}
      <TextInput style={shared.input} placeholder="E-mail" placeholderTextColor="#64748b" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Pressable style={shared.button} onPress={solicitar}>
        <Text style={shared.buttonText}>Gerar token</Text>
      </Pressable>
      {token ? (
        <Text style={{ color: '#fbbf24', marginTop: 16 }}>
          Token (demo): {token}{'\n'}Use na tela de redefinição.
        </Text>
      ) : null}
      <Link href={{ pathname: '/(auth)/reset-password', params: { token } }} style={shared.link}>
        Ir para redefinir senha
      </Link>
      <Link href="/(auth)/login" style={shared.link}>Voltar ao login</Link>
    </View>
  );
}
