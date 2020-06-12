
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

    initialize(func) {
        this.gen.setInitializer(func);
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
        this.initializer = null;
    };

    setInitializer(func) {
        this.initializer = func;
        return this;
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

    data(name) {
        if(name === "hero") {
            return {
                "listPageParser" : this.caharacterListPageParser,
                "dataPageParser" : this.caharacterDataPageParser,
                "listUrl" : this.characterListUrl
            };

        } else if(name === "artifact") {
            return {
                "listPageParser" : this.artifactListPageParser,
                "dataPageParser" : this.artifactDataPageParser,
                "listUrl" : this.artifactListUrl
            };
        } else if(name === "material") {
            return {
                "listPageParser" : this.materialListPageParser,
                "dataPageParser" : this.materialDataPageParser,
                "listUrl" : this.materialListUrl
            };
        }
    };

    async generate(docsDir, targetMode, targetUrl, factory, common) {
        console.log("*** generate start, " + targetMode + "," + targetUrl);

        const context = await this.initializer();

        for (let i = 0; i < targetMode.length; i++) {
            const mode = targetMode[i];
            console.log("  generate " + targetMode);

            const pageData = this.data(mode);

            const pages = await pageData.listPageParser(common.dom(await common.requestWithCache(pageData.listUrl)), context);
            const generates = [];
            
            for(let i =0; i<pages.length; i++) {
                const page = pages[i];

                if(targetUrl === "" || page.url === targetUrl) {
                    console.log("    - page : " + page.name + ", " + page.url);      
                    const dName = page.name;
                    const jsonPath = docsDir + "/"+mode+"/"+dName + ".json";
                    
                    const r = await common.requestWithCache(page.url/*, targetUrl !== ""*/);
                    const $$ = common.dom(r);
                    const dataBuilder = factory(mode, await common.readJson(jsonPath));
                    
                    await pageData.dataPageParser($$, dataBuilder, context);
                    await common.toTextFile(jsonPath, dataBuilder.toJsonString());
                    console.log("      write complete : " + jsonPath);
                }

                generates.push(page.name + ".json");
            }
            const listFilePath = docsDir + "/"+mode+"/" + mode+ "s.json";
            await common.toTextFile(listFilePath, JSON.stringify(generates, null, "\t"));
            console.log("    - list file write complete : " + mode + ", " + listFilePath);
        }

        console.log("*** generate end");
    };
    
};

module.exports.Generator = Generator;