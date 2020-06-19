module.exports = (context) => {

    const generateCampingData = async() => {
        const res1 = await context.common.requestWithCache("https://gamepress.gg/epicseven/camping-simulator");
        const camp_data = eval("(() => { return " + res1.substring(res1.indexOf("var camp_data = ") + "var camp_data = ".length, res1.indexOf("var topic_data = ")) + "})();");
        const topic_data = eval("(() => { return " + res1.substring(res1.indexOf("var topic_data = ") + "var topic_data = ".length, res1.indexOf("</script>", res1.indexOf("var topic_data = "))) + ";})();");
        
        const res2 = await context.common.requestWithCache("https://gamepress.gg/sites/default/files/aggregatedjson/E7CampsiteSimulator.json");
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

    const generateSkillMultipliers = async() => {
        const res1 = await context.common.requestWithCache("https://epic7x.com/skill-multipliers/");

        const script = res1.substring(res1.indexOf("var CHARACTERS = ") + "var CHARACTERS = ".length, res1.indexOf("jQuery("));
        const skill = eval("(() => { return " + script + "})();");

        const data = {};

        const mapping = await context.common.readJson("./modules/ja/cache/hero_name_mapping.json", {});
        skill.map(e => e.name).filter(e => mapping[e] === undefined).forEach(e => {
            mapping[e] = "";
        });
        await context.common.toTextFile("./modules/ja/cache/hero_name_mapping.json", JSON.stringify(mapping, null, "\t"));

        skill.forEach(e => {
            const name = mapping[e.name] === "" ? e.name : mapping[e.name];
            data[name] = e.skills;
        });

        return data;
    };

    const initalized = async() => {

        const campingData = await generateCampingData();
        const skillData = await generateSkillMultipliers();

        return {
            campingData : campingData,
            skillData : skillData
        }
    };


    return {
        initalized : initalized
    };
};