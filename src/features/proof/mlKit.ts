import { NativeModules } from 'react-native';
import ImageLabeling from '@react-native-ml-kit/image-labeling';
import type { ImageLabeler } from './mlKitVerifier';

// Importing the package is safe everywhere: it only throws when a method is called without the native
// module. That module exists only in a development build, so Expo Go gets null and falls back.
export function getImageLabeler(): ImageLabeler | null {
  if (!NativeModules.ImageLabeling) return null;
  return (photoUri) => ImageLabeling.label(photoUri);
}
