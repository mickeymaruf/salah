import { ScrollView, StyleSheet, View } from 'react-native';
import { Screen, Text } from '@/shared/ui';
import { VERSE_LABELS, type Verse } from '../verses';
import { CloseButton } from './CloseButton';
import { PillButton } from './PillButton';

interface VerseViewProps {
  verse: Verse;
  onPrayNow: () => void;
  onClose: () => void;
}

// Figma 5: the verse for a "Not yet". Both buttons close the screen. The next ask comes in 10 minutes.
export function VerseView({ verse, onPrayNow, onClose }: VerseViewProps) {
  return (
    <Screen tone="dark">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.closeRow}>
          <CloseButton onPress={onClose} />
        </View>
        <Text variant="overline" color="onDark" style={styles.overline}>
          {VERSE_LABELS[verse.kind]}
        </Text>
        <Text variant="verseArabic" color="onDark" style={styles.arabic}>
          {verse.arabic}
        </Text>
        <Text variant="verseTranslation" color="onDark" style={styles.translation}>
          {verse.translation}
        </Text>
        <Text variant="caption" color="onDark" style={styles.reference}>
          {verse.reference}
        </Text>
        <View style={styles.fill} />
        <View style={styles.buttons}>
          <PillButton label="I will pray now" variant="primary" onPress={onPrayNow} />
          <PillButton label="Close" variant="ghost" onPress={onClose} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center' },
  fill: { flex: 1, minHeight: 24 },
  closeRow: { alignSelf: 'stretch', alignItems: 'flex-end', marginTop: 8 },
  overline: { opacity: 0.6, marginTop: 48, textAlign: 'center' },
  // The frame is 390 wide with the Arabic at x 32 (326 wide) and the translation at x 36 (318 wide); the screen padding is 24.
  arabic: { marginTop: 31, paddingHorizontal: 8, textAlign: 'center', writingDirection: 'rtl' },
  translation: { opacity: 0.9, marginTop: 22, paddingHorizontal: 12, textAlign: 'center' },
  reference: { opacity: 0.55, marginTop: 16, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', paddingTop: 24 },
});
