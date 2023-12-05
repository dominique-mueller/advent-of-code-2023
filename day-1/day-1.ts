import path from 'path';
import fs from 'fs/promises';

/**
 * PREPERATION: Get calibration document
 */
const getCalibrationDocument = async (): Promise<string> => {
  // Read calibration document file
  // Source: <https://adventofcode.com/2023/day/1/input>
  const calibrationDocument = await fs.readFile(path.join(__dirname, 'calibration-document.txt'), {
    encoding: 'utf8',
  });

  // Normalize file content
  return (
    calibrationDocument
      // Remove leading and trailing empty lines
      .trim()

      // Normalize line breaks to LF
      .split(/\r?\n/)
      .join('\n')
  );
};

/**
 * TASK: Get sum of calibration values
 */
const getSumOfCalibrationValues = (calibrationDocument: string) => {
  // Map of number variants to number values
  const numberVariantToNumberValueMap: Record<string, number> = {
    // Numbers ...
    ['1']: 1,
    ['2']: 2,
    ['3']: 3,
    ['4']: 4,
    ['5']: 5,
    ['6']: 6,
    ['7']: 7,
    ['8']: 8,
    ['9']: 9,

    // Spelled-out numbers ...
    // Note: Hardcoded names because a more elegant solution (e,g, Intl API) is not available :(
    ['one']: 1,
    ['two']: 2,
    ['three']: 3,
    ['four']: 4,
    ['five']: 5,
    ['six']: 6,
    ['seven']: 7,
    ['eight']: 8,
    ['nine']: 9,
  };

  // Regular expression for finding all number variants
  // Note: This includes overlapping number variants (e.g. "oneight" => "one" and "eight"), via look-ahead (?=)
  const numberVariantRegExp: RegExp = new RegExp(`(?=(${Object.keys(numberVariantToNumberValueMap).join('|')}))`, 'g');

  // Get sum of calibration values
  return (
    calibrationDocument
      // Split by line (LF)
      .split(/\n/)

      // Get calibration value for the line
      .map((calibrationLine: string): number => {
        // Parse all number variants from the calibration line
        const allCalibrationLineNumberVariants: Array<string> = Array.from(
          calibrationLine.matchAll(numberVariantRegExp), // Possibly empty if no number variant is found
          (matches: RegExpMatchArray): string => {
            return matches[1]; // Use second / inner match group (first / outer match group is the global one)
          }
        );

        // Get first and last parsed number variants
        // Note: First and last number variants are allowed to be the exact same match
        const firstCalibrationLineNumberVariant: string = allCalibrationLineNumberVariants.at(0) as string; // Assumed per task definition
        const lastCalibrationLineNumberVariant: string = allCalibrationLineNumberVariants.at(-1) as string; // Assumed per task definition

        // Convert number variants to actual number values
        const firstCalibrationLineNumber: number = numberVariantToNumberValueMap[firstCalibrationLineNumberVariant];
        const lastCalibrationLineNumber: number = numberVariantToNumberValueMap[lastCalibrationLineNumberVariant];

        // Create calibration value by combining first and last calibration line numbers into new number
        return parseInt(`${firstCalibrationLineNumber}${lastCalibrationLineNumber}`, 10);
      })

      // Sum up all calibration values
      .reduce((summedCalibrationValue: number, calibrationValue: number): number => {
        return summedCalibrationValue + calibrationValue;
      }, 0)
  );
};

// Run
// Expected: 53348
getCalibrationDocument().then((calibrationDocument: string): void => {
  const sumOfCalibrationValues = getSumOfCalibrationValues(calibrationDocument);
  console.info('Sum of calibration values:', sumOfCalibrationValues);
});
