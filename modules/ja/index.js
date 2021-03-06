
const findHeaderElement = ($, tag, text, mode) => {

    const check = mode === true
        ? (t1, t2) => t1 === t2
        : (t1, t2) => t1.indexOf(t2) !== -1;

    const entries = $(".archive-style-wrapper " + tag);

    for (let i = 0; i < entries.length; i++) {
        const h3 = $(entries.get(i));
        if (check(h3.text(), text)) {
            return h3;
        }
    }

    return null;
};

const getTextContents = (node) => {
    const contents = node.contents();

    const texts = [];

    for(let i=0; i<contents.length; i++) {
        const tag = contents[i];
        if(tag.type === "text" && tag.data.trim() !== "") {
            texts.push(tag.data.trim());
        }
    }

    return texts;
};

module.exports = async(builder, docDir, common) => {
    const context = {
        helper : {
            getTextContents : getTextContents,
            findHeaderElement : findHeaderElement
        },
        common : common
    };

    const hero = require("./hero.js")(context);
    const artifact = require("./artifact.js")(context);
    const material = require("./material.js")(context);
    const init = require("./init.js")(context);

    builder.initialize(init.initalized);
    builder.hero(hero.url, hero.listPage, hero.dataPage, ["heros.json"], hero.csvHeaders, hero.csvEntry);
    builder.artifact(artifact.url, artifact.listPage, artifact.dataPage, ["artifacts.json"], artifact.csvHeaders, artifact.csvEntry);
    builder.material(material.url, material.listPage, material.dataPage, ["materials.json"], material.csvHeaders, material.csvEntry);
};