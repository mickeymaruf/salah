import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/shared/ui';
import { colors, radii } from '@/shared/theme';

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.group}>
      <Text variant="tab" color="muted" style={styles.title}>
        {title.toUpperCase()}
      </Text>
      <Card radius={radii.cardSmall}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {row}
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  title: { paddingHorizontal: 4, letterSpacing: 0.96 },
  divider: { height: 1, marginHorizontal: 16, backgroundColor: colors.line.soft },
});
