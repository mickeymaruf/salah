import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import { Box, Button, Column, Image, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height, padding, size, width } from '@expo/ui/jetpack-compose/modifiers';
import type { PrayerName } from '../prayer-times/calculate';
import type { WidgetPalette } from './palette';
import type { WidgetCard } from './widgetState';

// A rounded shape cut into three pictures: the left end, a one pixel wide middle that the widget stretches, and the right end.
export interface ShapeParts {
  left: string;
  mid: string;
  right: string;
}

// The Missed and Prayed buttons are one shape so they are always the same width: the ends, a middle that is Missed on its left half and Prayed on its right half,
// and a centre piece (the two inner ends and the gap) that sits on the exact middle.
export interface AnswerShape extends ShapeParts {
  center: string;
}

export interface ShapeSet {
  stack: ShapeParts;
  bar: ShapeParts;
  answers: AnswerShape;
}

export interface SalahWidgetProps {
  // Every question still waiting, oldest first, and the card to show when none is.
  queue: WidgetCard[];
  next: WidgetCard;
  // File URIs in the widgets directory: the round prayer icons, the 3D tick and cross, and the card and button shapes for each colour scheme.
  icons: Record<PrayerName, string>;
  tick: string;
  cross: string;
  shapes: { light: ShapeSet; dark: ShapeSet };
  light: WidgetPalette;
  dark: WidgetPalette;
}

// The Today widget (Figma 6020:272). This function is copied into the widget's own runtime as text, so it may only use the globals the widget runtime provides
// (the Expo UI components and modifiers above) and its two arguments: no module-level helpers, and every colour and picture arrives in the props.
function SalahWidget(props: SalahWidgetProps, environment: WidgetEnvironment) {
  'widget';
  if (!props || !props.queue || !props.next) {
    return (
      <Box modifiers={[fillMaxWidth(), height(60)]} contentAlignment="center">
        <Text maxLines={1}>Open Salah to set up this widget</Text>
      </Box>
    );
  }
  const dark = environment.colorScheme === 'dark';
  const palette = dark ? props.dark : props.light;
  const shapes = dark ? props.shapes.dark : props.shapes.light;
  const asked = props.queue.length > 0;
  const card = asked ? props.queue[0] : props.next;
  const text = (value: string, color: string, fontSize: number, fontWeight: '500' | '600') => (
    <Text color={color} style={{ fontSize, fontWeight }} maxLines={1}>
      {value}
    </Text>
  );
  // Children of a Box share one alignment, so each right-aligned item gets its own full-width Box on top of the left-aligned content.
  const atEnd = (child: React.JSX.Element) => (
    <Box modifiers={[fillMaxWidth(), height(36)]} contentAlignment="centerEnd">
      {child}
    </Box>
  );
  // A rounded shape drawn with pictures, so it looks the same on every Android version: a stretched middle that runs 2 dp under both ends (no seam), the two ends,
  // then the content on top. Every picture is stretched to an exact size, so the ends and the middle always line up.
  const shape = (parts: ShapeParts, shapeHeight: number, cap: number, alignment: 'center' | 'topStart', content: React.JSX.Element) => (
    <Box modifiers={[fillMaxWidth(), height(shapeHeight)]} contentAlignment={alignment}>
      <Box modifiers={[fillMaxWidth(), height(shapeHeight), padding(cap - 2, 0, cap - 2, 0)]}>
        <Image source={{ uri: parts.mid }} contentScale="fillBounds" modifiers={[fillMaxWidth(), height(shapeHeight)]} />
      </Box>
      <Box modifiers={[fillMaxWidth(), height(shapeHeight)]} contentAlignment="centerStart">
        <Image source={{ uri: parts.left }} contentScale="fillBounds" modifiers={[size(cap, shapeHeight)]} />
      </Box>
      <Box modifiers={[fillMaxWidth(), height(shapeHeight)]} contentAlignment="centerEnd">
        <Image source={{ uri: parts.right }} contentScale="fillBounds" modifiers={[size(cap, shapeHeight)]} />
      </Box>
      {content}
    </Box>
  );
  // An invisible button. A button cannot be told "half the row", so the row is covered by buttons of a fixed width that start at the left edge, at the right edge and
  // on each side of the centre. Together they cover each half. Tapping answers inside the widget at once (the next question moves up) and the app writes the log.
  const tap = (choice: 'missed' | 'prayed', tapWidth: number) => {
    const targets = card.targets;
    if (!targets) return <Spacer modifiers={[width(tapWidth)]} />;
    return (
      <Button
        {...{ target: targets[choice] }}
        onClick={() => ({ queue: props.queue.slice(1) })}
        modifiers={[width(tapWidth), height(44)]}
      >
        <Box modifiers={[width(tapWidth), height(44)]} />
      </Button>
    );
  };
  const label = (name: string, icon: string, color: string) => (
    <Row verticalAlignment="center">
      <Image source={{ uri: icon }} modifiers={[size(24, 24)]} />
      <Spacer modifiers={[width(8)]} />
      {text(name, color, 15, '600')}
    </Row>
  );
  const answers = (
    <Box modifiers={[fillMaxWidth(), height(44)]}>
      <Box modifiers={[fillMaxWidth(), height(44), padding(20, 0, 20, 0)]}>
        <Image source={{ uri: shapes.answers.mid }} contentScale="fillBounds" modifiers={[fillMaxWidth(), height(44)]} />
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="centerStart">
        {tap('missed', 100)}
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="centerEnd">
        {tap('prayed', 100)}
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="center">
        <Row>
          {tap('missed', 100)}
          <Spacer modifiers={[width(10)]} />
          {tap('prayed', 100)}
        </Row>
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="centerStart">
        <Image source={{ uri: shapes.answers.left }} contentScale="fillBounds" modifiers={[size(22, 44)]} />
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="centerEnd">
        <Image source={{ uri: shapes.answers.right }} contentScale="fillBounds" modifiers={[size(22, 44)]} />
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="center">
        <Image source={{ uri: shapes.answers.center }} contentScale="fillBounds" modifiers={[size(134, 44)]} />
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44), padding(46, 0, 0, 0)]} contentAlignment="centerStart">
        {label('Missed', props.cross, palette.primary)}
      </Box>
      <Box modifiers={[fillMaxWidth(), height(44), padding(0, 0, 46, 0)]} contentAlignment="centerEnd">
        {label('Prayed', props.tick, palette.prayedLabel)}
      </Box>
    </Box>
  );
  const heading = (
    <Row verticalAlignment="center">
      <Image source={{ uri: props.icons[card.prayer] }} modifiers={[size(36, 36)]} />
      <Spacer modifiers={[width(10)]} />
      {text(card.lead, palette.muted, 15, '500')}
      <Spacer modifiers={[width(4)]} />
      {text(card.name, palette.primary, 16, '600')}
    </Row>
  );
  const front = asked ? (
    <Column modifiers={[fillMaxWidth(), height(124), padding(18, 16, 18, 16)]}>
      <Box modifiers={[fillMaxWidth(), height(36)]} contentAlignment="centerStart">
        {heading}
        {atEnd(text(card.time, palette.muted, 12, '500'))}
      </Box>
      <Spacer modifiers={[height(14)]} />
      {answers}
    </Column>
  ) : (
    <Column modifiers={[fillMaxWidth(), height(124), padding(18, 16, 18, 16)]}>
      <Box modifiers={[fillMaxWidth(), height(36)]} contentAlignment="centerStart">
        {heading}
      </Box>
      <Spacer modifiers={[height(14)]} />
      {shape(
        shapes.bar,
        44,
        22,
        'center',
        <Box modifiers={[fillMaxWidth(), height(44), padding(18, 0, 18, 0)]} contentAlignment="centerStart">
          {text(card.time, palette.primary, 17, '600')}
          <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="centerEnd">
            {text(card.countdown, palette.muted, 14, '600')}
          </Box>
        </Box>,
      )}
    </Column>
  );

  return <Column modifiers={[fillMaxWidth()]}>{shape(shapes.stack, 152, 48, 'topStart', front)}</Column>;
}

export default createWidget('SalahWidget', SalahWidget);
