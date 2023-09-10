/**
 * Converts a hex color code to an RGB value.
 *
 * @param {string} hex - The hex color code to convert.
 * @returns {string} The RGB value of the hex color code.
 */
export default function hexToRgb(hex: string): string {
  // Remove the # character from the beginning of the hex code
  hex = hex.replace("#", "");

  // Convert the hex code to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return the RGB value as a string
  return `${r} ${g} ${b}`;
}
