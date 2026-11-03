import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { BottomSheet, Button, Text } from '@/shared/ui';
import { sizes } from '@/shared/theme';
import { TimeWheel } from './TimeWheel';
import { clockToWheel, wheelToClock, type WheelValue } from './wheelValue';

interface TimePickerSheetProps {
  title: string;
  // 24-hour "HH:mm".
  initialClock: string;
  onDone: (clock: string) => void;
  onClose: () => void;
}

// Mount it to open, unmount it to close.
export function TimePickerSheet({ title, initialClock, onDone, onClose }: TimePickerSheetProps) {
  const [value, setValue] = useState<WheelValue>(() => clockToWheel(initialClock));

  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          <Text variant="sheetTitle" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="small" color="muted" style={styles.hint}>
            Set the time
          </Text>
          <TimeWheel value={value} onChange={setValue} />
          <Button
            label="Done"
            style={styles.done}
            onPress={() => {
              onDone(wheelToClock(value));
              close();
            }}
          />
          <Pressable accessibilityRole="button" onPress={close} style={styles.cancel}>
            <Text variant="label" color="muted">
              Cancel
            </Text>
          </Pressable>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 2, marginBottom: 12 },
  done: { marginTop: 16 },
  cancel: { minHeight: sizes.iconButton, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
