import Svg, { Path } from 'react-native-svg';
import { colors } from '@/shared/theme';
import logo from './logo.json';

interface LogoMarkProps {
  // Rendered height. Width follows the 72:90 proportion of the Figma mark.
  height?: number;
  archColor?: string;
  moonColor?: string;
}

// Geometry lives in logo.json so scripts/generate-icons.js draws the same shape.
export function LogoMark({ height = 90, archColor = colors.brand.green, moonColor = colors.brand.onDark }: LogoMarkProps) {
  return (
    <Svg width={(height * logo.width) / logo.height} height={height} viewBox={`0 0 ${logo.width} ${logo.height}`}>
      <Path d={logo.arch} fill={archColor} />
      <Path d={logo.moon} fill={moonColor} />
    </Svg>
  );
}
