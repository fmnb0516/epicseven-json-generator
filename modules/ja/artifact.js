const getArtifactLevel = (text) => {
    const entry = text.split("(");

    const slevel = parseInt(entry[0].trim());
    const alevel = parseInt(entry[1].trim().replace("+", "").replace("初期", "0").replace("最大", 30));

    return {
        slevel: slevel,
        alevel: alevel
    };
};

module.exports = (context) => {

    const listPage = ($) => {
        const result = [];

        const entries = $("table.a-table.a-table.a-table.tablesorter tbody tr");

        entries.each((i, elem) => {
            const td = $(elem).find("td").get(0);
            const url = $(td).find("a.a-link").attr("href");
            const name = $(td).text().trim();

            result.push({
                name: name,
                url: url
            });
        });
        return result;
    };

    const dataPage = async ($, builder) => {

        builder.clearEffect();

        const name = $("#hl_1").text().substring(0, $("#hl_1").text().indexOf("の評価・基本情報"));
        const base = context.helper.findHeaderElement($, "h2", "の評価・基本情報").next();

        await builder.thumbnail(async () => {
            const image = base.find("img.a-img").attr("src");
            const thumbnail = await context.common.imageToBase64(image);
            return thumbnail;
        });

        const rare = parseInt($(base.find("tr").get(0)).find("td").text().trim().substring(1));
        const target = $(base.find("tr").get(1)).find("td").text().trim();
        builder.baseData(name, rare, target);

        const initialStatus = $(base.find("tr").get(3)).find("td").text().trim().match(/攻撃力:(\d*)生命力:(\d*)/);
        const init_attack = parseInt(initialStatus[1]);
        const init_health = parseInt(initialStatus[2]);
        builder.initStatus(init_attack, init_health);

        const maxStatus = $(base.find("tr").get(4)).find("td").text().trim().match(/攻撃力:(\d*)生命力:(\d*)/);
        const max_attack = parseInt(maxStatus[1]);
        const max_health = parseInt(maxStatus[2]);
        builder.maxStatus(max_attack, max_health);

        const skills = context.helper.findHeaderElement($, "h2", "の古代遺物スキル情報").next().find("tr");

        for (let i = 1; i < skills.length; i++) {
            const skill = $(skills.get(i));

            const level_text = $(skill.find("th").get(0)).text().trim();
            const level = getArtifactLevel(level_text);
            const desc = $(skill.find("td").get(0)).text().trim();

            builder.effect(level.slevel, level.alevel, desc);
        }

    };

    return {
        listPage: listPage,
        dataPage: dataPage,
        url: "https://game8.jp/epic-seven/301576"
    };
};
