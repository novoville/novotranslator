const path = require("path");
const fs = require("fs");
const { jsonOutputPath, iosPath, androidPath, } = fs.existsSync(
  path.join(__dirname, "../../../novotranslator/novoTranslatorConfig.js")
)
  ? require("../../../novotranslator/novoTranslatorConfig.js")
  : require("../config.js");
const generateiOStranslatios = require("../formatFunctions/ios");
const generateAndroidTranslations = require("../formatFunctions/android");
const generateJSONtranslations = require("../formatFunctions/json");
const { getLanguages, groupByLanguageAndPlatform, insertAt, removeAt, } = require("../helpers");
const importStartString = "// Translation imports start";
const importEndtring = "// Translation imports end";
const ifStartString = "//START insert ifs";
const ifEndtring = "//END insert Ifs";
const nameOfFunctionString = "//Name Of Function";

function translate({ workSheetsFromFile, generateIOS, generateAndroid, generateJSON, }) {

  const langsObj = getLanguages(workSheetsFromFile);
  const formattedData = groupByLanguageAndPlatform(workSheetsFromFile, langsObj);
  const languagesPrefix = Object.keys(langsObj).map((item) => item.split("_")[0]);
  const translationServicePath = path.join(__dirname, "../", "translationService.js");
  const translationServiceFileContents = fs
    .readFileSync(translationServicePath)
    .toString()
    .split("\n");
  var tempArray = translationServiceFileContents;
  var finsStartOfImpor = translationServiceFileContents.findIndex((item) => item.includes(importStartString)) + 1;
  const finsEndOfImpor = translationServiceFileContents.findIndex((item) => item.includes(importEndtring)) + 1;
  for (let i = finsStartOfImpor; i < finsEndOfImpor - 1; i++) {
    tempArray = removeAt(tempArray, finsStartOfImpor);
  }
  for (const language of languagesPrefix) {
    tempArray = insertAt(tempArray, finsStartOfImpor, `import ${language} from "../../novotranslator/jsonOutput/${language}.json"`);
    finsStartOfImpor++;
  }
  const declareFunctionIndex = tempArray.findIndex((item) => item.includes(nameOfFunctionString)) + 1;
  tempArray = removeAt(tempArray, declareFunctionIndex);
  tempArray = insertAt(tempArray, declareFunctionIndex, `export default translate_nv = (value, lang="en") => {`);
  var finsStartOfIfs = tempArray.findIndex((item) => item.includes(ifStartString)) + 1;
  const finsEndOfIfs = tempArray.findIndex((item) => item.includes(ifEndtring)) + 1;
  for (let i = finsStartOfIfs; i < finsEndOfIfs - 1; i++) {
    tempArray = removeAt(tempArray, finsStartOfIfs);
  }
  for (const language of languagesPrefix) {
    const ifStringToInsert = `    if (lang === "${language}") {
        retValue = ${language}[value]
    }`;

    tempArray = insertAt(tempArray, finsStartOfIfs, ifStringToInsert);
    finsStartOfImpor++;
  }
  const stringToWrite = tempArray.join("\n");
  try {
    fs.writeFileSync(translationServicePath, stringToWrite);
  } catch (ex) {
    console.log("Error on writing the file");
  }

  if (generateIOS) {
    console.log("Generating ios translations");
    generateiOStranslatios(formattedData);
  }
  if (generateAndroid) {
    console.log("Generating android translations");
    generateAndroidTranslations(formattedData);
  }
  if (generateJSON) {
    console.log("Generating web translations");
    generateJSONtranslations(formattedData);
  }
}

module.exports = translate;
