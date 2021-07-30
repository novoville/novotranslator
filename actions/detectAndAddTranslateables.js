const path = require("path");
const fs = require("fs");
const xlsx = require("node-xlsx");
const readlineSync = require("readline-sync");
const { getKeysArray, isPosititiveAnswer, isApropriateFile, getAllFilePaths, getLanguages, } = require("../helpers");
const { nameOfFunction, srcPath, excludedFilesOrFolders, } = fs
  .existsSync(path.join(__dirname, "../../../novotranslator/novoTranslatorConfig.js"))
  ? require("../../../novotranslator/novoTranslatorConfig.js")
  : require("../config.js");

function addToExcell({ workSheetsFromFile, translations, key, langsArray, pathToSheet, column, }) {

  let rowToInsert = ["", "", ""];
  rowToInsert[column] = key;
  var index = 0;
  for (const language of langsArray) {
    rowToInsert.push(translations[index]);
    index++;
  }
  workSheetsFromFile[workSheetsFromFile.length - 1].data.push(rowToInsert);
  var buffer = xlsx.build(workSheetsFromFile);
  fs.writeFileSync(pathToSheet, buffer);
}

function detectAndAddTranslateables({ workSheetsFromFile, column, pathToSheet, }) {
  const langsObj = getLanguages(workSheetsFromFile);
  if (column < 0) {
    console.error("Platform not Specified");
    process.exit();
  }
  var keys = getKeysArray({ workSheetsFromFile, column });
  const directoryPath = path.join(srcPath);

  let langsArray = Object.keys(langsObj);
  const files = getAllFilePaths(directoryPath, [], excludedFilesOrFolders);

  for (const file of files) {
    const isaw = isApropriateFile(file);
    if (isaw) {
      var t = fs.readFileSync(file).toString();
      var regex = new RegExp(`${nameOfFunction}\\(["']([^)]+)`, "g");
      var match = regex.exec(t);
      while (match) {
        let key = match[1].slice(0, -1);
        if (!keys.includes(key)) {
          const answer = readlineSync.question(
            `"${key}" does not exist.\nDo you want to add it ? Y/n: `
          );
          if (isPosititiveAnswer(answer)) {
            const translations = [];
            var index = 0;
            for (const language of langsArray) {
              const translationAnswer = readlineSync.question(`Enter ${language.replace("_LANG", "")} translation or press enter to keep the key:\t`);
              translations[index] = translationAnswer.trim() === "" ? key : translationAnswer; index++;
            }
            addToExcell({ workSheetsFromFile, translations, key, langsArray, pathToSheet, column, });
            keys = getKeysArray({ workSheetsFromFile, column });
          }
        }
        match = regex.exec(t);
      }
    }
  }
}

module.exports = detectAndAddTranslateables;
