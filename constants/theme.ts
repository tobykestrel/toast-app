/**
 * Theme colors for the app. Dark theme is the default, Light theme has inverted background colors.
 */

import { Platform } from 'react-native';

// Accent colors (same for both themes)
const accentGreen = '#48bb78';
const accentRed = '#ef4444';
const accentBlue = '#3b82f6';
const accentYellow = '#eab308';

// Grade colors (same for both themes)
const gradeBlue = '#3b7df6';
const gradeGreen = '#1aa783';
const gradeRed = '#c45353';

export const Colors = {
  light: {
    // Background and container colors (inverted from dark)
    background: '#f5f5f5',
    container: '#ffffff',
    containerSecondary: '#e8e8e8',
    
    // Text colors (inverted from dark)
    text: '#000000',
    textSecondary: '#555555',
    textMuted: '#888888',
    
    // UI elements
    tint: accentBlue,
    icon: '#333333',
    tabIconDefault: '#999999',
    tabIconSelected: accentBlue,
    
    // Accent colors
    accent: accentGreen,
    red: accentRed,
    blue: accentBlue,
    yellow: accentYellow,
    
    // Grade colors
    grade2: gradeBlue,
    grade3: gradeGreen,
    grade4: gradeRed,
    
    // Border and divider
    border: '#d0d0d0',
    divider: '#cccccc',
  },
  dark: {
    // Background and container colors (dark theme - original)
    background: '#25292e',
    container: '#3c4755',
    containerSecondary: '#2a3441',
    
    // Text colors (dark theme - original)
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#aaaaaa',
    
    // UI elements
    tint: '#ffffff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#ffffff',
    
    // Accent colors
    accent: accentGreen,
    red: accentRed,
    blue: accentBlue,
    yellow: accentYellow,
    
    // Grade colors
    grade2: gradeBlue,
    grade3: gradeGreen,
    grade4: gradeRed,
    
    // Border and divider
    border: '#555555',
    divider: '#2a2f35',
  }
};

export type Theme = 'light' | 'dark';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
