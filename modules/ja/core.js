



const getArtifactLevel = (text) => {
    const entry = text.split("(");

    const slevel = parseInt(entry[0].trim());
    const alevel = parseInt(entry[1].trim().replace("+", "").replace("初期", "0").replace("最大", 30));

    return {
        slevel: slevel,
        alevel: alevel
    };
};

module.exports = (builder, plugin) => {
    const getImageSrc = async (imageUrl) => {
        const { statusCode, headers, error, body } =
            await plugin.util.promisify(plugin.request.defaults({ encoding: null }))(imageUrl);

        if (error || statusCode !== 200) {
            return null;
        }

        const contentType = headers['content-type'];
        const base64Str = new Buffer.from(body).toString('base64');

        return `data:${contentType};base64,${base64Str}`;
    };

    builder.registerCharacterListUrl("https://game8.jp/epic-seven/301575")
        .registerCaharacterListPageParser(($) => {
            
        }).registerCaharacterDataPageParser(async ($, builder) => {
           
        }).registerArtifactListUrl("https://game8.jp/epic-seven/301576")
        .registeArtifactListPageParser($ => {
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
        }).registerArtifactDataPageParser(async ($, builder) => {
            builder.clearEffect();

            const name = $("#hl_1").text().substring(0, $("#hl_1").text().indexOf("の評価・基本情報"));
            const base = findHeaderElement($, "h2", "の評価・基本情報").next();

            await builder.thumbnail(async () => {
                const image = base.find("img.a-img").attr("src");
                const thumbnail = await getImageSrc(image);
                return thumbnail;
            });

            const rare = parseInt($(base.find("tr").get(0)).find("td").text().trim().substring(1));
            const target = $(base.find("tr").get(1)).find("td").text().trim();
            builder.baseData(name, rare, target);

            const initialStatus = $(base.find("tr").get(3)).find("td").text().trim().match(/攻撃力:(\d*)生命力:(\d*)/);
            const init_attack = parseInt(initialStatus[2]);
            const init_health = parseInt(initialStatus[1]);
            builder.initStatus(init_attack, init_health);

            const maxStatus = $(base.find("tr").get(4)).find("td").text().trim().match(/攻撃力:(\d*)生命力:(\d*)/);
            const max_attack = parseInt(maxStatus[2]);
            const max_health = parseInt(maxStatus[1]);
            builder.maxStatus(max_attack, max_health);

            const skills = findHeaderElement($, "h2", "の古代遺物スキル情報").next().find("tr");

            for (let i = 1; i < skills.length; i++) {
                const skill = $(skills.get(i));

                const level_text = $(skill.find("th").get(0)).text().trim();
                const level = getArtifactLevel(level_text);
                const desc = $(skill.find("td").get(0)).text().trim();

                builder.effect(level.slevel, level.alevel, desc);
            }
        }).registerMaterialListUrl("https://game8.jp/epic-seven/308171")
        .registeMaterialListPageParser($ => {
            const result = [];

            const entries = $($("table.a-table").get(0)).find("tbody tr");

            entries.each((i, elem) => {
                const td = $(elem).find("td").get(0);
                const url = $(td).find("a.a-link").attr("href");
                const name = $(td).text().trim();

                if(name !== "") {
                    result.push({
                        name: name,
                        url: url
                    });
                }
            });
            return result;
        }).registerMaterialDataPageParser(async ($, builder) => {
            builder.clearDrop();

            const base = findHeaderElement($, "h2", "の基本情報").next();

            await builder.thumbnail(async () => {
                const image = $(base.find("tr").get(0)).find("td img").attr("src");
                const thumbnail = await getImageSrc(image);
                return thumbnail;
            });

            const name = $(base.find("tr").get(1)).find("td").text().trim();
            const type = $(base.find("tr").get(2)).find("td").text().trim();

            const normal_shop = type === "エピック特殊素材" ? [] : getTextContents($(base.find("tr").get(3)).find("td"));
            const hard_shop = type === "エピック特殊素材" ? getTextContents($(base.find("tr").get(3)).find("td")) : getTextContents($(base.find("tr").get(4)).find("td"));
            
            builder.baseData(name, type, normal_shop.map(e => e.split(".")), hard_shop.map(e => e.split(".")), type === "エピック特殊素材");

            const hard_drop = findHeaderElement($, "h3", "ハード", true).next();

            hard_drop.find("tr").each((i, elm) => {
                const area = $(elm).find("th").text().trim().split(".");

                const stage = getTextContents($(elm).find("td"));

                stage.map(s => s.split(".")).forEach(s => {
                    builder.hardDrop(area[0], area[1], s[0], s[1]);
                });
            });

            if(type === "レア特殊素材") {
                const normal_drop = findHeaderElement($, "h3", "ノーマル", true).next();
                normal_drop.find("tr").each((i, elm) => {
                    const area = $(elm).find("th").text().trim().split(".");
    
                    const stage = getTextContents($(elm).find("td"));
                    stage.map(s => s.split(".")).forEach(s => {
                        builder.normalDrop(area[0], area[1], s[0], s[1]);
                    });
                });
            }

        });

};