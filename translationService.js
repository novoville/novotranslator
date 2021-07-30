// Translation imports start
import en from "./translations/en.json"
import fr from "./translations/fr.json"
import nl from "./translations/nl.json"
import el from "./translations/el.json"
// Translation imports end
//Name Of Function
export default translate_nv = (value, lang) => {
    let retValue
    //START insert ifs
    if (lang === "el") {
        retValue = el[value]
    }
    if (lang === "nl") {
        retValue = nl[value]
    }
    if (lang === "fr") {
        retValue = fr[value]
    }
    if (lang === "en") {
        retValue = en[value]
    }
    //END insert Ifs
    if (retValue) { return retValue }
    return value;
}
