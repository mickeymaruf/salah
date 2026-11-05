import { StyleSheet, View } from 'react-native';
import { CloudSun, Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react-native';
import { colors } from '@/shared/theme';
import type { PrayerName } from '../calculate';

const ICONS: Record<PrayerName, LucideIcon> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

// Four faint copies of the prayer's icon and two dots, scattered in the middle of the pill (Figma "Particles").
// Positions are fixed so a pill looks the same every time; each prayer shifts them slightly so the five differ.
const SPOTS = [
  { x: 158, y: 12, size: 22, tilt: -8 },
  { x: 204, y: 34, size: 15, tilt: 10 },
  { x: 246, y: 9, size: 26, tilt: 6 },
  { x: 294, y: 32, size: 18, tilt: -12 },
] as const;
const DOTS = [
  { x: 192, y: 12, size: 3 },
  { x: 274, y: 49, size: 4 },
] as const;
const OPACITY = 0.16;

interface PrayerParticlesProps {
  prayer: PrayerName;
  // Green once the prayer's time has come, grey before.
  passed: boolean;
  index: number;
}

export function PrayerParticles({ prayer, passed, index }: PrayerParticlesProps) {
  const Icon = ICONS[prayer];
  const color = passed ? colors.brand.green : colors.ink.muted;
  const shift = (index % 3) * 4 - 4;
  const flip = index % 2 === 0 ? 1 : -1;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {SPOTS.map((spot) => (
        <View
          key={spot.x}
          style={[
            styles.item,
            { left: spot.x + shift, top: spot.y, opacity: OPACITY, transform: [{ rotate: `${spot.tilt * flip}deg` }] },
          ]}
        >
          <Icon size={spot.size} color={color} strokeWidth={1.1} />
        </View>
      ))}
      {DOTS.map((dot) => (
        <View
          key={dot.x}
          style={[
            styles.item,
            { left: dot.x + shift, top: dot.y, width: dot.size, height: dot.size, borderRadius: dot.size / 2, backgroundColor: color, opacity: OPACITY },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { position: 'absolute' },
});
