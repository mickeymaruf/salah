import { StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';
import { PRAYER_NAMES, type PrayerName } from '../calculate';
import { lastReachedIndex, type TimelineKind } from '../timeline';

const LINE = 1.5;
const DOT = 10;
const DOT_CURRENT = 12;
const HALO = 22;
const HOLLOW_BORDER = 2;

interface TimelineProps {
  kinds: Record<PrayerName, TimelineKind>;
  // Distance from the top of the list to the middle of the first pill, then the step from one pill to the next.
  firstCentre: number;
  step: number;
  // Where the line sits across the list: the middle of the dots.
  centreX: number;
}

// The line and dots to the left of the pills. Green for prayers whose time has passed, a haloed dot for the one in
// progress, hollow dots on the grey line for the ones to come. Each dot lines up with the middle of its pill.
export function Timeline({ kinds, firstCentre, step, centreX }: TimelineProps) {
  const last = PRAYER_NAMES.length - 1;
  const reached = lastReachedIndex(kinds);
  const centre = (index: number) => firstCentre + index * step;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.line, { left: centreX - LINE / 2, top: centre(0), height: last * step, backgroundColor: colors.line.soft }]} />
      {reached > 0 ? (
        <View style={[styles.line, { left: centreX - LINE / 2, top: centre(0), height: reached * step, backgroundColor: colors.brand.green }]} />
      ) : null}
      {PRAYER_NAMES.map((name, index) => {
        const kind = kinds[name];
        const size = kind === 'current' ? DOT_CURRENT : DOT;
        return (
          <View key={name}>
            {kind === 'current' ? (
              <View
                style={[styles.dot, { left: centreX - HALO / 2, top: centre(index) - HALO / 2, width: HALO, height: HALO, borderRadius: HALO / 2, backgroundColor: colors.halo }]}
              />
            ) : null}
            <View
              style={[
                styles.dot,
                { left: centreX - size / 2, top: centre(index) - size / 2, width: size, height: size, borderRadius: size / 2 },
                kind === 'upcoming'
                  ? { backgroundColor: colors.bg.surface, borderWidth: HOLLOW_BORDER, borderColor: colors.line.soft }
                  : { backgroundColor: colors.brand.green },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  line: { position: 'absolute', width: LINE, borderRadius: 1 },
  dot: { position: 'absolute' },
});
