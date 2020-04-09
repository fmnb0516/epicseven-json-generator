
class Builder {

};

class Generator {

    constructor() {
        this.artifactListUrl = null;
        this.characterListUrl = null;
        this.materialListUrl = null;

        this.artifactListPageParser = null
        this.caharacterListPageParser = null;
        this.materialListPageParser = null;
        this.caharacterDataPageParser = null; 
        this.artifactDataPageParser = null;
        this.materialDataPageParser = null;
    };

    toBuilder() {
        return new Builder(this);
    };

    async generate(docsDir, common) {

        /* start hero data */
        const heroPages = await this.caharacterListPageParser(common.dom(await common.requestWithCache(this.characterListUrl)));
        const heros = [];

        for(let i =0; i<heroPages.length; i++) {
            const page = heroPages[i];
            const heroName = page.name;
            const jsonPath = docsDir + "/hero/"+heroName + ".json";

            const r = await modules.requestWithCache(page.url);

            const $$ = common.dom(r);
            const dataBuilder = common.createDataBuilder("hero" ,await common.readJson(jsonPath));
            await this.caharacterDataPageParser($$, dataBuilder);

            await common.toTextFile(jsonPath, dataBuilder.toJsonString());
            heros.push(heroName + ".json");
        }

        await common.toTextFile(docsDir + "/hero/heros.json", JSON.stringify(heros, null, "\t"), "utf8");
        /* end hero data */
    };

};

module.exports.Generator = Generator;