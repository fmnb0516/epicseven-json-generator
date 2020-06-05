module.exports = (context) => {

    const initalized = async() => {

        const res1 = await context.common.requestWithCache("https://gamepress.gg/epicseven/camping-simulator");
        const camp_data = eval("(() => { return " + res1.substring(res1.indexOf("var camp_data = ") + "var camp_data = ".length, res1.indexOf("var topic_data = ")) + "})();");
        const topic_data = eval("(() => { return " + res1.substring(res1.indexOf("var topic_data = ") + "var topic_data = ".length, res1.indexOf("</script>", res1.indexOf("var topic_data = "))) + ";})();");
        
        const res2 = await context.common.requestWithCache("https://gamepress.gg/sites/default/files/aggregatedjson/E7CampsiteSimulator.json", true);
        const hero_data = JSON.parse(res2);

        const mapping = await context.common.readJson("./modules/ja/cache/hero_name_mapping.json", {});

        hero_data.map(e => e.title).filter(e => mapping[e] === undefined).forEach(e => {
            mapping[e] = "";
        });
        await context.common.toTextFile("./modules/ja/cache/hero_name_mapping.json", JSON.stringify(mapping, null, "\t"));

        const data = {};

        hero_data.forEach(e => {
            const name = mapping[e.title] === "" ? e.title : mapping[e.title];

            const topic_names = e.topic_names.split("##");
            const topic_ids = e.topics.split("##");

            data[name] = {
                topic : [
                    {id : topic_ids[0], name : topic_names[0]},
                    {id : topic_ids[1], name : topic_names[1]},
                ],
                camping : camp_data[e.nid]
            };
        });

        return data;
    };


    return {
        initalized : initalized
    };
};