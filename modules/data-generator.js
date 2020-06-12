
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

    async generate(docsDir, targetMode, targetUrl, factory, common) {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaa");
    };

};

module.exports.Generator = Generator;