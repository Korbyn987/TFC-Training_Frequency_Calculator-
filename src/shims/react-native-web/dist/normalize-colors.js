/**
 * Shim for react-native-web/dist/normalize-colors
 * This provides the functionality that react-native-web expects
 */
import normalizeColor from 'normalize-css-color';

export default normalizeColor;

export function rgba(colorInt) {
  const r = Math.round(((colorInt & 0xff000000) >>> 24));
  const g = Math.round(((colorInt & 0x00ff0000) >>> 16));
  const b = Math.round(((colorInt & 0x0000ff00) >>> 8));
  const a = ((colorInt & 0x000000ff) >>> 0) / 255;
  return `rgba(${r},${g},${b},${a})`;
}
