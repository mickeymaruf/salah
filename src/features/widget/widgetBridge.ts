import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { Asset } from 'expo-asset';
import { Directory, File } from 'expo-file-system';
import type { PrayerName } from '@/features/prayer-times/calculate';
import { parseAnswerTarget, type WidgetAnswer } from './widgetState';
import type { AnswerShape, SalahWidgetProps, ShapeParts, ShapeSet } from './salahWidget';

// Everything the widget needs from the native side, behind one object so the rest of the app never imports the widget packages.
export interface WidgetBridge {
  // Draws the widget. The pictures are added here, and copied again first if any of them has gone missing from the widgets directory.
  update: (props: Omit<SalahWidgetProps, keyof WidgetImages>) => Promise<void>;
  // Called when Missed or Prayed is tapped on the widget, with the prayer that was on show. Returns a function that stops listening.
  onAnswer: (listener: (answer: WidgetAnswer) => void) => () => void;
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

// How the widget gets a bundled picture. In a release build the bundler turns it into a drawable resource and `Asset` reports the resource name (no ":" in it), which the
// widget can draw as it is. Anywhere else (a development server) the picture is a web address, so it is copied into the widgets directory, the one folder the widget process can
// read files from, and only when it is missing or its size changed. Copies run one after another: about thirty at once is more than the file API handles reliably.
let copying: Promise<unknown> = Promise.resolve();

function isFileUri(uri: string): boolean {
  return uri.startsWith('file:');
}

function copyPicture(folder: Directory, name: string, source: Source): Promise<string> {
  const job = copying.then(async () => {
    const asset = Asset.fromModule(source);
    if (!asset.uri.includes(':')) return asset.uri;
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error(`Widget picture ${name} has no local file`);
    const original = new File(asset.localUri);
    const target = new File(folder, `${name}.png`);
    if (target.exists && target.size === original.size) return target.uri;
    if (target.exists) target.delete();
    original.copy(target);
    if (!target.exists) throw new Error(`Widget picture ${name} was not copied from ${asset.localUri}`);
    return target.uri;
  });
  copying = job.catch(() => undefined);
  return job;
}

async function copyImages(directory: string): Promise<WidgetImages> {
  const folder = new Directory(directory);
  if (!folder.exists) folder.create({ intermediates: true });
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

function pictureUris(images: WidgetImages): string[] {
  const shapes = [images.shapes.light, images.shapes.dark].flatMap((set) => [...Object.values(set.stack), ...Object.values(set.bar), ...Object.values(set.answers)]);
  return [...Object.values(images.icons), images.tick, images.cross, ...shapes].filter(isFileUri);
}

// The widget needs a development or standalone build. Expo Go has no widget module, and iOS widgets are not set up, so there the bridge is null and the app runs as before.
export async function loadWidgetBridge(): Promise<WidgetBridge | null> {
  if (Platform.OS !== 'android' || !requireOptionalNativeModule('ExpoWidgets')) return null;
  const modules = await Promise.all([import('./salahWidget'), import('expo-widgets')]).catch(() => null);
  if (!modules) return null;
  const [{ default: widget }, widgets] = modules;
  let images: WidgetImages | null = null;

  // If the widget cannot be drawn, it shows why, so a screenshot of it is enough to find the problem.
  const report = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    try {
      widget.updateSnapshot({ error: message.slice(0, 400) });
    } catch {
      return;
    }
  };

  return {
    update: async (props) => {
      try {
        if (!images || !pictureUris(images).every((uri) => new File(uri).exists)) images = await copyImages(widgets.widgetsDirectory);
        widget.updateSnapshot({ ...props, ...images });
      } catch (error) {
        report(error);
      }
    },
    onAnswer: (listener) => {
      const subscription = widgets.addUserInteractionListener((event) => {
        const answer = event.source === 'SalahWidget' ? parseAnswerTarget(event.target) : null;
        if (answer) listener(answer);
      });
      return () => subscription.remove();
    },
  };
}
