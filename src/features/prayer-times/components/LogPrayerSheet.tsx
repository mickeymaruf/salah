import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { BottomSheet, Text } from '@/shared/ui';
import { colors, fontFamily, radii, sizes } from '@/shared/theme';
import { PRAYER_LABELS, type PrayerName } from '../calculate';
import { availableChoices, canClear, type LogChoice, type LogStatus } from '../logChoice';

interface LogPrayerSheetProps {
  prayer: PrayerName;
  subtitle: string;
  status: LogStatus;
  initial: LogChoice | null;
  onSave: (choice: LogChoice) => void;
  // Returns the prayer to unmarked. Offered only when there is a choice to clear.
  onClear: () => void;
  onClose: () => void;
}

// Mount it to open, unmount it to close. The choice starts from `initial` each time.
// Tapping an option saves it and closes the sheet, so there is no separate Save button.
export function LogPrayerSheet({ prayer, subtitle, status, initial, onSave, onClear, onClose }: LogPrayerSheetProps) {
  const allowed = availableChoices(status);
  const [choice, setChoice] = useState<LogChoice | null>(initial);

  // The screens update at once, so the sheet does not wait for the write. Saving what is already true is skipped.
  const choose = (next: LogChoice, close: () => void) => {
    setChoice(next);
    if (next !== status) onSave(next);
    close();
  };

  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          <Text variant="confirm" style={styles.name} accessibilityRole="header">
            {PRAYER_LABELS[prayer]}
          </Text>
          <Text variant="label" color="muted" style={styles.subtitle}>
            {subtitle}
          </Text>
          <Text variant="row" style={styles.question}>
            How did it go?
          </Text>
          <View style={styles.options}>
            <Option
              kind="prayed"
              title="Prayed"
              description="I prayed it on time"
              selected={choice === 'prayed'}
              enabled={allowed.includes('prayed')}
              onPress={() => choose('prayed', close)}
            />
            <Option
              kind="missed"
              title="Missed"
              description="I did not pray it"
              selected={choice === 'missed'}
              enabled={allowed.includes('missed')}
              onPress={() => choose('missed', close)}
            />
          </View>
          {canClear(status) ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onClear();
                close();
              }}
              style={styles.clear}
            >
              <Text variant="label" color="muted">
                Clear mark
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </BottomSheet>
  );
}

interface OptionProps {
  kind: LogChoice;
  title: string;
  description: string;
  selected: boolean;
  enabled: boolean;
  onPress: () => void;
}

function Option({ kind, title, description, selected, enabled, onPress }: OptionProps) {
  const accent = kind === 'prayed' ? colors.brand.green : colors.state.missed;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={[
        styles.option,
        selected ? { borderWidth: 2, borderColor: accent } : { borderWidth: 1, borderColor: colors.line.soft },
        selected && kind === 'prayed' && { backgroundColor: colors.bg.sage },
        !enabled && styles.disabled,
      ]}
    >
      <View style={[styles.mark, { backgroundColor: accent }]}>
        {kind === 'prayed' ? (
          <Check size={16} color={colors.brand.onDark} strokeWidth={3} />
        ) : (
          <X size={14} color={colors.brand.onDark} strokeWidth={3} />
        )}
      </View>
      <Text style={styles.optionTitle} variant="bodyStrong">
        {title}
      </Text>
      <Text variant="caption" color="muted">
        {enabled ? description : 'Not yet time'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  name: { marginTop: 20 },
  subtitle: { marginTop: 4 },
  question: { marginTop: 20, fontFamily: fontFamily.medium },
  options: { marginTop: 12, flexDirection: 'row', gap: 12 },
  option: { flex: 1, padding: 16, gap: 10, borderRadius: radii.cardSmall, backgroundColor: colors.bg.surface },
  disabled: { opacity: 0.45 },
  mark: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  clear: { minHeight: sizes.iconButton, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  optionTitle: { fontSize: 18 },
});
