
class Builder {

    constructor(gen) {
        this.gen = gen;
    };

    hero(url, lparser, dparser) {
        this.gen.setCharacterListUrl(url)
            .setCaharacterListPageParser(lparser)
            .setCaharacterDataPageParser(dparser);
        return this;
    };
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

    setArtifactListUrl(url) {
        this.artifactListUrl = url;
        return this;
    };
    setCharacterListUrl(url) {
        this.characterListUrl = url;
        return this;
    };
    setMaterialListUrl(url) {
        this.materialListUrl = url;
        return this;
    };


    setArtifactListPageParser(parser) {
        this.artifactListPageParser = parser;
        return this;
    };
    setCaharacterListPageParser(parser) {
        this.caharacterListPageParser = parser;
        return this;
    };
    setMaterialListPageParser(parser) {
        this.materialListPageParser = parser;
        return this;
    };

    setCaharacterDataPageParser(parser) {
        this.caharacterDataPageParser = parser;
        return this;
    };
    setArtifactDataPageParser(parser) {
        this.artifactDataPageParser = parser;
        return this;
    };
    setMaterialDataPageParser(parser) {
        this.materialDataPageParser = parser;
        return this;
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

            const r = await common.requestWithCache(page.url);

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