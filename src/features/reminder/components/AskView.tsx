import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen, Text } from '@/shared/ui';
import { CloseButton } from './CloseButton';
import { MarkerLine } from './MarkerLine';
import { PillButton } from './PillButton';
import { StaticRings } from './StaticRings';

interface AskViewProps {
  // False for the first ask at the prayer time (Figma 4), true for the 10 minute re-ask (Figma 6).
  again: boolean;
  prayerLabel: string;
  timeText: string;
  askedLine: string;
  onYes: () => void;
  onNotYet: () => void;
  onClose: () => void;
}

export function AskView({ again, prayerLabel, timeText, askedLine, onYes, onNotYet, onClose }: AskViewProps) {
  return (
    <Screen tone="dark">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.closeRow}>
          <CloseButton onPress={onClose} />
        </View>
        <Text variant="overline" color="onDark" style={styles.overline}>
          {again ? 'STILL TIME TO PRAY' : 'TIME TO PRAY'}
        </Text>
        <Text variant="askName" color="onDark" style={styles.name}>
          {prayerLabel}
        </Text>
        {again ? (
          <Text variant="label" color="onDark" style={styles.sub}>
            {askedLine}
          </Text>
        ) : (
          <Text variant="bodyMedium" color="onDark" style={styles.sub}>
            {timeText}
          </Text>
        )}
        <View style={styles.rings}>
          <StaticRings />
        </View>
        <Text
          variant={again ? 'askQuestionLong' : 'askQuestion'}
          color="onDark"
          accessibilityRole="header"
          style={[styles.question, again ? styles.questionAgain : styles.questionFirst]}
        >
          {again ? 'Have you prayed already?' : 'Did you pray?'}
        </Text>
        <View style={[styles.buttons, again ? styles.buttonsAgain : styles.buttonsFirst]}>
          <PillButton label="Yes, I prayed" variant="primary" onPress={onYes} />
          <PillButton label="Not yet" variant="ghost" onPress={onNotYet} />
        </View>
        <View style={styles.marker}>
          <MarkerLine text="Allah knows what you hide." />
        </View>
        {again ? (
          <>
            <View style={styles.fill} />
            <Text variant="tiny" color="onDark" style={styles.footer}>
              We will ask again in 10 minutes.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center' },
  fill: { flex: 1 },
  closeRow: { alignSelf: 'stretch', alignItems: 'flex-end', marginTop: 8 },
  overline: { opacity: 0.6, marginTop: 16, textAlign: 'center' },
  name: { marginTop: 6, textAlign: 'center' },
  sub: { opacity: 0.7, marginTop: 2, textAlign: 'center' },
  rings: { marginTop: 24 },
  question: { textAlign: 'center' },
  questionFirst: { marginTop: 62 },
  questionAgain: { marginTop: 40, maxWidth: 342 },
  buttons: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  buttonsFirst: { marginTop: 62 },
  buttonsAgain: { marginTop: 50 },
  marker: { marginTop: 20 },
  footer: { opacity: 0.5, textAlign: 'center', paddingTop: 16 },
});
