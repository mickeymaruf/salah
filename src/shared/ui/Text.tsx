import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { textColors, typography, type TextColor, type TypeVariant } from '@/shared/theme';

interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: TextColor;
}

// Display sizes are already large, so they scale less than body text before the layout breaks.
const DISPLAY_VARIANTS: readonly TypeVariant[] = ['clock', 'display', 'splash', 'hero', 'confirm', 'stat', 'input'];

export function Text({ variant = 'body', color = 'primary', style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={DISPLAY_VARIANTS.includes(variant) ? 1.1 : 1.4}
      style={[typography[variant], { color: textColors[color] }, style]}
      {...rest}
    />
  );
}
