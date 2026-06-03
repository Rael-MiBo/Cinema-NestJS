import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { shared } from '../../src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@cinema.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(app)/filmes');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={shared.container}>
      <Text style={shared.title}>Cinema</Text>
      {error ? <Text style={shared.error}>{error}</Text> : null}
      <Text style={shared.label}>E-mail</Text>
      <TextInput
        style={shared.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={shared.label}>Senha</Text>
      <TextInput
        style={shared.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={shared.button} onPress={onSubmit} disabled={loading}>
        <Text style={shared.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </Pressable>
      <Link href="/(auth)/register" style={shared.link}>
        Criar conta
      </Link>
      <Link href="/(auth)/forgot-password" style={shared.link}>
        Esqueci minha senha
      </Link>
    </View>
  );
}
