"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatMap = SeatMap;
const react_native_1 = require("react-native");
function SeatMap({ mapa, ocupados, selected, onToggle }) {
    const isOcupado = (fila, assento) => ocupados.some((o) => o.fila === fila && o.assento === assento);
    const isSelected = (fila, assento) => selected.some((s) => s.fila === fila && s.assento === assento);
    return (<react_native_1.View style={styles.wrap}>
      <react_native_1.Text style={styles.screen}>TELA</react_native_1.Text>
      {mapa.map((row, fila) => (<react_native_1.View key={fila} style={styles.row}>
          <react_native_1.Text style={styles.rowLabel}>{fila + 1}</react_native_1.Text>
          {row.map((cell, assento) => {
                if (cell !== 1)
                    return <react_native_1.View key={assento} style={styles.gap}/>;
                const ocupado = isOcupado(fila, assento);
                const sel = isSelected(fila, assento);
                return (<react_native_1.Pressable key={assento} disabled={ocupado} onPress={() => onToggle({
                        fila,
                        assento,
                        tipo: sel
                            ? selected.find((s) => s.fila === fila && s.assento === assento).tipo
                            : 'inteira',
                    })} style={[
                        styles.seat,
                        ocupado && styles.occupied,
                        sel && styles.selected,
                    ]}>
                <react_native_1.Text style={styles.seatText}>{assento + 1}</react_native_1.Text>
              </react_native_1.Pressable>);
            })}
        </react_native_1.View>))}
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    wrap: { gap: 6, alignItems: 'center' },
    screen: {
        color: '#94a3b8',
        marginBottom: 12,
        letterSpacing: 4,
        fontWeight: '700',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rowLabel: { width: 18, color: '#64748b', fontSize: 12 },
    gap: { width: 28, height: 28 },
    seat: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
    occupied: { backgroundColor: '#7f1d1d' },
    selected: { backgroundColor: '#2563eb' },
    seatText: { color: '#fff', fontSize: 10 },
});
//# sourceMappingURL=SeatMap.js.map