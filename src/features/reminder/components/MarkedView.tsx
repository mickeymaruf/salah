import { Image, StyleSheet, View } from 'react-native';
import { Button, Screen, Text } from '@/shared/ui';

const TICK = require('../../../../assets/images/tick-white.png');

interface MarkedViewProps {
  title: string;
  nextLine: string;
  onDone: () => void;
}

// Figma 6b: the cream confirmation. The 3D tick is drawn at 150% of its 112 px circle and shifted 25% up and left.
export function MarkedView({ title, nextLine, onDone }: MarkedViewProps) {
  return (
    <Screen tone="light">
      <View style={styles.body}>
        <View style={styles.tick} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Image source={TICK} style={styles.tickImage} />
        </View>
        <Text variant="askQuestionLong" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text variant="pillTime" color="muted" style={styles.next}>
          {nextLine}
        </Text>
        <View style={styles.fill} />
        <Button label="Done" onPress={onDone} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingTop: 142 },
  fill: { flex: 1 },
  tick: { width: 112, height: 112, borderRadius: 56, overflow: 'hidden' },
  tickImage: { position: 'absolute', width: 168, height: 168, left: -28, top: -28 },
  title: { marginTop: 30, textAlign: 'center' },
  next: { marginTop: 11, textAlign: 'center' },
});
