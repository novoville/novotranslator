var fs = require("fs");
var path = require("path")
var mkdirp = require('mkdirp');

var { jsonOutputPath } = fs.existsSync(
    path.join(__dirname, "../../../novotranslator/novoTranslatorConfig.js")
)
    ? require("../../../novotranslator/novoTranslatorConfig.js")
    : require("../config.js");


function writeFilesSyncToJSONOutput(languageIndex, stringToFile,) {
    const pathOfLocalizableFolder = path.join(jsonOutputPath)
    const pathOfLocalizableFolderAndFile = pathOfLocalizableFolder + languageIndex.replace("_LANG", "") + ".json";
    mkdirp(pathOfLocalizableFolder).then(() => {
        console.log(`Wrote to JSON output:${pathOfLocalizableFolder}`)
        return fs.writeFileSync(pathOfLocalizableFolderAndFile, stringToFile);

    }).catch(err => {

        if (err) console.error(err)
    })
}
function generateJSONtranslations(formattedData,) {
    var fistKey = Object.keys(formattedData)[0]
    for (var languageIndex in formattedData) {
        var stringToFile = "";
        var jsonKeyValues = formattedData[languageIndex]["web"];
        var jsonKeyENGLISH = formattedData[fistKey]["web"];

        for (var valueIndex in jsonKeyValues) {
            var key = valueIndex;

            //CLEARING UP DASHES, UNDEFINED KEYS ETC
            //if there's no key or key means there's nothing on this platform
            //ignore this pair
            if ((key.indexOf("-") != -1 && key.length < 5) || key == "undefined" || !key || key == "WEB") {
                continue;
            } else {
                key = key.replace(/"/g, "");
            }

            var value = jsonKeyValues[valueIndex];
            //if there's no value fallback to english, otherwise if theres nothing there ignore
            if (!value || value == "") {
                value = jsonKeyENGLISH[valueIndex];
                if (!value || value == "") {
                    continue;
                } else {
                    value = value.replace(/"/g, "");
                }
            } else {
                value = value.replace(/"/g, "");
            }

            //JSON FORMATTING
            stringToFile = stringToFile + (stringToFile ? "\n" : "") + '    "' + key + '"' + ": " + '"' + value + '"' + ",";
        }

        stringToFile = "{\n" + stringToFile.slice(0, -1) + "\n}";
        writeFilesSyncToJSONOutput(languageIndex, stringToFile,);
    }
}

module.exports = generateJSONtranslations