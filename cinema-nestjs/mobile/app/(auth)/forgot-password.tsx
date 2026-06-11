import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { api } from '../../src/api/client';
import { shared } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'token' | 'reset'>('email');

  const solicitarReset = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api<{ message: string; resetToken?: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email: email.trim() }),
          auth: false,
        },
      );
      setMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
        setStep('reset');
      } else {
        setStep('token');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={shared.container}>
      <Text style={shared.title}>
        {step === 'email' && 'Recuperar Senha'}
        {step === 'token' && 'Verificar Token'}
        {step === 'reset' && 'Nova Senha'}
      </Text>
      {error ? <Text style={shared.error}>{error}</Text> : null}
      {message ? (
        <Text style={{ color: '#22c55e', marginBottom: 12, fontSize: 14 }}>
          {message}
        </Text>
      ) : null}

      {step === 'email' && (
        <>
          <Text style={shared.label}>E-mail cadastrado</Text>
          <TextInput
            style={shared.input}
            placeholder="seu@email.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Pressable
            style={shared.button}
            onPress={solicitarReset}
            disabled={loading || !email.trim()}
          >
            <Text style={shared.buttonText}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </Text>
          </Pressable>
        </>
      )}

      {step === 'token' && (
        <>
          <Text style={shared.label}>Código de recuperação</Text>
          <TextInput
            style={shared.input}
            placeholder="Digite o código recebido"
            placeholderTextColor="#64748b"
            value={token}
            onChangeText={setToken}
          />
          <Pressable
            style={shared.button}
            onPress={() => {
              if (token.trim()) setStep('reset');
              else setError('Digite o código de recuperação');
            }}
          >
            <Text style={shared.buttonText}>Continuar</Text>
          </Pressable>
        </>
      )}

      {step === 'reset' && (
        <>
          <Link
            href={{ pathname: '/(auth)/reset-password', params: { token } }}
            style={shared.link}
          >
            Ir para redefinir senha
          </Link>
        </>
      )}

      <Link href="/(auth)/login" style={shared.link}>
        Voltar ao login
      </Link>
    </View>
  );
}
