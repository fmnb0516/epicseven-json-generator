const future = (async (modules) => {
    const DataBuilder = require("./modules/data-builder.js");
    const DataGenerator = require("./modules/data-generator.js");

    const lang = process.argv[2] !== undefined && process.argv[2] !== null ? process.argv[2] : "ja";

    const generateCachePath = (url) => {
        const md5 = modules.crypto.createHash('md5')
        const hash = md5.update(url, 'binary').digest('hex');
        return "./modules/" + lang + "/cache/" + hash + ".html";
    };

    const readFileNoErr = async (path, enc) => {
        try {
            return await fs.readFile(path, enc);
        } catch(e) {
            return null;
        }
    };

    const readJson = async(path, enc) => {
        const json = await readFileNoErr(cachePath, "utf8");
        return json !== null ? JSON.parse(json) : null;
    };
    
    const requestWithCache = async (url) => {
        const cachePath = generateCachePath(url);
        
        const html = await readFileNoErr(cachePath, "utf8");
        if(html !== null) {
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

    const createDataBuilder = (type , json) => {
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
    const common = {
        requestWithCache : requestWithCache,
        readJson : readJson,
        dom : dom,
        toTextFile : toTextFile,
        createDataBuilder : createDataBuilder,
        imageToBase64 : imageToBase64,
        _ : modules
    };

    return {
        mockserver : () => {
            modules.express()
                .use(modules.express.static('./docs'))
                .listen(process.env.PORT || 3000);
        },

        generate : async () => {
            const gen = new DataGenerator.Generator();
            await require("./modules/" + lang + "/index.js")(gen.toBuilder(), "./docs/"+lang, common);
            await gen.generate("./docs/"+lang, common);
            return this;
        }
    };
})({
    request : require('request-promise'),
    cheerio : require('cheerio'),
    crypto : require('crypto'),
    fs : require('fs').promises,
    util : require('util'),
    express : require('express')
});

future.then(app => app.generate().then(() => app)).then(app => {
    app.mockserver();
    console.log("listen: 3000");
});