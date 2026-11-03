import { useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';
import { HOURS, MINUTES, PERIODS, type WheelValue } from './wheelValue';

const ITEM_HEIGHT = 44;
const WHEEL_HEIGHT = 132;
const BAND_HEIGHT = 48;
const COLUMN_WIDTH = 90;

interface ColumnProps {
  label: string;
  items: string[];
  index: number;
  onChange: (index: number) => void;
}

function Column({ label, items, index, onChange }: ColumnProps) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  // The big style follows the finger while it scrolls; the value is reported once it settles.
  const [live, setLive] = useState(index);

  const indexAt = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    Math.min(items.length - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)));

  const select = (next: number) => {
    scroll.current?.scrollTo({ y: next * ITEM_HEIGHT, animated: true });
    setLive(next);
    onChange(next);
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') select(Math.min(items.length - 1, live + 1));
    if (event.nativeEvent.actionName === 'decrement') select(Math.max(0, live - 1));
  };

  return (
    <ScrollView
      ref={scroll}
      style={styles.column}
      contentContainerStyle={styles.columnContent}
      contentOffset={{ x: 0, y: index * ITEM_HEIGHT }}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      scrollEventThrottle={16}
      onScroll={(event) => {
        const next = indexAt(event);
        if (next !== live) setLive(next);
      }}
      onScrollEndDrag={(event) => onChange(indexAt(event))}
      onMomentumScrollEnd={(event) => onChange(indexAt(event))}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: items[live] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
    >
      {items.map((item, i) => (
        <Pressable key={item} accessible={false} onPress={() => select(i)} style={styles.item}>
          <Text
            variant={i === live ? 'wheel' : 'wheelDim'}
            color={i === live ? 'primary' : 'muted'}
            style={i === live ? undefined : styles.dim}
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

interface TimeWheelProps {
  value: WheelValue;
  onChange: (value: WheelValue) => void;
}

// Three snapping columns (hour, minute, AM/PM) over one selection band.
export function TimeWheel({ value, onChange }: TimeWheelProps) {
  return (
    <View style={styles.wheel}>
      <View style={styles.band} />
      <Column label="Hour" items={HOURS} index={value.hour} onChange={(hour) => onChange({ ...value, hour })} />
      <Column label="Minute" items={MINUTES} index={value.minute} onChange={(minute) => onChange({ ...value, minute })} />
      <Column label="AM or PM" items={PERIODS} index={value.period} onChange={(period) => onChange({ ...value, period })} />
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: { height: WHEEL_HEIGHT, flexDirection: 'row', justifyContent: 'center' },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (WHEEL_HEIGHT - BAND_HEIGHT) / 2,
    height: BAND_HEIGHT,
    borderRadius: radii.cardSmall - 6,
    backgroundColor: colors.bg.sage,
  },
  column: { width: COLUMN_WIDTH, flexGrow: 0 },
  // Padding of one item lets the first and last entries reach the middle row.
  columnContent: { paddingVertical: ITEM_HEIGHT },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.6 },
});
