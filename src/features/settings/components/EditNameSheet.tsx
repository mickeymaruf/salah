import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { BottomSheet, Button, Text } from '@/shared/ui';
import { colors, typography } from '@/shared/theme';

interface EditNameSheetProps {
  initialName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

// Mount it to open, unmount it to close.
export function EditNameSheet({ initialName, onSave, onClose }: EditNameSheetProps) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <BottomSheet onClose={onClose}>
      <Text variant="title">Your name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        autoFocus
        autoCapitalize="words"
        autoComplete="given-name"
        autoCorrect={false}
        maxLength={30}
        accessibilityLabel="First name"
        selectionColor={colors.brand.green}
        style={styles.input}
      />
      <View style={styles.underline} />
      <Button
        label="Save"
        disabled={!trimmed}
        onPress={() => {
          onSave(trimmed);
          onClose();
        }}
        style={styles.save}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: { ...typography.input, color: colors.ink.primary, paddingVertical: 0, minHeight: 44, marginTop: 12 },
  underline: { height: 1.5, backgroundColor: colors.ink.primary, marginTop: 12 },
  save: { marginTop: 24 },
});
