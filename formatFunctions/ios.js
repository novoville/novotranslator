var fs = require("fs");
var path = require("path")
var mkdirp = require('mkdirp');

var { iosPath } = require("../config")

function writeFilesSyncToIosOutput(languageIndex, stringToFile) {
    const pathOfLocalizableFolder = path.join(__dirname, "../", iosPath)
    const pathOfLocalizableFolderAndFile = pathOfLocalizableFolder + languageIndex.replace("_LANG", "") + ".strings";
    mkdirp(pathOfLocalizableFolder)
        .then(() => {
            console.log(`Wrote to iOS output:${pathOfLocalizableFolder}`)
            return fs.writeFileSync(pathOfLocalizableFolderAndFile, stringToFile);
        })
        .catch(err => {
            console.error(err)
        })
}

function generateiOStranslatios(formattedData) {

    var fistKey = Object.keys(formattedData)[0]
    for (var languageIndex in formattedData) {

        var stringToFile = "";
        var iosKeyValues = formattedData[languageIndex]["ios"];
        var iosKeyENGLISH = formattedData[fistKey]["ios"];

        for (var valueIndex in iosKeyValues) {
            var key = valueIndex;

            //CLEARING UP DASHES, UNDEFINED KEYS ETC
            //if there's no key or key means there's nothing on this platform
            //ignore this pair
            if ((key.indexOf("-") != -1 && key.length < 5) || key == "undefined" || !key || key == "IOS") {
                continue;
            } else {
                key = key.replace(/"/g, "");
            }

            var value = iosKeyValues[valueIndex];
            //if there's no value fallback to english, otherwise if theres nothing there ignore
            if (!value || value == "") {
                value = iosKeyENGLISH[valueIndex];
                if (!value || value == "") {
                    continue;
                } else {
                    value = value.replace(/"/g, "");
                }
            } else {
                value = value.replace(/"/g, "");
            }

            //FORMATTING ACCORDING TO IOS
            stringToFile = stringToFile + "\n" + '"' + key + '"' + " = " + '"' + value + '"' + ";";
        }
        writeFilesSyncToIosOutput(languageIndex, stringToFile,);
    }
}

module.exports = generateiOStranslatios