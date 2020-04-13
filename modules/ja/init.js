module.exports = (context) => {

    const initalized = async() => {

        const res1 = await context.common.requestWithCache("https://gamepress.gg/epicseven/camping-simulator");
        const camp_data = eval("(() => { return " + res1.substring(res1.indexOf("var camp_data = ") + "var camp_data = ".length, res1.indexOf("var topic_data = ")) + "})();");
        const topic_data = eval("(() => { return " + res1.substring(res1.indexOf("var topic_data = ") + "var topic_data = ".length, res1.indexOf("</script>", res1.indexOf("var topic_data = "))) + ";})();");
        
        const res2 = await context.common.requestWithCache("https://gamepress.gg/sites/default/files/aggregatedjson/E7CampsiteSimulator.json");
        const hero_data = JSON.parse(res2);

        const mapping = await context.common.readJson("./modules/ja/cache/hero_name_mapping.json", {});
        await context.common.toTextFile("./modules/ja/cache/hero_name_mapping.json", JSON.stringify(mapping, null, "\t"));
    };


    return {
        initalized : initalized
    };
};