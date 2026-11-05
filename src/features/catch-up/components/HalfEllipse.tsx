import Svg, { Path } from 'react-native-svg';
import { halfEllipsePath, type Side } from '../geometry';

interface HalfEllipseProps {
  side: Side;
  color: string;
  width: number;
  height: number;
}

// One of the two answer shapes: half an ellipse on a screen edge.
export function HalfEllipse({ side, color, width, height }: HalfEllipseProps) {
  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Path d={halfEllipsePath(side, width, height)} fill={color} />
    </Svg>
  );
}
