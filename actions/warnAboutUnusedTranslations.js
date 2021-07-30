const path = require("path");
const fs = require("fs");

const { nameOfFunction, srcPath, excludedFilesOrFolders } = fs.existsSync(
  path.join(__dirname, "../../../novotranslator/novoTranslatorConfig.js")
)
  ? require("../../../novotranslator/novoTranslatorConfig.js")
  : require("../config.js");
const {
  getKeysArrayWithFinded,
  isApropriateFile,
  getAllFilePaths,
  appendToFileAndPrintUnusedKey,
  flashFile,
} = require("../helpers");

function warnAboutUnusedTranslations({
  workSheetsFromFile,
  column,
  printToConsole,
}) {
  const file = path.join(
    __dirname,
    "../../../novotranslator/outputs",
    "unusedTranslations.txt"
  );
  if (column < 0) {
    console.error("Platform not Specified");
    process.exit();
  }
  var [keys, keysWithFinded] = getKeysArrayWithFinded({
    workSheetsFromFile,
    column,
  });
  const directoryPath = path.join(srcPath);
  const files = getAllFilePaths(directoryPath, [], excludedFilesOrFolders);
  for (const file of files) {
    const isaw = isApropriateFile(file);
    if (isaw) {
      var t = fs.readFileSync(file).toString();
      var regex = new RegExp(`${nameOfFunction}\\(["']([^)]+)`, "g");
      var match = regex.exec(t);
      while (match) {
        let key = match[1].slice(0, -1);
        if (keysWithFinded[key]) {
          if (keysWithFinded[key].finded === "init") {
            keysWithFinded[key].finded = "found";
          }
        }
        match = regex.exec(t);
      }
    }
  }
  flashFile(file);
  for (const key in keysWithFinded) {
    if (keysWithFinded[key].finded !== "found") {
      appendToFileAndPrintUnusedKey({
        key: keysWithFinded[key],
        keyName: key,
        file,
        printToConsole,
      });
    }
  }
}

module.exports = warnAboutUnusedTranslations;
