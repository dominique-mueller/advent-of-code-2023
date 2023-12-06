import path from 'path';
import fs from 'fs/promises';

/**
 * PREPERATION: Get engine schematic
 */
const getEngineSchematic = async (): Promise<string> => {
  // Read engine schematic file
  // Source: <https://adventofcode.com/2023/day/3/input>
  const engineSchematic = await fs.readFile(path.join(__dirname, 'engine-schematic.txt'), {
    encoding: 'utf8',
  });

  // Normalize file content
  return (
    engineSchematic
      // Remove leading and trailing empty lines
      .trim()

      // Normalize line breaks to LF
      .split(/\r?\n/)
      .join('\n')
  );
};

// Position
type EngineLineIndex = number; // y coordinate
type EngineCharacterIndex = number; // x coordinate
type EnginePosition = [EngineLineIndex, EngineCharacterIndex]; // y/x coordinates

// Engine number
type EngineNumberValue = number;
interface EngineNumber {
  number: EngineNumberValue;
  positions: Array<EnginePosition>;
}

// Engine symbol
type EngineSymbolValue = string;
interface EngineSymbol {
  symbol: EngineSymbolValue;
  position: EnginePosition;
}

/**
 * PREPERATION: Get all engine numbers
 */
const getAllEngineNumbers = (engineSchematic: string): Array<EngineNumber> => {
  // Constants
  const engineNumberRegExp = new RegExp('[0-9]+', 'g');

  return (
    engineSchematic
      // For each line ...
      .split('\n')

      // Find engine numbers
      .map((engineSchematicLine, engineSchematiclineIndex) => {
        return [...engineSchematicLine.matchAll(engineNumberRegExp)].map((numberMatch) => {
          return {
            // Parse actual number value
            number: parseInt(numberMatch[0]),

            // Create a position entry for each number digit
            positions: Array.from(
              // Generate offsets
              { length: numberMatch[0].length },
              // Generate positions
              (_value, characterIndexOffset): EnginePosition => {
                return [engineSchematiclineIndex, (numberMatch.index as number) + characterIndexOffset];
              }
            ),
          };
        });
      })

      // Flatten list of engine numbers
      .flat(1)
  );
};

/**
 * PREPERATION: Get all engine symbols with position
 */
const getAllEngineSymbols = (engineSchematic: string): Array<EngineSymbol> => {
  // Constants
  const engineSymbolRegExp = new RegExp('[^0-9.]', 'g');

  return (
    engineSchematic
      // For each line ...
      .split('\n')

      // Find engine symbols
      .map((engineSchematicLine, engineSchematiclineIndex) => {
        return [...engineSchematicLine.matchAll(engineSymbolRegExp)].map((symbol) => {
          return {
            symbol: symbol[0],
            position: [engineSchematiclineIndex, symbol.index as number] as EnginePosition,
          };
        });
      })

      // Flatten list of engine symbols
      .flat(1)
  );
};

/**
 * TASK: Get sum of engine parts
 */
const getSumOfEngineParts = (allEngineNumbers: Array<EngineNumber>, allEngineSymbols: Array<EngineSymbol>): number => {
  return (
    allEngineNumbers
      // Only keep engine numbers that are engine parts, aka have any adjacent engine symbols
      .filter((engineNumber) => {
        return engineNumber.positions.some((engineNumberPosition) => {
          return allEngineSymbols.some((engineSymbol) => {
            // Engine number must be adjacent to engine symbol
            // Note: Difference in both x and y coordinates must be between -1 and 1
            return (
              // Line
              engineNumberPosition[0] - engineSymbol.position[0] >= -1 &&
              engineNumberPosition[0] - engineSymbol.position[0] <= 1 &&
              // Character
              engineNumberPosition[1] - engineSymbol.position[1] >= -1 &&
              engineNumberPosition[1] - engineSymbol.position[1] <= 1
            );
          });
        });
      })

      // Take the actual engine numbers
      .map((enginePart) => {
        return enginePart.number;
      })

      // Sum up all engine parts
      .reduce((sumOfEngineParts, enginePart) => {
        return sumOfEngineParts + enginePart;
      }, 0)
  );
};

/**
 * TASK: Get sum of engine gears
 */
const getSumOfEngineGears = (allEngineNumbers: Array<EngineNumber>, allEngineSymbols: Array<EngineSymbol>): number => {
  // Constants
  const engineGearSymbol = '*';
  const engineGearRequiredAdjacentEngineNumbers = 2;

  return (
    allEngineSymbols
      // Only keep engine symbols that are (potential) gears
      .filter((engineSymbol) => {
        return engineSymbol.symbol === engineGearSymbol;
      })

      // Get all engine numbers adjacent to each (potential) gear
      .map((potentialGearSymbol) => {
        return allEngineNumbers.filter((engineNumber) => {
          return engineNumber.positions.some((engineNumberPosition) => {
            // Gear must be adjacent to engine number
            // Note: Difference in both x and y coordinates must be between -1 and 1
            return (
              // Line
              potentialGearSymbol.position[0] - engineNumberPosition[0] >= -1 &&
              potentialGearSymbol.position[0] - engineNumberPosition[0] <= 1 &&
              // Character
              potentialGearSymbol.position[1] - engineNumberPosition[1] >= -1 &&
              potentialGearSymbol.position[1] - engineNumberPosition[1] <= 1
            );
          });
        });
      })

      // Only keep (now actual) gears with exactly two adjacent engine numbers
      .filter((gearAdjacentEngineNumbers) => {
        return gearAdjacentEngineNumbers.length === engineGearRequiredAdjacentEngineNumbers;
      })

      // Get gear ratios
      .map((gearAdjacentEngineNumbers) => {
        return (
          gearAdjacentEngineNumbers
            // Take actual engine numbers
            .map((gearAdjacentEngineNumber) => {
              return gearAdjacentEngineNumber.number;
            })

            // Create gear ratio by multiplying engine numbers
            .reduce((sum, gearAdjacentEngineNumber) => {
              return sum * gearAdjacentEngineNumber;
            }, 1)
        );
      })

      // Sum up all gear ratios
      .reduce((sumOfGearRatios, gearRatio) => {
        return sumOfGearRatios + gearRatio;
      }, 0)
  );
};

// Run
getEngineSchematic().then((engineSchematic: string): void => {
  // Preperation
  const allEngineNumbersWithPositions = getAllEngineNumbers(engineSchematic);
  const allEngineSymbolsWithPosition = getAllEngineSymbols(engineSchematic);

  // Part 1: Get sum of valid numbers
  const sumOfNumbersAdjacentToSymbols = getSumOfEngineParts(allEngineNumbersWithPositions, allEngineSymbolsWithPosition);
  console.info('Sum of engine parts:', sumOfNumbersAdjacentToSymbols); // Expected: 527364

  // Part 2: Get sum of gears
  const sumofGears = getSumOfEngineGears(allEngineNumbersWithPositions, allEngineSymbolsWithPosition);
  console.info('Sum of gears:', sumofGears); // Expected: 79026871
});
