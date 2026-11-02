import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { textColors, typography, type TextColor, type TypeVariant } from '@/shared/theme';

interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: TextColor;
}

export function Text({ variant = 'body', color = 'primary', style, ...rest }: TextProps) {
  return <RNText style={[typography[variant], { color: textColors[color] }, style]} {...rest} />;
}
