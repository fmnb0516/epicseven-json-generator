
class Builder {

    constructor(gen) {
        this.gen = gen;
    };

    hero(url, lparser, dparser, csvExclued, csvHeader, cparser) {
        this.gen.setCharacterListUrl(url)
            .setCharacterListPageParser(lparser)
            .setCharacterDataPageParser(dparser)
            .setCharacterCsvExclude(csvExclued)
            .setCharacterCsvHeader(csvHeader)
            .setCharacterCvEntryParser(cparser);
        return this;
    };

    artifact(url, lparser, dparser, csvExclued, csvHeader, cparser) {
        this.gen.setArtifactListUrl(url)
            .setArtifactListPageParser(lparser)
            .setArtifactDataPageParser(dparser)
            .setArtifactCsvExclude(csvExclued)
            .setArtifactCsvHeader(csvHeader)
            .setArtifactCvEntryParser(cparser);
        return this;
    };

    material(url, lparser, dparser, csvExclued, csvHeader, cparser) {
        this.gen.setMaterialListUrl(url)
            .setMaterialListPageParser(lparser)
            .setMaterialDataPageParser(dparser)
            .setMaterialCsvExclude(csvExclued)
            .setMaterialCsvHeader(csvHeader)
            .setMaterialCvEntryParser(cparser);
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
        this.characterListPageParser = null;
        this.materialListPageParser = null;

        this.characterDataPageParser = null; 
        this.artifactDataPageParser = null;
        this.materialDataPageParser = null;

        this.initializer = null;

        this.artifactCsvExclude = [];
        this.characterCsvExclude = [];
        this.materialCsvExclude = [];

        this.artifactCsvHeader = [];
        this.characterCsvHeader = [];
        this.materialCsvHeader = [];

        this.characterCvEntryParser = null;
        this.materialCvEntryParser = null;
        this.artifactCvEntryParser = null;
    };

    setInitializer(func) {
        this.initializer = func;
        return this;
    };

    setCharacterCvEntryParser(parser) {
        this.characterCvEntryParser = parser;
        return this;
    };
    setMaterialCvEntryParser(parser) {
        this.materialCvEntryParser = parser;
        return this;
    };
    setArtifactCvEntryParser(parser) {
        this.artifactCvEntryParser = parser;
        return this;
    };

    setArtifactCsvHeader(header) {
        this.artifactCsvHeader = header;
        return this;
    };
    setCharacterCsvHeader(header) {
        this.characterCsvHeader = header;
        return this;
    };
    setMaterialCsvHeader(header) {
        this.materialCsvHeader = header;
        return this;
    };

    setArtifactCsvExclude(exclueds) {
        this.artifactCsvExclude = exclueds;
        return this;
    };
    setCharacterCsvExclude(exclueds) {
        this.characterCsvExclude = exclueds;
        return this;
    };
    setMaterialCsvExclude(exclueds) {
        this.materialCsvExclude = exclueds;
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
    setCharacterListPageParser(parser) {
        this.characterListPageParser = parser;
        return this;
    };
    setMaterialListPageParser(parser) {
        this.materialListPageParser = parser;
        return this;
    };

    setCharacterDataPageParser(parser) {
        this.characterDataPageParser = parser;
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
                "listPageParser" : this.characterListPageParser,
                "dataPageParser" : this.characterDataPageParser,
                "listUrl" : this.characterListUrl,
                "csvExclueds" : this.characterCsvExclude,
                "csvHeader" : this.characterCsvHeader,
                "csvEntry" : this.characterCvEntryParser

            };

        } else if(name === "artifact") {
            return {
                "listPageParser" : this.artifactListPageParser,
                "dataPageParser" : this.artifactDataPageParser,
                "listUrl" : this.artifactListUrl,
                "csvExclueds" : this.artifactCsvExclude,
                "csvHeader" : this.artifactCsvHeader,
                "csvEntry" : this.artifactCvEntryParser
            };
        } else if(name === "material") {
            return {
                "listPageParser" : this.materialListPageParser,
                "dataPageParser" : this.materialDataPageParser,
                "listUrl" : this.materialListUrl,
                "csvExclueds" : this.materialCsvExclude,
                "csvHeader" : this.materialCsvHeader,
                "csvEntry" : this.materialCvEntryParser
            };
        }
    };

    async toCSV(docsDir, mode, factory, common) {

        const context = await this.initializer();
        const csvData = this.data(mode);

        const exclueds = csvData.csvExclueds;
        const files = (await common._.fs.readdir(docsDir + "/" + mode))
            .filter(s => s.endsWith(".json"))
            .filter(s => exclueds.indexOf(s) === -1);

        console.log(csvData.csvHeader.map(s => '"' + s + '"').join(","));

        for(let i=0; i<files.length; i++) {
            const json = await common.readJson(docsDir + "/" + mode + "/" + files[i]);

            const entries = csvData.csvHeader.map(h => csvData.csvEntry(h, json));
            console.log(entries.map(s => '"' + s + '"').join(","));
        }
    };

    async generate(docsDir, targetMode, targetName, factory, common) {
        console.log("*** generate start, " + targetMode + "," + targetName);

        const context = await this.initializer();

        for (let i = 0; i < targetMode.length; i++) {
            const mode = targetMode[i];
            console.log("  generate " + targetMode);

            const pageData = this.data(mode);
            const generates = [];
            const urls = Array.isArray(pageData.listUrl) ? pageData.listUrl : [pageData.listUrl];

            const pages = [];
            for(let i=0; i<urls.length; i++) {
                const entries = await pageData.listPageParser(common.dom(await common.requestWithCache(urls[i])), context)
                entries.forEach(e => pages.push(e));   
            }
            
            for(let i =0; i<pages.length; i++) {
                try {
                    const page = pages[i];
                    if(targetName === "" || page.name === targetName) {
                        console.log("    - page : " + page.name + ", " + page.url);      
                        const dName = page.name;
                        const jsonPath = docsDir + "/"+mode+"/"+dName + ".json";
                    
                        const r = await common.requestWithCache(page.url, targetName !== "");
                        const $$ = common.dom(r);
                        const dataBuilder = factory(mode, await common.readJson(jsonPath));
                    
                        await pageData.dataPageParser($$, dataBuilder, context);
                        await common.toTextFile(jsonPath, dataBuilder.toJsonString());
                        console.log("      write complete : " + jsonPath);
                    }
                    generates.push(page.name + ".json");
                } catch (e) {
                    console.log(e);
                }
            }
            const listFilePath = docsDir + "/"+mode+"/" + mode+ "s.json";
            await common.toTextFile(listFilePath, JSON.stringify(generates, null, "\t"));
            console.log("    - list file write complete : " + mode + ", " + listFilePath);
        }

        console.log("*** generate end");
    };
    
};

module.exports.Generator = Generator;