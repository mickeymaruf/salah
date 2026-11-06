import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import { Box, Button, Column, Image, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
import { background, cornerRadius, fillMaxWidth, height, padding, size, width } from '@expo/ui/jetpack-compose/modifiers';
import type { PrayerName } from '../prayer-times/calculate';
import type { WidgetPalette } from './palette';
import type { WidgetCard } from './widgetState';

export interface SalahWidgetProps {
  counter: string;
  card: WidgetCard;
  // File URIs in the widgets directory: the round prayer icons and the 3D tick and cross.
  icons: Record<PrayerName, string>;
  tick: string;
  cross: string;
  light: WidgetPalette;
  dark: WidgetPalette;
}

// The Today widget (Figma 6020:272, 18078:119 and 18078:154). This function is copied into the widget's own runtime as text, so it may only use the globals the
// widget runtime provides (the Expo UI components and modifiers above) and its two arguments: no module-level helpers, and every colour arrives in the props.
function SalahWidget(props: SalahWidgetProps, environment: WidgetEnvironment) {
  'widget';
  const palette = environment.colorScheme === 'dark' ? props.dark : props.light;
  const card = props.card;
  const asked = card.mode === 'question';
  const text = (value: string, color: string, fontSize: number, fontWeight: '500' | '600') => (
    <Text color={color} style={{ fontSize, fontWeight }} maxLines={1}>
      {value}
    </Text>
  );
  // Children of a Box share one alignment, so each right-aligned item gets its own full-width Box on top of the left-aligned content.
  const atEnd = (child: React.JSX.Element) => (
    <Box modifiers={[fillMaxWidth()]} contentAlignment="centerEnd">
      {child}
    </Box>
  );
  const answer = (target: 'missed' | 'prayed', label: string, icon: string, fill: string, labelColor: string, ring: string) => (
    <Box modifiers={[size(148, 44), background(ring), cornerRadius(22)]} contentAlignment="center">
      <Button
        {...{ target }}
        modifiers={[size(145, 41), background(fill), cornerRadius(20.5)]}
        colors={{ containerColor: fill, contentColor: labelColor }}
      >
        <Row verticalAlignment="center" horizontalAlignment="center">
          <Image source={{ uri: icon }} modifiers={[size(24, 24)]} />
          <Spacer modifiers={[width(8)]} />
          {text(label, labelColor, 15, '600')}
        </Row>
      </Button>
    </Box>
  );

  return (
    <Column modifiers={[fillMaxWidth()]}>
      <Box modifiers={[fillMaxWidth(), height(18), padding(6, 0, 6, 0)]}>
        {text('Today', palette.primary, 15, '600')}
        {atEnd(text(props.counter, palette.muted, 15, '500'))}
      </Box>
      <Spacer modifiers={[height(14)]} />
      <Box modifiers={[fillMaxWidth(), height(152)]}>
        <Box modifiers={[fillMaxWidth(), height(152), padding(20, 38, 20, 0)]}>
          <Box modifiers={[fillMaxWidth(), height(114), background(palette.surface60), cornerRadius(28)]} />
        </Box>
        <Box modifiers={[fillMaxWidth(), height(152), padding(10, 24, 10, 0)]}>
          <Box modifiers={[fillMaxWidth(), height(114), background(palette.surface85), cornerRadius(28)]} />
        </Box>
        <Column modifiers={[fillMaxWidth(), height(124), background(palette.surface), cornerRadius(28), padding(18, 16, 18, 16)]}>
          <Box modifiers={[fillMaxWidth(), height(36)]} contentAlignment="centerStart">
            <Row verticalAlignment="center">
              <Image source={{ uri: props.icons[card.prayer] }} modifiers={[size(36, 36)]} />
              <Spacer modifiers={[width(10)]} />
              {text(card.lead, palette.muted, 15, '500')}
              <Spacer modifiers={[width(4)]} />
              {text(card.name, palette.primary, 16, '600')}
            </Row>
            {asked ? atEnd(text(card.time, palette.muted, 12, '500')) : null}
          </Box>
          <Spacer modifiers={[height(14)]} />
          {asked ? (
            <Row>
              {answer('missed', 'Missed', props.cross, palette.surface, palette.primary, palette.line)}
              <Spacer modifiers={[width(10)]} />
              {answer('prayed', 'Prayed', props.tick, palette.prayedFill, palette.prayedLabel, palette.prayedFill)}
            </Row>
          ) : (
            <Box modifiers={[fillMaxWidth(), height(44), background(palette.base), cornerRadius(22), padding(18, 0, 18, 0)]} contentAlignment="centerStart">
              {text(card.time, palette.primary, 17, '600')}
              {atEnd(text(card.countdown, palette.muted, 14, '600'))}
            </Box>
          )}
        </Column>
      </Box>
    </Column>
  );
}

export default createWidget('SalahWidget', SalahWidget);
