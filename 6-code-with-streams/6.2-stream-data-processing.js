//On Kaggle nodejsdp.link/london-crime
//You can find alot of data in CSV format. Build a stream processing tool to analyze.
//Try to answer the following questions

//Did the number of crimes go up or down over the years?
//What are the most dangerous areas of London?
//What is the most commom crime per area?
//What is the least common crime per area?

//use Transform and PassThrough to filter and answer questions.
// HINT : User FORK Pattern
import { createReadStream } from "fs";
import { Transform } from "stream";
import { ParseOne } from "unzipper";
import parse from "csv-parser";

function createCrimesPerYearFilter(callback) {
  const crimesPerYear = {};

  const crimesPerYearStream = new Transform({
    objectMode: true,
    transform({ value, year }, encoding, cb) {
      if (!crimesPerYear[year]) {
        crimesPerYear[year] = 0;
      }

      crimesPerYear[year] += Number(value);
      cb();
    },
  });

  if (callback) {
    crimesPerYearStream.on("finish", () => callback(crimesPerYear));
  }

  return crimesPerYearStream;
}

function createCrimePerArea(callback) {
  const crimePerArea = {};

  const crimesPerYearStream = new Transform({
    objectMode: true,
    transform({ borough, value, major_category }, encoding, cb) {
      if (!crimePerArea[borough]) {
        crimePerArea[borough] = {};
      }

      if (!crimePerArea[borough][major_category]) {
        crimePerArea[borough][major_category] = 0;
      }

      crimePerArea[borough][major_category] += Number(value);

      cb();
    },
  });

  if (callback) {
    crimesPerYearStream.on("finish", () => callback(crimePerArea));
  }

  return crimesPerYearStream;
}

function createMostDangerousAreasFilter(callback) {
  const mostDangerousArea = {};

  const mostDangerousAreaStrdangeam = new Transform({
    objectMode: true,
    transform({ borough, value }, enc, cb) {
      if (!mostDangerousArea[borough]) {
        mostDangerousArea[borough] = 0;
      }
      mostDangerousArea[borough] += Number(value);
      cb();
    },
  });

  if (callback) {
    mostDangerousAreaStrdangeam.on("finish", () => callback(mostDangerousArea));
  }

  return mostDangerousAreaStrdangeam;
}

(() => {
  const csvStream = createReadStream("./archive.zip")
    .pipe(ParseOne())
    .pipe(parse());

  function filterBy(comparator, slice = 4) {
    return (totalCrimesPerArea) => {
      const data = Object.entries(totalCrimesPerArea)
        .sort(comparator)
        .slice(0, slice)
        .reduce((p, c) => {
          return {
            ...p,
            [c[0]]: c[1],
          };
        }, {});
      console.log(data);
    };
  }

  csvStream.pipe(createCrimesPerYearFilter());
  csvStream.pipe(
    createMostDangerousAreasFilter(filterBy((a, b) => b[1] - a[1], 4))
  );
  csvStream.pipe(
    createMostDangerousAreasFilter(filterBy((a, b) => a[1] - b[1], 4))
  );
  csvStream.pipe(createCrimePerArea());
})();
