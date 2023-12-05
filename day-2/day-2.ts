import path from 'path';
import fs from 'fs/promises';

/**
 * PREPERATION: Get recorded games
 */
const getRecordedGames = async (): Promise<string> => {
  // Read recorded games file
  // Source: <https://adventofcode.com/2023/day/2/input>
  const recordedGames = await fs.readFile(path.join(__dirname, 'recorded-games.txt'), {
    encoding: 'utf8',
  });

  // Normalize file content
  return (
    recordedGames
      // Remove leading and trailing empty lines
      .trim()

      // Normalize line breaks to LF
      .split(/\r?\n/)
      .join('\n')
  );
};

/**
 * Ball Count
 */
type BallCount = number;

/**
 * Ball Collection (e.g. reveal, requirement)
 */
type BallCollection = {
  red: BallCount;
  green: BallCount;
  blue: BallCount;
};

/**
 * Game ID
 */
type GameId = string;

/**
 * Games
 */
type Games = Record<GameId, Array<BallCollection>>;

/**
 * PREPERATION: Parse recorded games
 */
const parseRecordedGames = (recordedGamesUnparsed: string): Games => {
  return Object.fromEntries(
    recordedGamesUnparsed.split('\n').map((recordedGameUnparsed) => {
      const [gameUnparsed, ballCollectionUnparsed] = recordedGameUnparsed.split(': ');
      const gameId = gameUnparsed.split(' ')[1];

      const ballCollections: Array<BallCollection> = ballCollectionUnparsed.split('; ').map((ballCollectionUnparsed): BallCollection => {
        const baseBallCollection: BallCollection = {
          green: 0,
          blue: 0,
          red: 0,
        };

        return {
          ...baseBallCollection,
          ...Object.fromEntries(
            ballCollectionUnparsed.split(', ').map((ballUnparsed) => {
              const [countUnparsed, colorName] = ballUnparsed.split(' ');
              return [colorName, parseInt(countUnparsed, 10)];
            })
          ),
        };
      });

      return [gameId, ballCollections];
    })
  );
};

/**
 * TASK: Get sum of Game IDs for possible games, based on used ball collection
 */
const getSumOfGameIdsForPossibleGames = (recordedGames: Games, usedBallCollection: BallCollection): number => {
  return (
    Object
      // For every game ...
      .entries(recordedGames)

      // Filter out any game that is not possible with the used ball collection (not enough balls!!!)
      .filter(([, ballCollections]) => {
        // Check whether at least one ball collection is not big enough for at least one color
        return !ballCollections.some((ballCollection: BallCollection) => {
          return (
            ballCollection.red > usedBallCollection.red ||
            ballCollection.green > usedBallCollection.green ||
            ballCollection.blue > usedBallCollection.blue
          );
        });
      })

      // Turn game ID into number
      .map(([gameId]) => {
        return parseInt(gameId, 10);
      })

      // Sum up all game IDs
      .reduce((summedGameIds, gameId) => {
        return summedGameIds + gameId;
      }, 0)
  );
};

/**
 * TASK: Get sum of powers for minimum ball collections
 */
const getSumOfPowersForMinimumBallCollections = (recordedGames: Games): number => {
  return (
    Object
      // For each game ...
      .values(recordedGames)

      .map((ballCollections) => {
        // For each ball color ...
        return (
          (['red', 'green', 'blue'] as Array<keyof BallCollection>)

            // Get the ball count for the ball color
            .map((ballColor) => {
              return ballCollections.map((ballCollection) => {
                return ballCollection[ballColor];
              });
            })

            // Find the largest count of balls for this color
            .map((ballCounts) => {
              return Math.max(...ballCounts);
            })

            // Multiply max ball counts of all colors into a "power"
            .reduce((power, maxBallCount) => {
              return power * maxBallCount;
            }, 1)
        );
      })

      // Sum up the powers of all games (a "mega-power", perhaps?)
      .reduce((sumOfPowers, power) => {
        return sumOfPowers + power;
      }, 0)
  );
};

// Run
getRecordedGames().then((unparsedRecordedGames: string): void => {
  // Preperation: Parse recorded games
  const recordedGames = parseRecordedGames(unparsedRecordedGames);

  // Part 1: Get sum of game IDs of all possible games
  const usedBallCollection: BallCollection = {
    red: 12,
    green: 13,
    blue: 14,
  };
  const sumOfPossibleGameIds = getSumOfGameIdsForPossibleGames(recordedGames, usedBallCollection);
  console.info('Sum of Game IDs for possible games:', sumOfPossibleGameIds); // Expected: 2162

  // Part 2: Get sum of powers
  const sumOfPowers = getSumOfPowersForMinimumBallCollections(recordedGames);
  console.info('Sum of powers for minimum ball collections:', sumOfPowers); // Expected: 72513
});
