/**
 * Capitalizes only letters in a location name while preserving numbers, symbols, and spaces
 * @param {string} text - The text to capitalize
 * @returns {string} - The capitalized text
 */
export const capitalizeLocation = (text) => {
  return text.split('').map(char => {
    if (/[a-zA-Z]/.test(char)) {
      return char.toUpperCase();
    }
    return char; // Keep numbers, symbols, and spaces as-is
  }).join('');
};
