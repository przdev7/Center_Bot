/**
 * Returns a random element from an array.
 * @param array The array to get a random element from.
 * @returns A random element from the array or undefined if the array is empty.
 */
export function arrayGetRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined; // Handle empty array case as needed
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
export function arrayShufle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
