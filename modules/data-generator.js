
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

    artifact(url, lparser, dparser) {
        this.gen.setArtifactListUrl(url)
            .setArtifactListPageParser(lparser)
            .setArtifactDataPageParser(dparser);
        return this;
    };

    material(url, lparser, dparser) {
        this.gen.setMaterialListUrl(url)
            .setMaterialListPageParser(lparser)
            .setMaterialDataPageParser(dparser);
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

        await common.toTextFile(docsDir + "/hero/heros.json", JSON.stringify(heros, null, "\t"));
        /* end hero data */

        /* start artifact data */
        const artifactPages = await this.artifactListPageParser(common.dom(await common.requestWithCache(this.artifactListUrl)));
        const artifacts = [];

        for(let i =0; i<artifactPages.length; i++) {
            const page = artifactPages[i];
            const artifactName = page.name;

            const jsonPath = docsDir+"/artifact/"+artifactName + ".json";

            const r = await common.requestWithCache(page.url);

            const $$ = common.dom(r);
            const dataBuilder = common.createDataBuilder("artifact" ,await common.readJson(jsonPath));
            await this.artifactDataPageParser($$, dataBuilder);

            await common.toTextFile(jsonPath, dataBuilder.toJsonString());
            artifacts.push(artifactName + ".json");
        }

        await common.toTextFile(docsDir+"/artifact/artifacts.json", JSON.stringify(artifacts, null, "\t"));
        /* end artifact data */

        /* start materials data */
        const materialPages = await this.materialListPageParser(common.dom(await common.requestWithCache(this.materialListUrl)));
        const materials = [];
        for(let i =0; i<materialPages.length; i++) {
            const page = materialPages[i];
            const materialName = page.name;

            const jsonPath = docsDir+"/material/"+materialName + ".json";

            const r = await common.requestWithCache(page.url);

            const $$ = common.dom(r);
            const dataBuilder = common.createDataBuilder("material" ,await common.readJson(jsonPath));
            await this.materialDataPageParser($$, dataBuilder);

            await common.toTextFile(jsonPath, dataBuilder.toJsonString());
            materials.push(materialName + ".json");
        }

        await common.toTextFile(docsDir+"/material/materials.json", JSON.stringify(materials, null, "\t"));
        /* end materials data */
    };

};

module.exports.Generator = Generator;