import { Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Text } from '@/shared/ui';
import { ArrowButton } from './ArrowButton';

interface DateNavigatorProps {
  date: string;
  sub: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  // Tapping the date itself opens the calendar.
  onPickDate: () => void;
}

// The top row of the prayer sheet: a square arrow on each side and the date with "Today" (or "Yesterday", ...) under it.
// The date is a button that opens the calendar.
export function DateNavigator({ date, sub, canGoBack, canGoForward, onBack, onForward, onPickDate }: DateNavigatorProps) {
  return (
    <>
      <ArrowButton label="Previous day" enabled={canGoBack} onPress={onBack} Icon={ChevronLeft} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${date}, ${sub}`}
        accessibilityHint="Opens a calendar to pick a day"
        onPress={onPickDate}
        style={styles.centre}
      >
        <Text variant="bodyStrong" numberOfLines={1}>
          {date}
        </Text>
        <Text variant="tiny" color="muted">
          {sub}
        </Text>
      </Pressable>
      <ArrowButton label="Next day" enabled={canGoForward} onPress={onForward} Icon={ChevronRight} />
    </>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});
