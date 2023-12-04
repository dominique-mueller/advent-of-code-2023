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

  // Normalize file
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
  // Map number names -> number values
  // Note: Sadly, we have to hardcode the number names - the Intl API does not provide a more elegant solution here :(
  const numberNameToNumberValueMap = new Map<string, number>([
    ['one', 1],
    ['two', 2],
    ['three', 3],
    ['four', 4],
    ['five', 5],
    ['six', 6],
    ['seven', 7],
    ['eight', 8],
    ['nine', 9],
  ]);

  // Regular expression for finding both number and number names in a string
  // Note: We use look-ahead to also find any overlapping number names (e.g. "oneight")
  const numberOrNumberNameRegex: RegExp = new RegExp(`(?=([0-9]|${[...numberNameToNumberValueMap.keys()].join('|')}))`, 'g');

  return (
    calibrationDocument
      // Split by line (LF)
      .split(/\n/)

      // Find calibration value for the line
      .map((calibrationLine: string): number => {
        // Retrieve all numbers / number names present within the calibration line
        const allCalibrationLineNumbersOrNumberNames: Array<string> = Array.from(
          calibrationLine.matchAll(numberOrNumberNameRegex),
          (matches) => {
            return matches[1]; // Use second match group (first one is the global one, always empty)
          }
        );

        // Get first and last numbers / number names
        // Note: First and last number are allowed to be the exact same one
        const firstCalibrationLineNumberOrNumberName: string | undefined = allCalibrationLineNumbersOrNumberNames.at(0);
        const lastCalibrationLineNumberOrNumberName: string | undefined = allCalibrationLineNumbersOrNumberNames.at(-1);
        if (firstCalibrationLineNumberOrNumberName === undefined || lastCalibrationLineNumberOrNumberName === undefined) {
          return 0; // No impact on summed calibration values
        }

        // Convert number names to numbers, if applicable
        const firstCalibrationLineNumber: number =
          numberNameToNumberValueMap.get(firstCalibrationLineNumberOrNumberName) || parseInt(firstCalibrationLineNumberOrNumberName, 10);
        const lastCalibrationLineNumber: number =
          numberNameToNumberValueMap.get(lastCalibrationLineNumberOrNumberName) || parseInt(lastCalibrationLineNumberOrNumberName, 10);

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
getCalibrationDocument().then((calibrationDocument: string): void => {
  const sumOfCalibrationValues = getSumOfCalibrationValues(calibrationDocument);
  console.info('Sum of calibration values:', sumOfCalibrationValues);
});
