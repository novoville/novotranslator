const path = require("path")
const fs = require("fs")
const xlsx = require("node-xlsx")

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
  };
`;
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

createNovotranslatorFolder()
createConfig()
createOutputs()
createExcell()
