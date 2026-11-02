import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Button, Screen, Text } from '@/shared/ui';
import { colors } from '@/shared/theme';
import type { PrayerName } from '@/features/prayer-times/calculate';
import { isDateKey, isPrayerName } from '@/features/alarm/notificationData';
import { Viewfinder } from './components/Viewfinder';
import { ShutterButton } from './components/ShutterButton';
import { useProofSubmit } from './useProofSubmit';
import { registerLiveCapture } from './verifier';

export function ProofCameraScreen() {
  const params = useLocalSearchParams<{ prayer?: string; date?: string }>();
  if (!isPrayerName(params.prayer) || !isDateKey(params.date)) return <Redirect href="/today" />;
  return <Camera prayer={params.prayer} date={params.date} />;
}

function Camera({ prayer, date }: { prayer: PrayerName; date: string }) {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [rejected, setRejected] = useState(false);
  const { submit, busy } = useProofSubmit(date, prayer);

  const capture = async () => {
    if (!camera.current || !ready || busy) return;
    setRejected(false);
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.6 });
      // Only this screen registers captures, so only live photos can pass verification.
      registerLiveCapture(picture.uri);
      const result = await submit(picture.uri);
      if (result.ok) {
        router.replace({ pathname: '/verified', params: { prayer, date, label: result.label } });
      } else {
        setRejected(true);
      }
    } catch {
      setRejected(true);
    }
  };

  const hint = busy
    ? 'Checking on your device…'
    : rejected
      ? "That didn't work. Frame your prayer space and try again."
      : 'Frame your prayer mat or mosque';

  return (
    <Screen tone="camera">
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          onPress={() => router.back()}
          style={styles.close}
        >
          <X size={20} color={colors.brand.onDark} strokeWidth={2} />
        </Pressable>
        <Text variant="button" color="onDark" style={styles.title}>
          Show your prayer space
        </Text>
        <View style={styles.close} />
      </View>
      <View style={styles.finder}>
        <Viewfinder>
          {permission?.granted ? (
            <CameraView
              ref={camera}
              style={StyleSheet.absoluteFill}
              facing="back"
              onCameraReady={() => setReady(true)}
              accessibilityLabel="Camera preview"
            />
          ) : (
            <PermissionPrompt
              loaded={permission !== null}
              canAskAgain={permission?.canAskAgain ?? true}
              onRequest={requestPermission}
            />
          )}
        </Viewfinder>
      </View>
      <Text variant="label" color="onDark" style={[styles.hint, rejected && styles.hintRejected]}>
        {hint}
      </Text>
      <View style={styles.fill} />
      <View style={styles.shutter}>
        <ShutterButton onPress={capture} disabled={!permission?.granted || !ready || busy} />
      </View>
    </Screen>
  );
}

interface PermissionPromptProps {
  loaded: boolean;
  canAskAgain: boolean;
  onRequest: () => void;
}

function PermissionPrompt({ loaded, canAskAgain, onRequest }: PermissionPromptProps) {
  if (!loaded) return null;
  return (
    <View style={styles.prompt}>
      <Text variant="prompt" color="onDark" style={styles.promptText}>
        Salah needs the camera to see your prayer space. Photos stay on your phone.
      </Text>
      <Button
        label={canAskAgain ? 'Allow camera' : 'Open settings'}
        variant="light"
        onPress={canAskAgain ? onRequest : () => Linking.openSettings()}
        style={styles.promptButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.camera.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16 },
  finder: { marginTop: 24 },
  hint: { marginTop: 20, opacity: 0.7, textAlign: 'center' },
  hintRejected: { opacity: 1, color: colors.state.missed },
  shutter: { alignItems: 'center', paddingBottom: 24 },
  prompt: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 20 },
  promptText: { textAlign: 'center' },
  promptButton: { alignSelf: 'stretch' },
});
