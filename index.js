
const request = require('request-promise');
const cheerio = require('cheerio');
const crypto = require('crypto');
const fs = require('fs').promises;
const util = require('util');

const optional = (data, def) => {
    return data !== undefined && data !== null ? data : def;
};

const lang = optional(process.argv[2], "ja");

const loadHeroData = async (path) => {
    try {
        return JSON.parse(await fs.readFile(path, "utf8"));
    } catch(e) {
        return {
            status : {},
            stamp : {
                expansion : [],
                collect : []
            },
            skill : []
        };
    }
};

const loadArtifactData = async (path) => {
    try {
        return JSON.parse(await fs.readFile(path, "utf8"));
    } catch(e) {
        return {
            effect : [],
            status : {}
        }
    }
};

const requestWithCache = (() => {
    const cache = (url) => {
        const md5 = crypto.createHash('md5')
        const hash = md5.update(url, 'binary').digest('hex');
        return "./" + lang + "/cache/" + hash + ".html";
    };
    
    const readFileNoErr = async (path, enc) => {
        try {
            return await fs.readFile(path, enc);
        } catch(e) {
            return null;
        }
    };

    return async (url) => {
        console.l
        const cachePath = cache(url);
        
        const html = await readFileNoErr(cachePath, "utf8");
        if(html !== null) {
            return html;
        }
    
        const response = await request({
            url : url,
            method: "GET",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.3'
            }
        });
       await fs.writeFile(cachePath, response, "utf8");
       return response;
    };

})();

const generator = (() => {
    const modules = {
        request : request,
        cheerio : cheerio,
        fs : fs,
        crypto: crypto,
        util : util,
        requestWithCache : requestWithCache
    };

    const context = {};

    class ModuleBuilder {

        constructor(context) {
            this.context = context;
        };

        registerArtifactListUrl(url) {
            this.context["artifactListUrl"] = url;
            return this;
        };

        registerCharacterListUrl(url) {
            this.context["characterListUrl"] = url;
            return this;
        };


        registerCaharacterListPageParser(parser) {
            this.context["caharacterListPageParser"] = parser;
            return this;
        };

        registeArtifactListPageParser(parser) {
            this.context["artifactListPageParser"] = parser;
            return this;
        };

        registerCaharacterDataPageParser(parser) {
            this.context["caharacterDataPageParser"] = parser;
            return this;
        };

        registerArtifactDataPageParser(parser) {
            this.context["artifactDataPageParser"] = parser;
            return this;
        };
    };

    
    require("./" + lang + "/core.js")(new ModuleBuilder(context), modules);

    return context;
})();

const runner = (() => {
    class ArtifactDataBuilder {
        constructor(data) {
            this.json = data
        };

    };

    class HeroDataBuilder {
        constructor(data) {
            this.json = data
        };

        clearEffect() {
            this.json.effect = [];
            return this;
        };

        toJsonString() {
            return JSON.stringify(this.json, null, "\t");
        };

        baseData(name, rare, type, clazz) {
            this.json["name"] = name;
            this.json["rare"] = rare;
            this.json["type"] = type;
            this.json["clazz"] = clazz;
            return this;
        };

        maxStatus(attack, health, speed, defense, critical_hit, critical_damage, unity_chance, debuff_hit, debuff_resist) {
            this.json.status["max"] = {
                attack : attack,
                health : health,
                speed : speed,
                defense : defense,
                critical_hit : critical_hit,
                critical_damage : critical_damage,
                unity_chance : unity_chance,
                debuff_hit : debuff_hit,
                debuff_resist : debuff_resist
            };

            return this;

        };

        async thumbnail(callback) {
            if(this.json.thumbnail === undefined || this.json.thumbnail === null || this.json.thumbnail === "") {
                this.json.thumbnail = await callback();
            }
            return this;
        };

        initStatus(attack, health, speed, defense, critical_hit, critical_damage, unity_chance, debuff_hit, debuff_resist) {

            this.json.status["init"] = {
                attack : attack,
                health : health,
                speed : speed,
                defense : defense,
                critical_hit : critical_hit,
                critical_damage : critical_damage,
                unity_chance : unity_chance,
                debuff_hit : debuff_hit,
                debuff_resist : debuff_resist
            };

            return this;
        };

        stampExpansion(label, value, type) {
            this.json.stamp.expansion.push({
                label : label,
                value : value,
                type : type
            });
            return this;
        };

        stampCollect(label, value, type) {
            this.json.stamp.collect.push({
                label : label,
                value : value,
                type : type
            });
            return this;
        };

        skill(name, skilltern, desc, soul, level) {

            this.json.skill.push({
                name : name,
                tern : skilltern,
                desc : desc,
                soul : soul,
                level : level
            });
            return this;
        };

        clearStampCollect() {
            this.json.stamp.collect = [];
            return this;
        };

        clearStampExpansion() {
            this.json.stamp.expansion = [];
            return this;
        };

        clearSkill() {
            this.json.skill = [];
            return this;
        };

        toJsonString() {
            return JSON.stringify(this.json, null, "\t");
        };
    };

    return async () => {

        /* start hero data */
        const heroPages = await generator["caharacterListPageParser"](cheerio.load(await requestWithCache(generator["characterListUrl"])));
        const heros = [];

        for(let i =0; i<heroPages.length; i++) {
            const page = heroPages[i];
            const heroName = page.name;

            const jsonPath = "./docs/"+lang+"/hero/"+heroName + ".json";

            const r = await requestWithCache(page.url);

            const $$ = cheerio.load(r);
            const dataBuilder = new HeroDataBuilder(await loadHeroData(jsonPath));
            await generator["caharacterDataPageParser"]($$, dataBuilder);

            await fs.writeFile(jsonPath, dataBuilder.toJsonString(), "utf8");
            heros.push(heroName + ".json");
        }

        await fs.writeFile("./docs/"+lang+"/hero/heros.json", JSON.stringify(heros, null, "\t"), "utf8");
        /* end hero data */

        /* start artifact data */
        const artifactPages = await generator["artifactListPageParser"](cheerio.load(await requestWithCache(generator["artifactListUrl"])));
        const artifacts = [];

        for(let i =0; i<artifactPages.length; i++) {
            const page = artifactPages[i];
            const artifactName = page.name;

            const jsonPath = "./docs/"+lang+"/artifact/"+artifactName + ".json";

            const r = await requestWithCache(page.url);

            const $$ = cheerio.load(r);
            const dataBuilder = new ArtifactDataBuilder(await loadArtifactData(jsonPath));
            await generator["artifactDataPageParser"]($$, dataBuilder);

            await fs.writeFile(jsonPath, dataBuilder.toJsonString(), "utf8");
            artifacts.push(artifactName + ".json");
        }

        await fs.writeFile("./docs/"+lang+"/artifact/artifacts.json", JSON.stringify(artifacts, null, "\t"), "utf8");
        /* end artifact data */
    };
})();

runner();