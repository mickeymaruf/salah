import { StyleSheet, View } from 'react-native';
import { Screen, ScreenHeader, Text } from '@/shared/ui';

export interface TextSection {
  heading: string;
  body: string;
}

export function TextPage({ title, sections }: { title: string; sections: TextSection[] }) {
  return (
    <Screen scroll>
      <ScreenHeader title={title} />
      <View style={styles.sections}>
        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text variant="bodyStrong">{section.heading}</Text>
            <Text variant="lead" color="muted">
              {section.body}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: { marginTop: 20, gap: 24 },
  section: { gap: 6 },
});
