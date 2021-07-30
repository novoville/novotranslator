# NovoTranslator

## Description 
Novotranslator is a tool that has been created to make it easier for Javascript developers to manage translated content on their apps.  
The translations are stored in a .xlsx document ( so that non developers can work on data entry).
The tool generates .json (and potentially strings or Android compatible .xml) files from those .xlsx files. 
Since .json files are generated by the corresponding .xlsx files, its easy to keep track of translation changes through source control.  

## Features

- Create Translation Files from .xlsx for web, android and/or ios
- Check for duplicate keys and/or translations on the .xlsx files.
- Detect translatables in your code that are not added in the .xls files and automatically add them. This allows for a quick workflow where you can add the translateables as you develop and worry about the actual translations later ( or delegate them to another team member )
- Find keys in the .xlsx files that are no longer used on your codebase. 

## Instalation 

- Install package `npm i novotranslator`. A new directory named `novotranslator` will be created at the root directory of your project. This is where translation .xlsx files will reside.
- Install dependecies `npm i node-xlsx commander mkdirp readline-sync`
- Import the translate function `import translate_nv from 'novoville_translate_tool'`

## The translate_nv function

The `translate_nv` function will by default checks the .json files that have been generated and return the translated string.
Usage
`translate_nv(translatable key, language )`

translatable key : (string) They key of the translation as found in the .xlsx files<br>
language: (string) The language in an iso format e.g "el" | "de"

## Extending translate_nv

Implement your own `translate` function if you the source of your translations is not only the .json files. A common example is needing to also look into some translation keys you have received remotly from some service e.g error code translations.

To do that simply create your own translation function that follows the logic you want and wraps `translate_nv` on a file.
Example :

```js
import translate_nv from 'novoville_translate_tool'

const my_translate = (value) => {
    let result = translate_nv(value , "en");
    if(!result){
        result = translateUsingSomeOthereStoreLikeRedux(value)
    }
    return result;
}
```

Remember that if you're using your own custom function, in order for the tool to properly scan your codebase and detect the places where translation is used, you need to let the system know of the name of your function. Look below in Config Options and simply add the option for `nameOfFunction`

## Config Options

- `nameOfFunction` The name of the function as you implemented it to make the translations
- `sheetPath` The absolute path where the sheet with the translations is stores 
- `jsonOutputPath` The absolute path where the JSONs files with the translations are stored
- `iosPath` The absolute path where the .string files with the translations are stored
- `androidPath` The absolute path where the . xml files with the translationr are stored
- `srcPath` The absolute path that will be used as root directory to scan you code for occurencies of the translation function.
- `excludedFilesOrFolders` An array that you can enter files or directories to excluded from scanning.

## Recipes

#### Translate

```
npx novotranslator -w -i -a 
```

The will read the spreadhseet and will create the apropriate files regaring parameter provides.
-w is for JSON
-i is for iOS
-a is Android

If no parameters provided then it will use the JSON

#### Detect and add Translateables
```
npx novotranslator -d
```

1. This will check all the code and find where your translation function is called.
2. Then you will be prompted to enter translations for the available languages. 
3. You will still need to run `npx novotranslator` after you have provided the translations so that the .json files are generated 
4. You can exclude files or directories by adding them on `excludedFilesOrFolders` array on `novotranslatorconfig`.

### Add Language
Open `translations.xlsx` and add a new colum. The top cell of the new column must be of the format
`{languageIsoCode}`_LANG

#### Check Spreadsheet for duplicates

`npx novotranslator -c`

Check th spreadsheets to find duplicates keys. You can find the results of this check at `novotranslator/outputs`. 
There will be one file per language to note the duplicates.

### Find Unused Keys

`npx novotranlator -u`

Check for entries in your spreadsheet that are not used in your codebase.
