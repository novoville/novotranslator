#!/usr/bin/env node
"use strict";

// SYNOPSIS
//
// Format for the .xlsx file:
//
// THE IOS KEY IS FOUND IN COLUMN 0, THE ANDROID KEY IS FOUND IN COLUMN 1. JSON IN COLUMN 2
// TO ADD A LANGUAGE IT MUST BE IN THE FORMAT OF XXX_LANG.
// THE FIRST SHEET WILL BE USED TO DETERMINE THE LOCATION OF THE LANGUAGES, SUBSEQUENT SHEETS NEED CONSISTENT ORDERING

const { program } = require("commander");
program
  .version("1.0.0")
  .option("--init", "initialize component")
  .option("-a, --android", "Will generate output for android")
  .option("-i, --ios", "Will generate output for ios")
  .option("-j, --json", "Will generate json output")
  .option("-w, --web", "Will generate json output")
  .option("-v, --verbose", "Will print stuff")
  .option("-c, --checkExcel", "1. warnings for same keys 2. same translations ")
  .option("-d, --detectAndAddTranslateables", "")
  .option("-u, --warnAboutUnusedTranslations", "");

program.parse(process.argv);
const options = program.opts();
const xlsx = require("node-xlsx");
const path = require("path");
const fs = require("fs");

const { sheetPath } = fs.existsSync(
  path.join(__dirname, "../../../novotranslator/novoTranslatorConfig.js")
)
  ? require("../../../novotranslator/novoTranslatorConfig.js")
  : require("../config.js");
const { getPlatformColumn } = require("../helpers");
const translate = require("../actions/translate.js");
const warnAboutUnusedTranslations = require("../actions/warnAboutUnusedTranslations");
const detectAndAddTranslateables = require("../actions/detectAndAddTranslateables");
const checkExcel = require("../checkExcel");
///////////
// SETUP
///////////
const pathToSheet = sheetPath;
const isVerbose = options.verbose;
const checkExcelOption = options.checkExcel;
const detectAndAddTranslateablesOption = options.detectAndAddTranslateables;
const warnAboutUnusedTranslationsOpion = options.warnAboutUnusedTranslations;
const generateAndroid = options.android;
const generateIOS = options.ios;
const printToConsole = options.verbose;
const initOption = options.init;
let generateJSON = options.web || options.json;
let translateOption = options.transate;

if (!generateAndroid && !generateIOS && !generateJSON && !checkExcelOption) {
  generateJSON = true;
}
if (
  !detectAndAddTranslateablesOption &&
  !warnAboutUnusedTranslationsOpion &&
  !translateOption &&
  !checkExcelOption
) {
  translateOption = true;
}

const createNovotranslatorFolder = () => {
  const novotranslatorPathToCreate = path.join(__dirname, "../../../novotranslator");
  if (!fs.existsSync(novotranslatorPathToCreate)) {
    fs.mkdirSync(novotranslatorPathToCreate);
  }
}

const createConfig = () => {
  const configPathToCreate = path.join(
    __dirname,
    "../../../novotranslator/novoTranslatorConfig.js"
  );
  const configText = `
const nameOfFunction = "translate_nv";
const sheetPath = "${path.join(
    __dirname,
    "../../../novotranslator/sheets/translations.xlsx"
  )}";
const jsonOutputPath = "${path.join(__dirname, "../../../novotranslator/jsonOutput/")}";
const iosPath = "${path.join(__dirname, "../../../novotranslator/iOSOutput/")}";
const androidPath = "${path.join(__dirname, "../../../novotranslator/androidOutput/")}";
const srcPath = "${path.join(__dirname, "../../../")}";
const excludedFilesOrFolders = [];

module.exports = {
  nameOfFunction,
  sheetPath,
  jsonOutputPath,
  iosPath,
  androidPath,
  srcPath,
  excludedFilesOrFolders,
};`;
  fs.writeFileSync(configPathToCreate, configText);
};


const createOutputs = () => {
  const outputPathToCreate = path.join(__dirname, "../../../novotranslator/outputs");
  if (!fs.existsSync(outputPathToCreate)) {
    fs.mkdirSync(outputPathToCreate);
  }
};

const createExcell = () => {
  const excellPathToCreate = path.join(
    __dirname,
    "../../../novotranslator/sheets/translations.xlsx"
  );
  const sheetPathToCreate = path.join(__dirname, "../../../novotranslator/sheets");
  const data = [["IOS", "ANDROID", "WEB", "en_LANG", "el_LANG"]];

  var buffer = xlsx.build([{ name: "sheet1", data }]);
  try {
    if (fs.existsSync(excellPathToCreate)) {
      fs.unlinkSync(excellPathToCreate);
      if (!fs.existsSync(sheetPathToCreate)) {
        fs.mkdirSync(sheetPathToCreate);
      }
    } else {
      if (!fs.existsSync(sheetPathToCreate)) {
        fs.mkdirSync(sheetPathToCreate);
      }
      fs.writeFileSync(excellPathToCreate, buffer);
    }
  } catch (er) {
    console.log(er);
  }
};
//MUTE IF NOT VERBOSE
//if (!isVerbose) console.log = () => { }
///////////
// RUN
///////////
if (initOption) {
  createNovotranslatorFolder();
  createConfig();
  createOutputs();
  createExcell();
}
else {
  const workSheetsFromFile = xlsx.parse(pathToSheet);
  const column = getPlatformColumn({
    generateAndroid,
    generateIOS,
    generateJSON,
  });

  if (detectAndAddTranslateablesOption) {
    detectAndAddTranslateables({ workSheetsFromFile, column, pathToSheet, });
  }

  if (warnAboutUnusedTranslationsOpion) {
    warnAboutUnusedTranslations({ workSheetsFromFile, column, printToConsole, });
  }
  if (translateOption) {
    translate({ workSheetsFromFile, generateIOS, generateAndroid, generateJSON, });
  }
  if (checkExcelOption) {
    checkExcel({ android: generateAndroid, ios: generateIOS, web: generateJSON, pathToSheet, });
  }
}
