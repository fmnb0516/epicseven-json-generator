
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
    const skillmultipliers = (($) => {
        const result = {};

        const parse = (e) => {
            const text = e.find("span b").text();
            const note = e.find("span.f-12").text();
            return {text : text, note : note};
        };

        $("table.skill-multiplier tbody tr").each((i,e) => {
            const name = $(e).find(".char-name").text().trim();
            const tds = $(e).find("td");

            result[name] = {
                s1: parse($(tds.get(1))),
                s2: parse($(tds.get(2))),
                s3: parse($(tds.get(3))),
            };
        });

        return result;
    })(common.dom(await common.readFileNoErr("./modules/ja/skillmultipliers.html")));
    common.toTextFile("./modules/ja/skillmultipliers.json", JSON.stringify(skillmultipliers, null, "\t"));
    
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

    builder.hero(hero.url, hero.listPage, hero.dataPage);
    builder.artifact(artifact.url, artifact.listPage, artifact.dataPage);
    builder.material(material.url, material.listPage, material.dataPage);
};