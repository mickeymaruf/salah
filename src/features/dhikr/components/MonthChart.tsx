import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '@/shared/theme';
import { fontFamily } from '@/shared/theme/typography';
import { chartScale, dayX, formatThousands, smoothPath, valueY, type Point } from '../chart';

// Layout in svg pixels, taken from Figma P-H3: the plot is 120 high with the count labels above it and the day numbers below.
export const CHART = {
  band: 36,
  plotHeight: 120,
  below: 28,
  inset: 6,
  labelGap: 6,
  dotRadius: 2.5,
  dotOutline: 1.5,
  todayRadius: 4,
  haloRadius: 9,
} as const;

export const CHART_HEIGHT = CHART.band + CHART.plotHeight + CHART.below;

interface MonthChartProps {
  width: number;
  // One value per day of the month. null for a day that has not come yet: no point, no label.
  values: readonly (number | null)[];
  // Index of today in `values`, or null when the month shown is not the current one.
  todayIndex: number | null;
}

export function MonthChart({ width, values, todayIndex }: MonthChartProps) {
  const plotLeft = CHART.inset;
  const plotWidth = width - CHART.inset * 2;
  const plotTop = CHART.band;
  const plotBottom = plotTop + CHART.plotHeight;
  const { max, ticks } = chartScale(values);
  const count = values.length;

  const points: (Point | null)[] = values.map((value, i) =>
    value === null ? null : { x: dayX(i, count, plotLeft, plotWidth), y: valueY(value, max, plotTop, CHART.plotHeight) },
  );
  const drawn = points.filter((point): point is Point => point !== null);
  const line = smoothPath(drawn);
  const area = drawn.length > 1 ? `${line} L ${drawn[drawn.length - 1].x} ${plotBottom} L ${drawn[0].x} ${plotBottom} Z` : '';

  return (
    <Svg width={width} height={CHART_HEIGHT} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id="deedsFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.brand.green} stopOpacity={0.2} />
          <Stop offset="1" stopColor={colors.brand.green} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {values.map((_, i) => {
        const x = dayX(i, count, plotLeft, plotWidth);
        return <Line key={`guide-${i}`} x1={x} x2={x} y1={plotTop} y2={plotBottom} stroke={colors.line.soft} strokeWidth={1} opacity={0.6} />;
      })}
      {ticks.map((tick) => {
        const y = valueY(tick, max, plotTop, CHART.plotHeight);
        return <Line key={`grid-${tick}`} x1={0} x2={width} y1={y} y2={y} stroke={colors.line.soft} strokeWidth={1} />;
      })}

      {area ? <Path d={area} fill="url(#deedsFill)" /> : null}
      {line ? <Path d={line} stroke={colors.brand.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}

      {points.map((point, i) => {
        if (!point || i === todayIndex) return null;
        return (
          <Circle
            key={`dot-${i}`}
            cx={point.x}
            cy={point.y}
            r={CHART.dotRadius + CHART.dotOutline / 2}
            fill={colors.brand.green}
            stroke={colors.bg.base}
            strokeWidth={CHART.dotOutline}
          />
        );
      })}
      {todayIndex !== null && points[todayIndex] ? (
        <>
          <Circle cx={points[todayIndex].x} cy={points[todayIndex].y} r={CHART.haloRadius} fill={colors.brand.green} opacity={0.2} />
          <Circle
            cx={points[todayIndex].x}
            cy={points[todayIndex].y}
            r={CHART.todayRadius}
            fill={colors.brand.green}
            stroke={colors.bg.base}
            strokeWidth={CHART.dotOutline}
          />
        </>
      ) : null}

      {values.map((value, i) => {
        if (value === null) return null;
        const x = dayX(i, count, plotLeft, plotWidth) + 3.5;
        const y = plotTop - CHART.labelGap;
        const today = i === todayIndex;
        return (
          <SvgText
            key={`count-${i}`}
            x={x}
            y={y}
            transform={`rotate(-90 ${x} ${y})`}
            fontSize={10}
            fontFamily={today ? fontFamily.semiBold : fontFamily.medium}
            fill={today ? colors.brand.green : colors.ink.muted}
          >
            {formatThousands(value)}
          </SvgText>
        );
      })}
      {values.map((_, i) => {
        const today = i === todayIndex;
        return (
          <SvgText
            key={`day-${i}`}
            x={dayX(i, count, plotLeft, plotWidth)}
            y={plotBottom + 15}
            fontSize={9}
            textAnchor="middle"
            fontFamily={today ? fontFamily.semiBold : fontFamily.medium}
            fill={today ? colors.ink.primary : colors.ink.muted}
          >
            {i + 1}
          </SvgText>
        );
      })}
    </Svg>
  );
}
