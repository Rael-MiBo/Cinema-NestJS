import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { shared } from '../../src/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(app)/filmes');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={shared.container}>
      <Text style={shared.title}>Cadastro</Text>
      {error ? <Text style={shared.error}>{error}</Text> : null}
      <TextInput style={shared.input} placeholder="Nome" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
      <TextInput style={shared.input} placeholder="E-mail" placeholderTextColor="#64748b" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={shared.input} placeholder="Senha (mín. 6)" placeholderTextColor="#64748b" secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={shared.button} onPress={onSubmit} disabled={loading}>
        <Text style={shared.buttonText}>{loading ? 'Salvando...' : 'Registrar'}</Text>
      </Pressable>
      <Link href="/(auth)/login" style={shared.link}>Já tenho conta</Link>
    </View>
  );
}
