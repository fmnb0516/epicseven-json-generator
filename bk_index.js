
const runner = (() => {
    return async () => {

        

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