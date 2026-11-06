import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';
import type { PrayerName } from '@/features/prayer-times/calculate';
import type { SalahWidgetProps } from './salahWidget';

// Everything the widget needs from the native side, behind one object so the rest of the app never imports the widget packages.
export interface WidgetBridge {
  update: (props: SalahWidgetProps) => void;
  // Called when Missed or Prayed is tapped on the widget. Returns a function that stops listening.
  onAnswer: (listener: (choice: 'missed' | 'prayed') => void) => () => void;
  images: WidgetImages;
}

export interface WidgetImages {
  icons: Record<PrayerName, string>;
  tick: string;
  cross: string;
}

const PICTURES = {
  fajr: require('../../../assets/images/widget-fajr.png'),
  dhuhr: require('../../../assets/images/widget-dhuhr.png'),
  asr: require('../../../assets/images/widget-asr.png'),
  maghrib: require('../../../assets/images/widget-maghrib.png'),
  isha: require('../../../assets/images/widget-isha.png'),
  tick: require('../../../assets/images/button-prayed.png'),
  cross: require('../../../assets/images/button-missed.png'),
} as const;

// The widget draws in another process, so it can only read files from the widgets directory. The bundled pictures are copied there once per launch.
async function copyImages(directory: string): Promise<WidgetImages> {
  const folder = new Directory(directory);
  const uris: Record<string, string> = {};
  for (const [name, source] of Object.entries(PICTURES)) {
    const asset = Asset.fromModule(source);
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error(`Widget picture ${name} has no local file`);
    const target = new File(folder, `widget-${name}.png`);
    if (target.exists) target.delete();
    new File(asset.localUri).copy(target);
    uris[name] = target.uri;
  }
  const { tick, cross, ...icons } = uris;
  return { icons: icons as Record<PrayerName, string>, tick, cross };
}

// The widget needs a development or standalone build. Expo Go has no widget module, and iOS widgets are not set up, so there the bridge is null and the app runs as before.
export async function loadWidgetBridge(): Promise<WidgetBridge | null> {
  if (Platform.OS !== 'android' || !requireOptionalNativeModule('ExpoWidgets')) return null;
  try {
    const [{ default: widget }, widgets] = await Promise.all([import('./salahWidget'), import('expo-widgets')]);
    const images = await copyImages(widgets.widgetsDirectory);
    return {
      images,
      update: (props) => widget.updateSnapshot(props),
      onAnswer: (listener) => {
        const subscription = widgets.addUserInteractionListener((event) => {
          if (event.source === 'SalahWidget' && (event.target === 'missed' || event.target === 'prayed')) listener(event.target);
        });
        return () => subscription.remove();
      },
    };
  } catch {
    return null;
  }
}
