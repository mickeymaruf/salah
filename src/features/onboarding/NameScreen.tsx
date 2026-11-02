import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text } from '@/shared/ui';
import { colors, typography } from '@/shared/theme';
import { StepDots } from './components/StepDots';

export function NameScreen() {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  const next = () => router.push({ pathname: '/location', params: { name: trimmed } });

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StepDots step={1} />
        <View style={styles.header}>
          <Text variant="label" color="brand">
            Bismillah.
          </Text>
          <Text variant="hero">
            {'What should we\ncall you?'}
          </Text>
          <Text variant="lead" color="muted">
            Just your first name. It stays on your phone.
          </Text>
        </View>
        <View style={styles.field}>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            autoComplete="given-name"
            autoCorrect={false}
            maxLength={30}
            returnKeyType="next"
            onSubmitEditing={() => trimmed && next()}
            accessibilityLabel="First name"
            placeholder="Your name"
            placeholderTextColor={colors.line.soft}
            selectionColor={colors.brand.green}
            style={styles.input}
          />
          <View style={styles.underline} />
        </View>
        <View style={styles.fill} />
        <Button label="Continue" onPress={next} disabled={!trimmed} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { marginTop: 56, gap: 12 },
  field: { marginTop: 32, gap: 12 },
  input: { ...typography.input, color: colors.ink.primary, paddingVertical: 0, minHeight: 44 },
  underline: { height: 1.5, backgroundColor: colors.ink.primary },
});
