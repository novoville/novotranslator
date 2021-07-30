const xlsx = require("node-xlsx");
const { appendToFileAndPrintDuplicatetFromObject, getLanguages, checkIfDuplicateKeyInLanguage, } = require("./helpers");

function checkExell(options) {
  const generateAndroid = options.android;
  const generateIOS = options.ios;
  const printToConsole = options.printToConsole;
  let generateJSON = options.json;

  if (!generateAndroid && !generateIOS && !generateJSON) {
    generateJSON = true;
  }

  const pathToSheet = options.pathToSheet;
  const workSheetsFromFile = xlsx.parse(pathToSheet);
  const langsObj = getLanguages(workSheetsFromFile);

  const {
    languageDuplicatesKeysInfos,
    webDuplicatesKeysInfos,
    iosDuplicatesKeysInfos,
    androidDuplicatesKeysInfos,
  } = checkIfDuplicateKeyInLanguage({
    workSheetsFromFile,
    generateIOS,
    generateAndroid,
    generateJSON,
    langsObj,
  });
  const webDuplicateKeysLength = Object.keys(webDuplicatesKeysInfos || {}).length;
  const iosDuplicateKeysLength = Object.keys(iosDuplicatesKeysInfos || {}).length;
  const androidDuplicateKeysLength = Object.keys(androidDuplicatesKeysInfos || {}).length;

  const sumOfDuplicateKeys = webDuplicateKeysLength + iosDuplicateKeysLength + androidDuplicateKeysLength;

  let sumOfDuplicateTranslations = 0;
  languageDuplicatesKeysInfos.forEach((item) => {
    sumOfDuplicateTranslations = sumOfDuplicateTranslations + Object.keys(item).length;
  });

  console.log("\n================================");
  console.log("WILL CHECK FOR DUPLICATES");
  console.log("================================");
  console.log(`\nTotal found ${sumOfDuplicateKeys} duplicate keys`);
  console.log(
    `\nTotal found ${sumOfDuplicateTranslations} duplicate translations \n`
  );

  if (generateAndroid) {
    appendToFileAndPrintDuplicatetFromObject(androidDuplicatesKeysInfos, false, printToConsole);
  }
  if (generateIOS) {
    appendToFileAndPrintDuplicatetFromObject(iosDuplicatesKeysInfos, false, printToConsole);
  }
  if (generateJSON) {
    appendToFileAndPrintDuplicatetFromObject(webDuplicatesKeysInfos, false, printToConsole);
  }

  const getLanguageString = (item) => {
    let columnIndex = Object.values(item)[0][0].columnIndex;
    let lang = Object.entries(langsObj)
      .find((lang) => lang[1].columnIndex === columnIndex)[0]
      .replace("_LANG", "");
    return lang;
  };

  languageDuplicatesKeysInfos.forEach((item) => {
    let arrayOfDuplciates = Object.values(item)
    if (arrayOfDuplciates.length > 0) {
      appendToFileAndPrintDuplicatetFromObject(item, true, printToConsole, getLanguageString(item));
    }
  });
}
module.exports = checkExell;
