import path from 'path';
import fs from 'fs/promises';

/**
 * PREPERATION: Get scratchcards
 */
const getScratchcards = async (): Promise<string> => {
  // Read scratchcards file
  // Source: <https://adventofcode.com/2023/day/4/input>
  const engineSchematic = await fs.readFile(path.join(__dirname, 'scratchcards.txt'), {
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

// Scratchcard
interface Scratchcard {
  winningNumbers: Array<string>;
  drawnNumbers: Array<string>;
}

/**
 * PREPERATION: Parse scratchcards
 */
const parseScratchcards = (scratchcards: string): Array<Scratchcard> => {
  const splitByOneOrMultipleWhitespacesRegExp = new RegExp('\\s+');

  return (
    scratchcards
      // For each line ...
      .split('\n')

      // Parse scratchcard info
      .map((scratchcard) => {
        const [scratchcardWinningNumbers, scratchcardDrawnNumbers] =
          // Get numbers
          (scratchcard.split(':').at(1) as string)
            // Get winning and drawn numbers
            .split('|')
            .map((scratchcardNumbers) => {
              return scratchcardNumbers.trim().split(splitByOneOrMultipleWhitespacesRegExp);
            });

        return {
          winningNumbers: scratchcardWinningNumbers,
          drawnNumbers: scratchcardDrawnNumbers,
        };
      })
  );
};

/**
 * TASK: Get total scratchcard points
 */
const getTotalScratchcardPoints = (scratchcards: Array<Scratchcard>): number => {
  return (
    scratchcards
      // Get scratchcard points
      .map((scratchcard) => {
        return (
          scratchcard.drawnNumbers
            // Only keep drawn numbers matching winning numbers
            .filter((drawnNumber) => {
              return scratchcard.winningNumbers.includes(drawnNumber);
            })

            // Get scratchcard points
            .reduce((scratchcardPoints) => {
              return scratchcardPoints === 0 ? 1 : scratchcardPoints * 2;
            }, 0)
        );
      })

      // Sum up all scratchcard points
      .reduce((totalScratchcardPoints, scratchcardPoints) => {
        return totalScratchcardPoints + scratchcardPoints;
      }, 0)
  );
};

/**
 * TASK: Get total scratchcards
 */
const getTotalScratchcards = (scratchcards: Array<Scratchcard>): number => {
  const scratchcardsWithCardsAndWins = scratchcards
    // Only keep drawn numbers matching winning numbers
    .map((scratchcard) => {
      return scratchcard.drawnNumbers.filter((drawnNumber) => {
        return scratchcard.winningNumbers.includes(drawnNumber);
      });
    })

    // Count number of cards and number of wins
    .map((scratchcardWinningNumbers) => {
      return {
        numberOfCards: 1, // We start with 1 scratchcard
        numberOfWins: scratchcardWinningNumbers.length,
      };
    });

  // For each scratchcard ...
  for (let scratchcardIndex = 0; scratchcardIndex < scratchcardsWithCardsAndWins.length; scratchcardIndex++) {
    // For x upcoming scratchcards based on number of wins ...
    for (
      let scratchcardWinIndexOffset = 1; // Start with 1 (next scratchcard)
      scratchcardWinIndexOffset <= scratchcardsWithCardsAndWins[scratchcardIndex].numberOfWins;
      scratchcardWinIndexOffset++
    ) {
      // Add number of cards to scratchcard
      scratchcardsWithCardsAndWins[scratchcardIndex + scratchcardWinIndexOffset].numberOfCards +=
        scratchcardsWithCardsAndWins[scratchcardIndex].numberOfCards;
    }
  }

  // Sum up total scratchcards
  return scratchcardsWithCardsAndWins.reduce((totalScratchcards, scratchcardWithCardsAndWins) => {
    return totalScratchcards + scratchcardWithCardsAndWins.numberOfCards;
  }, 0);
};

// Run
getScratchcards().then((unparsedScratchcards: string): void => {
  // Preperation
  const scratchcards = parseScratchcards(unparsedScratchcards);

  // Part 1: Get total scratchcard points
  const totalPoints = getTotalScratchcardPoints(scratchcards);
  console.info('Total scratchcard points:', totalPoints); // Expected: 23028

  // Part 2: Get total scratchcards
  const totalScratchcards = getTotalScratchcards(scratchcards);
  console.info('Total scratchcards:', totalScratchcards); // Expected: 9236992
});
