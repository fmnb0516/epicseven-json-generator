const lang =  "ja";

const program = require("commander");
const modules = (() => {
    return {
        request : require('request-promise'),
        cheerio : require('cheerio'),
        crypto : require('crypto'),
        fs : require('fs').promises,
        util : require('util'),
        express : require('express')
    };
})();

const common = (() => {

    const nullToBlank = (str) => {
        return str === undefined || str === null ? "" : str;
    }

    const generateCachePath = (url) => {
        const md5 = modules.crypto.createHash('md5')
        const hash = md5.update(url, 'binary').digest('hex');
        return "./modules/" + lang + "/cache/" + hash + ".html";
    };

    
    const requestWithCache = async (url, force) => {
        const cachePath = generateCachePath(url);
        const html = await readFileNoErr(cachePath, "utf8");
        
        if(html !== null && force !== true) {
            return html;
        }

        const response = await modules.request({
            url : url,
            method: "GET",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.3'
            }
        });
       await modules.fs.writeFile(cachePath, response, "utf8");
       return response;
    };

    const imageToBase64 = async (imageUrl) => {
        const { statusCode, headers, error, body } =
            await modules.util.promisify(modules.request.defaults({ encoding: null }))(imageUrl);

        if (error || statusCode !== 200) {
            return null;
        }

        const contentType = headers['content-type'];
        const base64Str = new Buffer.from(body).toString('base64');

        return `data:${contentType};base64,${base64Str}`;
    };


    const dom = (html) => {
        return modules.cheerio.load(html);
    };

    const toTextFile = async (path, text) => {
        await modules.fs.writeFile(path, text, "utf8");
    };

    const convertIntNum = (num, def) => {
        const n = parseInt(num);
        return Number.isNaN(n) || n <= 0 ? def : n;
    };

    const readFileNoErr = async (path, enc) => {
        try {
            return await modules.fs.readFile(path, enc);
        } catch(e) {
            return null;
        }
    };

    const readJson = async(path, def) => {
        const def2 = def === undefined ? null : def;
        const json = await readFileNoErr(path, "utf8");
        return json !== null ? JSON.parse(json) : def2;
    };

    const trraversalJsonFiles = async (path, excluede, handler) => {

        const files = await modules.fs.readdir(path);

        for (let i = 0; i < files.length; i++) {
            const fname = files[i];
            if(excluede.indexOf(fname) !== -1) {
                continue;
            }

            const json = await readJson(path + fname);
            await handler(fname, json);   
        }
    };

    return {
        convertIntNum : convertIntNum,
        readJson : readJson,
        readFileNoErr : readFileNoErr,
        trraversalJsonFiles : trraversalJsonFiles,
        requestWithCache : requestWithCache,
        imageToBase64 : imageToBase64,
        dom : dom,
        toTextFile : toTextFile,
        nullToBlank : nullToBlank,
        _ : modules
    };

})();



program.version('0.0.1', '-v, --version');

program.command('mock [port]')
    .description('start mock web server, deafult port is [3000]')
    .action((port) => {
        const portNum = common.convertIntNum(port, 3000);
        modules.express()
            .use(modules.express.static('./docs'))
            .listen(process.env.PORT || 3000);
        console.log("listen: " + portNum);
        console.log("access to http://localhost:" + portNum);
    });

program.command('checkcamping')
    .description('list up hero name of no camping data.')
    .action(() => {

        common.trraversalJsonFiles("docs/ja/hero/", ["heros.json"], (file, json) => {
            if(json.extention === undefined || json.extention.camping === undefined) {
                console.log(file);
            }
        });
    });

program.command('cachename <url>')
    .description('generate url => cachename')
    .action((url) => {
        const md5 = modules.crypto.createHash('md5')
        const hash = md5.update(url, 'binary').digest('hex');
        console.log(url + " => " + hash);
    });

program.command('cacheupdate')
    .description('update cache, target is [list page, campdata page]')
    .action(async () => {

        const text = await common.readFileNoErr("./modules/" + lang + "/cachelist.txt", "utf8");
        const entries = text.split("\r\n");

        for (let i = 0; i < entries.length; i++) {
            const url = entries[i];
            console.log("update cache : " + url);
            await common.requestWithCache(url, true);
        }
    });

program.command('generate <target> [url]')
    .description('generate json file, support target is [all, hero, artifact, material].')
    .action(async (targetMode, targetUrl) => {

        const builderFactory = (type , json) => {
            if(type === "hero") {
                return new DataBuilder.HeroDataBuilder(json);
            }
            if(type === "artifact") {
                return new DataBuilder.ArtifactDataBuilder(json);
            }
            if(type === "material") {
                return new DataBuilder.MaterialDataBuilder(json);
            }
            return null;
        };

        const support = {
            "all" : ["hero", "artifact", "material"],
            "hero" : ["hero"],
            "artifact" : ["artifact"],
            "material" : ["material"]
        };

        const url = targetMode === "all" ? "" : common.nullToBlank(targetUrl);

        const DataBuilder = require("./modules/data-builder.js");
        const DataGenerator = require("./modules/data-generator.js");

        const gen = new DataGenerator.Generator();
        await require("./modules/" + lang + "/index.js")(gen.toBuilder(), "./docs/"+lang, common);
        await gen.generate("./docs/"+lang, support[targetMode], url, builderFactory, common);

    });

program.parse(process.argv);