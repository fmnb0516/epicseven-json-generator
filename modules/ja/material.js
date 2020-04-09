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

        const entries = $($("table.a-table").get(0)).find("tbody tr");

        entries.each((i, elem) => {
            const td = $(elem).find("td").get(0);
            const url = $(td).find("a.a-link").attr("href");
            const name = $(td).text().trim();

            if (name !== "") {
                result.push({
                    name: name,
                    url: url
                });
            }
        });
        return result;
    };

    const dataPage = async ($, builder) => {
        builder.clearDrop();

        const base = context.helper.findHeaderElement($, "h2", "の基本情報").next();

        await builder.thumbnail(async () => {
            const image = $(base.find("tr").get(0)).find("td img").attr("src");
            const thumbnail = await getImageSrc(image);
            return thumbnail;
        });

        const name = $(base.find("tr").get(1)).find("td").text().trim();
        const type = $(base.find("tr").get(2)).find("td").text().trim();

        const normal_shop = type === "エピック特殊素材" ? [] : context.helper.getTextContents($(base.find("tr").get(3)).find("td"));
        const hard_shop = type === "エピック特殊素材" ? context.helper.getTextContents($(base.find("tr").get(3)).find("td"))
            : context.helper.getTextContents($(base.find("tr").get(4)).find("td"));

        builder.baseData(name, type, normal_shop.map(e => e.split(".")), hard_shop.map(e => e.split(".")), type === "エピック特殊素材");

        const hard_drop = context.helper.findHeaderElement($, "h3", "ハード", true).next();

        hard_drop.find("tr").each((i, elm) => {
            const area = $(elm).find("th").text().trim().split(".");

            const stage = context.helper.getTextContents($(elm).find("td"));

            stage.map(s => s.split(".")).forEach(s => {
                builder.hardDrop(area[0], area[1], s[0], s[1]);
            });
        });

        if (type === "レア特殊素材") {
            const normal_drop = findHeaderElement($, "h3", "ノーマル", true).next();
            normal_drop.find("tr").each((i, elm) => {
                const area = $(elm).find("th").text().trim().split(".");

                const stage = context.helper.getTextContents($(elm).find("td"));
                stage.map(s => s.split(".")).forEach(s => {
                    builder.normalDrop(area[0], area[1], s[0], s[1]);
                });
            });
        }

    };

    return {
        listPage: listPage,
        dataPage: dataPage,
        url: "https://game8.jp/epic-seven/308171"
    };
};
