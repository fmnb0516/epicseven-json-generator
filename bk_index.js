
const runner = (() => {
    return async () => {

        /* start materials data */
        const materialPages = await generator["materialListPageParser"](cheerio.load(await requestWithCache(generator["materialListUrl"])));
        const materials = [];
        for(let i =0; i<materialPages.length; i++) {
            const page = materialPages[i];
            const materialName = page.name;

            const jsonPath = "./docs/"+lang+"/material/"+materialName + ".json";

            const r = await requestWithCache(page.url);

            const $$ = cheerio.load(r);
            const dataBuilder = new MaterialDataBuilder(await loadMaterialData(jsonPath));
            await generator["materialDataPageParser"]($$, dataBuilder);

            await fs.writeFile(jsonPath, dataBuilder.toJsonString(), "utf8");
            materials.push(materialName + ".json");
        }

        await fs.writeFile("./docs/"+lang+"/material/materials.json", JSON.stringify(materials, null, "\t"), "utf8");
        /* end materials data */
    };
})();

runner();