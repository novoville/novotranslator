const fs = require("fs");
const path = require("path");

const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const excludeFromDuplicates = ["-", " - ", "WEB"];

function getLanguages(workSheetsFromFile) {
  //this will get all the columns of the type xxx_LANG and
  //add them to an object with all the languages and their column ids
  //it is to dynamically generate the languages instead of having them fixed in columns
  //or adding thigns in code everytime a language is added

  var langsObj = {};
  var headerRow = workSheetsFromFile[0].data[0];
  for (const index in headerRow) {
    var currentItem = headerRow[index];
    if (currentItem.indexOf("_LANG") != -1) {
      langsObj[currentItem] = {
        columnIndex: index,
      };
    }
  }
  return langsObj;
}

function toColumn(index) {
  return letters[index];
}
//TODO CHECK if this needs to be driven from config
function getPlatformColumn({ generateAndroid, generateIOS, generateJSON }) {
  if (generateIOS) {
    return 0;
  }
  if (generateAndroid) {
    return 1;
  }
  if (generateJSON) {
    return 2;
  }
  return -1;
}

function isPosititiveAnswer(answer) {
  const positiveAnswers = ["Y", "YES"];
  return positiveAnswers.includes(answer.toUpperCase());
}

function printDuplicatecell({ key, cellArray, isTranslation }) {
  console.log(`DUPLICATE ${isTranslation ? "TRANSLATION" : "KEY"}: ${key}`);
  console.log(`Found At:`);
  cellArray.forEach((item) => {
    console.log(
      `Sheet: ${item.sheetName}, cell: ${toColumn(item.columnIndex)}${item.row + 1
      }`
    );
  });
  console.log("-------------------------------------------\n");
}

function flashFile(file) {
  fs.writeFileSync(file, "");
}

function getDuplicateOutputFile(isTranslation, language) {
  return path.join(
    __dirname,
    "../../novotranslator/outputs",
    isTranslation ? `${language}_DuplicateTranslation.txt` : "DuplicateKeys.txt"
  );
}

function appendToFile({ key, cellArray, isTranslation, language }) {
  const file = getDuplicateOutputFile(isTranslation, language);
  fs.appendFileSync(
    file,
    `DUPLICATE ${isTranslation ? "TRANSLATION" : "KEY"}: '${key}'\n`
  );
  fs.appendFileSync(file, `Found At:\n`);
  cellArray.forEach((item) => {
    fs.appendFileSync(
      file,
      `Sheet: ${item.sheetName}, cell: ${toColumn(item.columnIndex)}${item.row + 1
      }\n`
    );
  });
  fs.appendFileSync(file, "-------------------------------------------\n\n");
}

function appendToFileAndPrintDuplicatetFromObject(
  obj,
  isTranslation,
  printToConsole,
  language
) {
  const arrayToIterate = Object.keys(obj);
  flashFile(getDuplicateOutputFile(isTranslation, language));
  arrayToIterate.forEach((item) => {
    if (printToConsole) {
      printDuplicatecell({
        key: item,
        cellArray: obj[`${item}`],
        isTranslation,
      });
    }
    appendToFile({
      key: item,
      cellArray: obj[`${item}`],
      isTranslation,
      language,
    });
  });
}

function appendToFileUnusedKey({ key, keyName, file }) {
  fs.appendFileSync(file, `NOT USED KEY: ${keyName}\n`);
  fs.appendFileSync(file, `Found At:\n`);
  key.positions.forEach((item) => {
    fs.appendFileSync(
      file,
      `Sheet: ${item.sheetName}, cell: ${toColumn(item.columnIndex)}${item.row + 1
      }\n`
    );
  });
  fs.appendFileSync(file, "-------------------------------------------\n\n");
}

function appendToFileAndPrintUnusedKey({ key, keyName, file, printToConsole }) {
  appendToFileUnusedKey({ key, keyName, file });
  if (printToConsole) {
    console.log(`NOT USED KEY: ${keyName}`);
    console.log(`Found At:`);
    key.positions.forEach((item) => {
      console.log(
        `Sheet: ${item.sheetName}, cell: ${toColumn(item.columnIndex)}${item.row + 1
        }`
      );
    });
    console.log("-------------------------------------------\n");
  }
}

function addAllSheetsTogether(workSheetsFromFile) {
  var allSheetData = [];
  for (const sheetindex in workSheetsFromFile) {
    var sheetData = workSheetsFromFile[sheetindex].data;
    for (const sheetDataRowIndex in sheetData) {
      var sheetDataRow = sheetData[sheetDataRowIndex];
      allSheetData.push(sheetDataRow);
    }
  }
  return allSheetData;
}

function isAcceptableKey(key) {
  if (!key) {
    return false;
  }
  const unAcceptableKeys = ["-", "WEB", "ANDROID", "IOS"];
  return !unAcceptableKeys.includes(key);
}

function getKeysArrayWithFinded({ workSheetsFromFile, column }) {
  let keys = [];
  let keysWithFinded = {};
  workSheetsFromFile.forEach((sheet) => {
    sheet.data.forEach((row, index) => {
      if (isAcceptableKey(row[column])) {
        keys.push(row[column]);
        if (keysWithFinded[`${row[column]}`]) {
          keysWithFinded[`${row[column]}`].positions.push({
            sheetName: sheet.name,
            columnIndex: column,
            row: index,
          });
        } else {
          keysWithFinded[`${row[column]}`] = {
            finded: "init",
            positions: [
              {
                sheetName: sheet.name,
                columnIndex: column,
                row: index,
              },
            ],
          };
        }
      }
    });
  });
  return [keys, keysWithFinded];
}

function isApropriateFile(file) {
  const allowedFiletypes = ["js", "ts", "jsx", "tsx"];
  const fileNameArray = file.split(".");
  const fileType = fileNameArray[fileNameArray.length - 1];
  return allowedFiletypes.includes(fileType);
}

function groupByLanguageAndPlatform(workSheetsFromFile, langsObj) {
  //returns a formatted object of the form
  // LANG
  // --platform
  // ----platform_id:lang_translation

  var allSheetData = addAllSheetsTogether(workSheetsFromFile);
  var formattedData = {};
  for (const langName in langsObj) {
    var langColumnIndex = Number(langsObj[langName].columnIndex);
    for (var i = 0; i < allSheetData.length; i++) {
      var currentRow = allSheetData[i];

      //initialize if empty
      if (formattedData[langName] == undefined) {
        formattedData[langName] = {};
        if (formattedData[langName]["ios"] == undefined) {
          formattedData[langName]["ios"] = {};
        }
        if (formattedData[langName]["android"] == undefined) {
          formattedData[langName]["android"] = {};
        }
        if (formattedData[langName]["web"] == undefined) {
          formattedData[langName]["web"] = {};
        }
      }
      //assign language key values on each platform
      formattedData[langName]["ios"][currentRow[0]] =
        currentRow[langColumnIndex];
      formattedData[langName]["android"][currentRow[1]] =
        currentRow[langColumnIndex];
      formattedData[langName]["web"][currentRow[2]] =
        currentRow[langColumnIndex];
    }
  }
  return formattedData;
}

function isExludedFolder(file) {
  const excludedList = [
    "node_modules",
    "android",
    "ios",
    "translator",
    "__tests__",
    "package.json",
    "package-lock.json",
    ".git",
    ".buckconfig",
    ".eslintrc.js",
    ".gitattributes",
    ".gitignore",
    ".prettierrc.js",
    ".watchmanconfig",
    "metro.config.js",
    "babel.config.js",
  ];
  return excludedList.includes(file);
}

function getAllFilePaths(dir, filelist, excludedFilesOrFoldersFromConfig) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function (file) {
    if (!isExludedFolder(file) && !excludedFilesOrFoldersFromConfig.includes(file)) {
      var filePath = dir + "/" + file;
      if (fs.statSync(filePath).isDirectory()) {
        filelist = getAllFilePaths(filePath, filelist, excludedFilesOrFoldersFromConfig);
      } else {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
}

function getKeysArray({ workSheetsFromFile, column }) {
  let keys = [];
  workSheetsFromFile.forEach((sheet) => {
    sheet.data.forEach((row) => {
      keys.push(row[column]);
    });
  });
  return keys;
}

const insertAt = (arr, index, newItem) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index),
];

const removeAt = (arr, index) => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1),
];

function getDuplicateCellWithInfo({ sheetName, lineIndex, columnIndex, key }) {
  return {
    sheetName,
    key,
    row: lineIndex,
    columnIndex,
  };
}

function checkIfDuplicateKeyInLanguage({
  workSheetsFromFile,
  generateIOS,
  generateAndroid,
  generateJSON,
  langsObj,
}) {
  const iosIndex = 0;
  const androidIndex = 1;
  const webIndex = 2;
  const iosKeysString = [];
  const iosKeysInfos = [];
  const iosDuplicatesStrings = [];
  const iosDuplicatesKeysInfos = {};
  const androidKeysString = [];
  const androidKeysInfos = [];
  const androidDuplicatesStrings = [];
  const androidDuplicatesKeysInfos = {};
  const webKeysString = [];
  const webKeysInfos = [];
  const webDuplicatesStrings = [];
  const webDuplicatesKeysInfos = {};
  const languageTranlations = [];
  const languageTranlationsInfos = [];
  const languageDuplicatesStrings = [];
  const languageDuplicatesKeysInfos = [];
  let languages = Object.keys(langsObj);
  let formatedLanguagesArray = languages.map((language) => {
    languageTranlations.push([]);
    languageTranlationsInfos.push([]);
    languageDuplicatesStrings.push([]);
    languageDuplicatesKeysInfos.push([]);
    return {
      name: language,
      index: langsObj[`${language}`].columnIndex,
    };
  });
  workSheetsFromFile.forEach((sheet) => {
    sheet.data.forEach((line, lineIndex) => {
      let iosKey = line[iosIndex];
      let androidKey = line[androidIndex];
      let webKey = line[webIndex];
      if (generateIOS) {
        let hasDuplicateIndex = iosKeysString.findIndex(
          (item) => item === iosKey
        );
        if (
          hasDuplicateIndex > 0 &&
          iosKey &&
          !excludeFromDuplicates.includes(iosKey)
        ) {
          let firsOriginal = iosKeysInfos[hasDuplicateIndex];
          iosDuplicatesStrings.push(iosKey);
          if (iosDuplicatesKeysInfos[`${firsOriginal.key}`]) {
            iosDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: iosIndex,
                key: iosKey,
              })
            );
          } else {
            iosDuplicatesKeysInfos[`${firsOriginal.key}`] = [];
            iosDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              iosKeysInfos[hasDuplicateIndex]
            );
            iosDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: iosIndex,
                key: iosKey,
              })
            );
          }
        } else {
          iosKeysString.push(iosKey);
          iosKeysInfos.push(
            getDuplicateCellWithInfo({
              sheetName: sheet.name,
              lineIndex,
              columnIndex: iosIndex,
              key: iosKey,
            })
          );
        }
      }
      if (generateAndroid) {
        let hasDuplicateIndex = androidKeysString.findIndex(
          (item) => item === androidKey
        );
        if (
          hasDuplicateIndex > 0 &&
          androidKey &&
          !excludeFromDuplicates.includes(androidKey)
        ) {
          let firsOriginal = androidKeysInfos[hasDuplicateIndex];
          androidDuplicatesStrings.push(androidKey);
          if (androidDuplicatesKeysInfos[`${firsOriginal.key}`]) {
            androidDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: androidIndex,
                key: androidKey,
              })
            );
          } else {
            androidDuplicatesKeysInfos[`${firsOriginal.key}`] = [];
            androidDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              androidKeysInfos[hasDuplicateIndex]
            );
            androidDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: androidIndex,
                key: androidKey,
              })
            );
          }
        } else {
          androidKeysString.push(androidKey);
          androidKeysInfos.push(
            getDuplicateCellWithInfo({
              sheetName: sheet.name,
              lineIndex,
              columnIndex: androidIndex,
              key: androidKey,
            })
          );
        }
      }
      if (generateJSON) {
        let hasDuplicateIndex = webKeysString.findIndex(
          (item) => item === webKey
        );
        if (
          hasDuplicateIndex > 0 &&
          webKey &&
          !excludeFromDuplicates.includes(webKey)
        ) {
          let firsOriginal = webKeysInfos[hasDuplicateIndex];
          webDuplicatesStrings.push(webKey);
          if (webDuplicatesKeysInfos[`${firsOriginal.key}`]) {
            webDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: webIndex,
                key: webKey,
              })
            );
          } else {
            webDuplicatesKeysInfos[`${firsOriginal.key}`] = [];
            webDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              webKeysInfos[hasDuplicateIndex]
            );
            webDuplicatesKeysInfos[`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: webIndex,
                key: webKey,
              })
            );
          }
        } else {
          webKeysString.push(webKey);
          webKeysInfos.push(
            getDuplicateCellWithInfo({
              sheetName: sheet.name,
              lineIndex,
              columnIndex: webIndex,
              key: webKey,
            })
          );
        }
      }
      formatedLanguagesArray.forEach((language, index) => {
        let value = line[language.index];
        let hasDuplicateIndex = languageTranlations[index].findIndex(
          (item) => item === value
        );
        if (
          hasDuplicateIndex > 0 &&
          value &&
          !excludeFromDuplicates.includes(value)
        ) {
          let firsOriginal = languageTranlationsInfos[index][hasDuplicateIndex];
          languageDuplicatesStrings[index].push(value);
          if (languageDuplicatesKeysInfos[index][`${firsOriginal.key}`]) {
            languageDuplicatesKeysInfos[index][`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: language.index,
                key: value,
              })
            );
          } else {
            languageDuplicatesKeysInfos[index][`${firsOriginal.key}`] = [];
            languageDuplicatesKeysInfos[index][`${firsOriginal.key}`].push(
              languageTranlationsInfos[index][hasDuplicateIndex]
            );
            languageDuplicatesKeysInfos[index][`${firsOriginal.key}`].push(
              getDuplicateCellWithInfo({
                sheetName: sheet.name,
                lineIndex,
                columnIndex: language.index,
                key: value,
              })
            );
          }
        } else {
          languageTranlations[index].push(value);
          languageTranlationsInfos[index].push(
            getDuplicateCellWithInfo({
              sheetName: sheet.name,
              lineIndex,
              columnIndex: language.index,
              key: value,
            })
          );
        }
      });
    });
  });
  let objToReturn = { languageDuplicatesKeysInfos };
  if (generateIOS) {
    objToReturn = { ...objToReturn, iosDuplicatesKeysInfos };
  }
  if (generateAndroid) {
    objToReturn = { ...objToReturn, androidDuplicatesKeysInfos };
  }
  if (generateJSON) {
    objToReturn = { ...objToReturn, webDuplicatesKeysInfos };
  }
  return objToReturn;
}

module.exports = {
  flashFile,
  toColumn,
  isPosititiveAnswer,
  getLanguages,
  getPlatformColumn,
  appendToFileAndPrintDuplicatetFromObject,
  groupByLanguageAndPlatform,
  getKeysArrayWithFinded,
  isApropriateFile,
  getAllFilePaths,
  appendToFileAndPrintUnusedKey,
  getKeysArray,
  insertAt,
  removeAt,
  checkIfDuplicateKeyInLanguage,
};
