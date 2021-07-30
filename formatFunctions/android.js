var fs = require("fs");
var path = require("path")
var { androidPath } = require("../config")
var mkdirp = require('mkdirp');

function getValuesLocaleSuffix(languageIndex) {
    var valuesLocaleSuffix = `-${languageIndex.replace("_LANG", "")}`
    return valuesLocaleSuffix
}

function writeFilesSyncToAndroidOutput(languageIndex, stringToFile,) {

    const valuesLocaleSuffix = getValuesLocaleSuffix(languageIndex);
    const pathOfLocalizableFolder = path.join(__dirname, "../", androidPath, "/values" + valuesLocaleSuffix)
    const pathOfLocalizableFolderAndFile = pathOfLocalizableFolder + "/generated_strings.xml";
    mkdirp(pathOfLocalizableFolder)
        .then(() => {
            console.log(`Wrote to Android output:${pathOfLocalizableFolder}`)
            return fs.writeFileSync(pathOfLocalizableFolderAndFile, stringToFile);
        })
        .catch(err => {
            console.error(err)
        })
}

function generateAndroidTranslations(formattedData) {
    for (var languageIndex in formattedData) {

        var stringToFile = "<resources>";
        var androidKeyValues = formattedData[languageIndex]["android"];
        for (var valueIndex in androidKeyValues) {
            var key = valueIndex;

            //CLEARING UP DASHES, UNDEFINED KEYS ETC
            //if there's no key or key means there's nothing on this platform
            //ignore this pair
            if ((key.indexOf("-") != -1 && key.length < 5) || key == "undefined" || !key || key == "ANDROID") {
                continue;
            }

            var value = androidKeyValues[valueIndex];
            //if there's no value ignore. The Android resources system defaults to English
            if (!value || value == "") {
                continue;
            }
            value = value.replace(/'/g, "\\'");

            //FORMATTING ACCORDING TO ANDROID
            stringToFile = stringToFile + "\n\t" + '<string name="' + key + '">' + value + "</string>";
        }
        stringToFile += "\n</resources>";
        writeFilesSyncToAndroidOutput(languageIndex, stringToFile);
    }
}
module.exports = generateAndroidTranslations