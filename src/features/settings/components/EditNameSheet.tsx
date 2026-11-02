import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button, Text } from '@/shared/ui';
import { colors, radii, typography } from '@/shared/theme';

interface EditNameSheetProps {
  visible: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function EditNameSheet({ visible, initialName, onSave, onClose }: EditNameSheetProps) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setName(initialName)}
    >
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16,36,30,0.4)' },
  sheet: {
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: 24,
    paddingBottom: 32,
    gap: 12,
  },
  input: { ...typography.input, color: colors.ink.primary, paddingVertical: 0, minHeight: 44, marginTop: 8 },
  underline: { height: 1.5, backgroundColor: colors.ink.primary },
  save: { marginTop: 12 },
});
