import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/shared/theme';
import { Text } from '@/shared/ui';

interface MarkerLineProps {
  text: string;
}

// A line of text with a yellow hand-drawn marker stroke under it (Figma 26008:17, 209 x 8.93, weight 5, round caps).
export function MarkerLine({ text }: MarkerLineProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="dayTitle" color="onDark" style={styles.text}>
        {text}
      </Text>
      <View style={styles.marker} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Svg width={209} height={8.93} viewBox="0 0 209 8.93" style={styles.svg}>
          <Path
            d="M2.5 5.43C43.3 1.43 84.1 9.43 124.9 4.43C155.5 0.43 181 3.43 206.5 6.43"
            stroke={colors.reminder.marker}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingBottom: 6 },
  text: { textAlign: 'center' },
  // The stroke sits on the baseline, centred, about 17 px below the top of the text as in the frame.
  marker: { position: 'absolute', left: 0, right: 0, bottom: -1, alignItems: 'center' },
  svg: { alignSelf: 'center' },
});
