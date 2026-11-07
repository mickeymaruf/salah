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

export interface ShapeSet {
  stack: ShapeParts;
  missed: ShapeParts;
  prayed: ShapeParts;
  bar: ShapeParts;
}

export interface SalahWidgetProps {
  counter: string;
  card: WidgetCard;
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
  if (!props || !props.card) {
    return (
      <Box modifiers={[fillMaxWidth(), height(60)]} contentAlignment="center">
        <Text maxLines={1}>Open Salah to set up this widget</Text>
      </Box>
    );
  }
  const dark = environment.colorScheme === 'dark';
  const palette = dark ? props.dark : props.light;
  const shapes = dark ? props.shapes.dark : props.shapes.light;
  const card = props.card;
  const asked = card.mode === 'question';
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
  // A rounded shape drawn with pictures, so it looks the same on every Android version: stretched middle, two ends, then the content on top. `fixedWidth` is a
  // number of dp, or 0 to fill the available width.
  const shape = (
    parts: ShapeParts,
    shapeHeight: number,
    cap: number,
    fixedWidth: number,
    alignment: 'center' | 'topStart',
    content: React.JSX.Element,
  ) => {
    const span = fixedWidth > 0 ? width(fixedWidth) : fillMaxWidth();
    return (
      <Box modifiers={[span, height(shapeHeight)]} contentAlignment={alignment}>
        <Box modifiers={[span, height(shapeHeight), padding(cap, 0, cap, 0)]}>
          <Image source={{ uri: parts.mid }} contentScale="fillBounds" modifiers={[fillMaxWidth(), height(shapeHeight)]} />
        </Box>
        <Box modifiers={[span, height(shapeHeight)]} contentAlignment="centerStart">
          <Image source={{ uri: parts.left }} modifiers={[size(cap, shapeHeight)]} />
        </Box>
        <Box modifiers={[span, height(shapeHeight)]} contentAlignment="centerEnd">
          <Image source={{ uri: parts.right }} modifiers={[size(cap, shapeHeight)]} />
        </Box>
        {content}
      </Box>
    );
  };
  const answer = (
    target: 'missed' | 'prayed',
    parts: ShapeParts,
    fixedWidth: number,
    label: string,
    icon: string,
    labelColor: string,
  ) => (
    <Button {...{ target }} modifiers={[fixedWidth > 0 ? width(fixedWidth) : fillMaxWidth(), height(44)]}>
      {shape(
        parts,
        44,
        22,
        fixedWidth,
        'center',
        <Row verticalAlignment="center" horizontalAlignment="center" modifiers={[fillMaxWidth()]}>
          <Image source={{ uri: icon }} modifiers={[size(24, 24)]} />
          <Spacer modifiers={[width(8)]} />
          {text(label, labelColor, 15, '600')}
        </Row>,
      )}
    </Button>
  );

  const front = asked ? (
    <Column modifiers={[fillMaxWidth(), height(124), padding(18, 16, 18, 16)]}>
      <Box modifiers={[fillMaxWidth(), height(36)]} contentAlignment="centerStart">
        <Row verticalAlignment="center">
          <Image source={{ uri: props.icons[card.prayer] }} modifiers={[size(36, 36)]} />
          <Spacer modifiers={[width(10)]} />
          {text(card.lead, palette.muted, 15, '500')}
          <Spacer modifiers={[width(4)]} />
          {text(card.name, palette.primary, 16, '600')}
        </Row>
        {atEnd(text(card.time, palette.muted, 12, '500'))}
      </Box>
      <Spacer modifiers={[height(14)]} />
      <Box modifiers={[fillMaxWidth(), height(44)]}>
        <Box modifiers={[fillMaxWidth(), height(44)]} contentAlignment="centerStart">
          {answer('missed', shapes.missed, 148, 'Missed', props.cross, palette.primary)}
        </Box>
        <Box modifiers={[fillMaxWidth(), height(44), padding(158, 0, 0, 0)]}>
          {answer('prayed', shapes.prayed, 0, 'Prayed', props.tick, palette.prayedLabel)}
        </Box>
      </Box>
    </Column>
  ) : (
    <Column modifiers={[fillMaxWidth(), height(124), padding(18, 16, 18, 16)]}>
      <Box modifiers={[fillMaxWidth(), height(36)]} contentAlignment="centerStart">
        <Row verticalAlignment="center">
          <Image source={{ uri: props.icons[card.prayer] }} modifiers={[size(36, 36)]} />
          <Spacer modifiers={[width(10)]} />
          {text(card.lead, palette.muted, 15, '500')}
          <Spacer modifiers={[width(4)]} />
          {text(card.name, palette.primary, 16, '600')}
        </Row>
      </Box>
      <Spacer modifiers={[height(14)]} />
      {shape(
        shapes.bar,
        44,
        22,
        0,
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

  return (
    <Column modifiers={[fillMaxWidth()]}>
      <Box modifiers={[fillMaxWidth(), height(18), padding(6, 0, 6, 0)]}>
        {text('Today', palette.primary, 14, '600')}
        <Box modifiers={[fillMaxWidth(), height(18)]} contentAlignment="centerEnd">
          {text(props.counter, palette.muted, 13, '500')}
        </Box>
      </Box>
      <Spacer modifiers={[height(16)]} />
      {shape(shapes.stack, 152, 48, 0, 'topStart', front)}
    </Column>
  );
}

export default createWidget('SalahWidget', SalahWidget);
