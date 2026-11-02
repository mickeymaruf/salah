import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from '@/shared/ui';
import { colors, fontFamily } from '@/shared/theme';
import type { Profile } from '@/shared/state/profile';
import { formatPlace } from '@/features/prayer-times/location';

export function ProfileCard({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text variant="title" color="onDark" style={styles.initial}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.text}>
          <Text variant="title">{profile.name}</Text>
          <Text variant="small" color="muted">
            {formatPlace(profile)}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit name" onPress={onEdit} style={styles.edit}>
          <Text variant="label" color="brand" style={styles.editLabel}>
            Edit
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 22, letterSpacing: 0 },
  text: { flex: 1, gap: 2 },
  edit: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  editLabel: { fontFamily: fontFamily.semiBold },
});
