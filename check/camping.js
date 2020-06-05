const fs = require('fs').promises;

const readFileNoErr = async (path, enc) => {
    try {
        return await fs.readFile(path, enc);
    } catch(e) {
        return null;
    }
};

const readJson = async(path, def) => {
    const def2 = def === undefined ? null : def;
    const json = await readFileNoErr(path, "utf8");
    return json !== null ? JSON.parse(json) : def2;
};

fs.readdir("docs/ja/hero").then(entries => {

    entries.filter(e => e !== "heros.json").forEach(e => {
        readJson("docs/ja/hero/" + e).then(json => {

            if(json.extention.camping === undefined) {
                console.log(e);
            }
        });
    })
});