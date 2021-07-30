# NovoTranslator

## Description 
Novotranslator is a tool that has been made to make easier for javascript developers to have translated content on their apps.  
The translations are stored in spreadsheet that can be uses also by non developers for data entry. 
Then using the tool, you can create JSON, .strings, or android Compatible xml files with the translations. 
Also for JSON you can use the translate_nv function in order to make thra tranlsation in app. 
Tranlsate_nv gets two parameters language on iso format and the string to translate. 
Also with tool you can find duplicates translations and also check your code for untraslated keys. 

## Instalation 
- Install package npm i novotranslator. After the installation you a new directory  with name `novotranslator` will be created at the root directory of your project
- Install dependecnies npm i node-xlsx commander mkdirp readline-sync
- You need to implement translate function  where you need to import trnaslate_nv from TranslatationService and then call translate_nv(string_to_translate, language)

## Features

- Create Translation Files from Excell for web, android, ios
- Check for duplicate keys and Translations on excel file
- Detect where in code you have translatables that are not added in xls and add them
- Find Keys in the excel that are not used on your source code 

## Config Explain
- nameOfFunction The name of the function you implemented to make the translations (ex: myTranslate)
- sheetPath The absolute path where the sheet with the translations is stores 
- jsonOutputPath The absolute path where the JSONs files with the translations are stored
- iosPath The absolute path where the .string files with the translations are stored
- androidPath The absolute path where the . xml files with the translationr are stored
- srcPath The absolute path that will be used as root directory to scan you code for occurencies of the translation function.
- excludedFilesOrFolders An array that you can enter files or directories to excluded from scanning.

## Recipes

#### Translate
npx novotranslator -w -i -a
This will read the spreadhseet and will create the apropriate files regaring parameter provides.
-w is forJSON
-i is for IOs
-a is Andorid
If no parameters provided then it will use the JSON 

#### Detect and add Translateables
 npx novotranslator -d
This will check all the code and fine where your translation Function is called.
Then you will prompt to enter translations for the available languages. 
You will still need to run npx novotranslator after you have inputed the translations 
You can exclude files or directories by adding them on excludedFilesOrFolders array on novotranslatorconfig.
### Add Language
Open  translations.xlsx and add new colum. The top cell of the new column must at this format `languageIsoCode`_LANG
#### Check Spreadsheet
npx novotranslator -c
Check spreadsheet if there are duplicates keys . You can find the results in novotranslator/outputs. 
There will be one file per language that will have duplicate translations of this language
### Find Unused Keys
npx novotranlator -u 
Check if there are entries that are unused in the spreadsheet



