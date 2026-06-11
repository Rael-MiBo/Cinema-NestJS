import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api/client';
import { SeatMap } from '../../src/components/SeatMap';
import { savePedidoLocal } from '../../src/db/tickets';
import type {
  LancheCombo,
  Pedido,
  Sessao,
  SeatSelection,
} from '../../src/types';
import { shared, colors } from '../../src/theme';

type Step = 'assentos' | 'lanches' | 'pagamento';

export default function CompraScreen() {
  const { sessaoId } = useLocalSearchParams<{ sessaoId: string }>();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [lanches, setLanches] = useState<LancheCombo[]>([]);
  const [step, setStep] = useState<Step>('assentos');
  const [selected, setSelected] = useState<SeatSelection[]>([]);
  const [lancheIds, setLancheIds] = useState<number[]>([]);
  const [metodo, setMetodo] = useState('PIX');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([
          api<Sessao>(`/sessoes/${sessaoId}`),
          api<LancheCombo[]>('/lanches-combos'),
        ]);
        setSessao(s);
        setLanches(l.filter((x) => x.qtUnidade > 0));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessaoId]);

  const toggleSeat = useCallback((seat: SeatSelection) => {
    setSelected((prev) => {
      const exists = prev.find(
        (s) => s.fila === seat.fila && s.assento === seat.assento,
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.fila === seat.fila && s.assento === seat.assento),
        );
      }
      return [...prev, { ...seat, tipo: 'inteira' }];
    });
  }, []);

  const toggleTipo = (fila: number, assento: number) => {
    setSelected((prev) =>
      prev.map((s) =>
        s.fila === fila && s.assento === assento
          ? { ...s, tipo: s.tipo === 'inteira' ? 'meia' : 'inteira' }
          : s,
      ),
    );
  };

  const toggleLanche = (id: number) => {
    setLancheIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const totalIngressos = useMemo(() => {
    if (!sessao) return 0;
    return selected.reduce((acc, s) => {
      const v =
        s.tipo === 'meia' ? sessao.valorIngresso / 2 : sessao.valorIngresso;
      return acc + v;
    }, 0);
  }, [selected, sessao]);

  const totalLanches = useMemo(
    () =>
      lancheIds.reduce((acc, id) => {
        const l = lanches.find((x) => x.id === id);
        return acc + (l?.valorUnitario ?? 0);
      }, 0),
    [lancheIds, lanches],
  );

  const total = totalIngressos + totalLanches;

  const pagar = async () => {
    if (!selected.length) {
      setError('Selecione ao menos um assento.');
      return;
    }
    setPaying(true);
    setError('');
    try {
      const pedido = await api<Pedido>('/pedidos/checkout', {
        method: 'POST',
        body: JSON.stringify({
          sessaoId: Number(sessaoId),
          ingressos: selected.map((s) => ({
            fila: s.fila,
            assento: s.assento,
            tipo: s.tipo,
          })),
          lancheComboIds: lancheIds,
          metodoPagamento: metodo,
        }),
      });
      await savePedidoLocal(pedido, true);
      router.replace({
        pathname: '/comprovante/[pedidoId]',
        params: { pedidoId: String(pedido.id) },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pagamento falhou');
    } finally {
      setPaying(false);
    }
  };

  if (loading || !sessao) {
    return (
      <View style={[shared.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  const mapa = (sessao.sala?.poltronas as number[][]) ?? [];
  const ocupados = sessao.ingressos ?? [];

  return (
    <>
      <Stack.Screen options={{ title: sessao.filme?.titulo ?? 'Compra' }} />
      <ScrollView style={shared.container}>
        {error ? <Text style={shared.error}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['assentos', 'lanches', 'pagamento'] as Step[]).map((s) => (
            <Text
              key={s}
              style={{
                color: step === s ? colors.primary : colors.muted,
                fontWeight: step === s ? '700' : '400',
              }}
            >
              {s === 'assentos'
                ? '1.Assentos'
                : s === 'lanches'
                  ? '2.Lanches'
                  : '3.Pagar'}
            </Text>
          ))}
        </View>

        {step === 'assentos' && (
          <>
            <SeatMap
              mapa={mapa}
              ocupados={ocupados}
              selected={selected}
              onToggle={toggleSeat}
            />
            {selected.map((s) => (
              <Pressable
                key={`${s.fila}-${s.assento}`}
                style={[
                  shared.card,
                  { flexDirection: 'row', justifyContent: 'space-between' },
                ]}
                onPress={() => toggleTipo(s.fila, s.assento)}
              >
                <Text style={{ color: '#fff' }}>
                  Fila {s.fila + 1} · Assento {s.assento + 1}
                </Text>
                <Text style={{ color: colors.primary }}>
                  {s.tipo.toUpperCase()} (toque para alternar)
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[shared.button, { marginTop: 12 }]}
              onPress={() => selected.length && setStep('lanches')}
            >
              <Text style={shared.buttonText}>Continuar</Text>
            </Pressable>
          </>
        )}

        {step === 'lanches' && (
          <>
            {lanches.map((l) => (
              <Pressable
                key={l.id}
                style={[
                  shared.card,
                  lancheIds.includes(l.id) && {
                    borderWidth: 2,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => toggleLanche(l.id)}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {l.nome}
                </Text>
                <Text style={{ color: '#94a3b8' }}>
                  R$ {l.valorUnitario.toFixed(2)}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={shared.button}
              onPress={() => setStep('pagamento')}
            >
              <Text style={shared.buttonText}>Ir para pagamento</Text>
            </Pressable>
          </>
        )}

        {step === 'pagamento' && (
          <>
            <Text style={{ color: '#fff', marginBottom: 8 }}>
              Total: R$ {total.toFixed(2)}
            </Text>
            {['PIX', 'Cartão', 'Dinheiro'].map((m) => (
              <Pressable
                key={m}
                style={[
                  shared.card,
                  metodo === m && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setMetodo(m)}
              >
                <Text style={{ color: '#fff' }}>{m}</Text>
              </Pressable>
            ))}
            <Pressable style={shared.button} onPress={pagar} disabled={paying}>
              <Text style={shared.buttonText}>
                {paying ? 'Processando...' : 'Confirmar pagamento'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}
