import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';
import type { PrayerName } from '@/features/prayer-times/calculate';
import { parseAnswerTarget, type WidgetAnswer } from './widgetState';
import type { AnswerShape, SalahWidgetProps, ShapeParts, ShapeSet } from './salahWidget';

// Everything the widget needs from the native side, behind one object so the rest of the app never imports the widget packages.
export interface WidgetBridge {
  update: (props: SalahWidgetProps) => void;
  // Called when Missed or Prayed is tapped on the widget, with the prayer that was on show. Returns a function that stops listening.
  onAnswer: (listener: (answer: WidgetAnswer) => void) => () => void;
  images: WidgetImages;
}

export type WidgetImages = Pick<SalahWidgetProps, 'icons' | 'tick' | 'cross' | 'shapes'>;

const PICTURES = {
  fajr: require('../../../assets/images/widget-fajr.png'),
  dhuhr: require('../../../assets/images/widget-dhuhr.png'),
  asr: require('../../../assets/images/widget-asr.png'),
  maghrib: require('../../../assets/images/widget-maghrib.png'),
  isha: require('../../../assets/images/widget-isha.png'),
  tick: require('../../../assets/images/widget-tick.png'),
  cross: require('../../../assets/images/widget-cross.png'),
} as const;

// Made by `scripts/prepare-widget-shapes.js`.
const SHAPES = {
  light: {
    stack: {
      left: require('../../../assets/images/widget-shape-stack-left-light.png'),
      mid: require('../../../assets/images/widget-shape-stack-mid-light.png'),
      right: require('../../../assets/images/widget-shape-stack-right-light.png'),
    },
    bar: {
      left: require('../../../assets/images/widget-shape-bar-left-light.png'),
      mid: require('../../../assets/images/widget-shape-bar-mid-light.png'),
      right: require('../../../assets/images/widget-shape-bar-right-light.png'),
    },
    answers: {
      left: require('../../../assets/images/widget-shape-answers-left-light.png'),
      mid: require('../../../assets/images/widget-shape-answers-mid-light.png'),
      right: require('../../../assets/images/widget-shape-answers-right-light.png'),
      center: require('../../../assets/images/widget-shape-answers-center-light.png'),
    },
  },
  dark: {
    stack: {
      left: require('../../../assets/images/widget-shape-stack-left-dark.png'),
      mid: require('../../../assets/images/widget-shape-stack-mid-dark.png'),
      right: require('../../../assets/images/widget-shape-stack-right-dark.png'),
    },
    bar: {
      left: require('../../../assets/images/widget-shape-bar-left-dark.png'),
      mid: require('../../../assets/images/widget-shape-bar-mid-dark.png'),
      right: require('../../../assets/images/widget-shape-bar-right-dark.png'),
    },
    answers: {
      left: require('../../../assets/images/widget-shape-answers-left-dark.png'),
      mid: require('../../../assets/images/widget-shape-answers-mid-dark.png'),
      right: require('../../../assets/images/widget-shape-answers-right-dark.png'),
      center: require('../../../assets/images/widget-shape-answers-center-dark.png'),
    },
  },
} as const;

type Source = number;

// The widget draws in another process, so it can only read files from the widgets directory. A bundled picture is copied there only when it is missing or its size
// changed, so a launch never deletes a file the widget is drawing with.
async function copyPicture(folder: Directory, name: string, source: Source): Promise<string> {
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error(`Widget picture ${name} has no local file`);
  const original = new File(asset.localUri);
  const target = new File(folder, `${name}.png`);
  if (!target.exists || target.size !== original.size) {
    if (target.exists) target.delete();
    original.copy(target);
  }
  return target.uri;
}

async function copyImages(directory: string): Promise<WidgetImages> {
  const folder = new Directory(directory);
  const copy = (name: string, source: Source) => copyPicture(folder, `widget-${name}`, source);
  const copyParts = async (name: string, parts: Record<keyof ShapeParts, Source>): Promise<ShapeParts> => {
    const [left, mid, right] = await Promise.all([copy(`${name}-left`, parts.left), copy(`${name}-mid`, parts.mid), copy(`${name}-right`, parts.right)]);
    return { left, mid, right };
  };
  const copyAnswers = async (theme: 'light' | 'dark'): Promise<AnswerShape> => {
    const parts = SHAPES[theme].answers;
    const [ends, center] = await Promise.all([copyParts(`answers-${theme}`, parts), copy(`answers-center-${theme}`, parts.center)]);
    return { ...ends, center };
  };
  const copySet = async (theme: 'light' | 'dark'): Promise<ShapeSet> => {
    const set = SHAPES[theme];
    const [stack, bar, answers] = await Promise.all([copyParts(`stack-${theme}`, set.stack), copyParts(`bar-${theme}`, set.bar), copyAnswers(theme)]);
    return { stack, bar, answers };
  };
  const names = Object.keys(PICTURES) as (keyof typeof PICTURES)[];
  const [uris, light, dark] = await Promise.all([
    Promise.all(names.map((name) => copy(name, PICTURES[name]))),
    copySet('light'),
    copySet('dark'),
  ]);
  const byName = Object.fromEntries(names.map((name, index) => [name, uris[index]])) as Record<keyof typeof PICTURES, string>;
  const { tick, cross, ...icons } = byName;
  return { icons: icons as Record<PrayerName, string>, tick, cross, shapes: { light, dark } };
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
          const answer = event.source === 'SalahWidget' ? parseAnswerTarget(event.target) : null;
          if (answer) listener(answer);
        });
        return () => subscription.remove();
      },
    };
  } catch {
    return null;
  }
}
