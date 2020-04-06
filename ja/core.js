

const findHeaderElement = ($, tag, text, mode) => {

    const check = mode === true
        ? (t1, t2) => t1 === t2
        : (t1, t2) => t1.indexOf(t2) !== -1;

    const entries = $(".archive-style-wrapper " + tag);

    for (let i = 0; i < entries.length; i++) {
        const h3 = $(entries.get(i));
        if (check(h3.text(), text)) {
            return h3;
        }
    }

    return null;
};

const getTextContents = (node) => {
    const contents = node.contents();

    const texts = [];

    for(let i=0; i<contents.length; i++) {
        const tag = contents[i];
        if(tag.type === "text" && tag.data.trim() !== "") {
            texts.push(tag.data.trim());
        }
    }

    return texts;
};

const getArtifactLevel = (text) => {
    const entry = text.split("(");

    const slevel = parseInt(entry[0].trim());
    const alevel = parseInt(entry[1].trim().replace("+", "").replace("初期", "0").replace("最大", 30));

    return {
        slevel: slevel,
        alevel: alevel
    };
};

const getSoulBern = (text) => {
    const match = text.match(/魂力(\d*)獲得/)
    return match === null ? 0 : parseInt(match[1]);
}

const useSoulBern = (text) => {
    const match = text.match(/魂力(\d*)消費/)
    return match === null ? 0 : parseInt(match[1]);
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
        }).registerCaharacterDataPageParser(async ($, builder) => {
            builder.clearSkill().clearStampCollect().clearStampExpansion();

            await builder.thumbnail(async () => {
                const image = $(".archive-style-wrapper .a-paragraph .a-img").attr("src");
                const thumbnail = await getImageSrc(image);
                return thumbnail;
            });

            const name = $("#hm_1").text().substring(0, $("#hm_1").text().indexOf("の基本情報"));
            const base = findHeaderElement($, "h3", "の基本情報").next();
            const rare = parseInt($(base.find("tr").get(3)).find("td").text().trim().substring(1));
            const type = $(base.find("tr").get(4)).find("td").text().trim();
            const clazz = $(base.find("tr").get(5)).find("td").text().trim();
            builder.baseData(name, rare, type, clazz);

            const status = findHeaderElement($, "h3", "最大ステータス【入手時 / 覚醒後】").next();

            const max_attack = parseInt($($(status.find("tr").get(1)).find("td").get(1)).text().trim());
            const max_health = parseInt($($(status.find("tr").get(2)).find("td").get(1)).text().trim());
            const max_speed = parseInt($($(status.find("tr").get(3)).find("td").get(1)).text().trim());
            const max_defense = parseInt($($(status.find("tr").get(4)).find("td").get(1)).text().trim());
            const max_critical_hit = parseFloat($($(status.find("tr").get(5)).find("td").get(1)).text().trim().substring(-1));
            const max_critical_damage = parseFloat($($(status.find("tr").get(6)).find("td").get(1)).text().trim().substring(-1));
            const max_unity_chance = parseFloat($($(status.find("tr").get(7)).find("td").get(1)).text().trim().substring(-1));
            const max_debuff_hit = parseFloat($($(status.find("tr").get(8)).find("td").get(1)).text().trim().substring(-1));
            const max_debuff_resist = parseFloat($($(status.find("tr").get(9)).find("td").get(1)).text().trim().substring(-1));

            builder.maxStatus(max_attack, max_health, max_speed, max_defense, max_critical_hit, max_critical_damage, max_unity_chance, max_debuff_hit, max_debuff_resist);

            const init_attack = parseInt($($(status.find("tr").get(1)).find("td").get(0)).text().trim());
            const init_health = parseInt($($(status.find("tr").get(2)).find("td").get(0)).text().trim());
            const init_speed = parseInt($($(status.find("tr").get(3)).find("td").get(0)).text().trim());
            const init_defense = parseInt($($(status.find("tr").get(4)).find("td").get(0)).text().trim());
            const init_critical_hit = parseFloat($($(status.find("tr").get(5)).find("td").get(0)).text().trim().substring(-1));
            const init_critical_damage = parseFloat($($(status.find("tr").get(6)).find("td").get(0)).text().trim().substring(-1));
            const init_unity_chance = parseFloat($($(status.find("tr").get(7)).find("td").get(0)).text().trim().substring(-1));
            const init_debuff_hit = parseFloat($($(status.find("tr").get(8)).find("td").get(0)).text().trim().substring(-1));
            const init_debuff_resist = parseFloat($($(status.find("tr").get(9)).find("td").get(0)).text().trim().substring(-1));

            builder.initStatus(init_attack, init_health, init_speed, init_defense, init_critical_hit, init_critical_damage, init_unity_chance, init_debuff_hit, init_debuff_resist);

            const jinkei = findHeaderElement($, "h3", "陣形効果").next();

            jinkei.find("tr").each((i, elm) => {
                const text = $($(elm).find("td").get(0)).text().trim();
                if (text === "") {
                    return;
                }

                const entry = text.split("+");
                const t = entry[1].trim().indexOf("%") !== -1 ? "percent" : "fix";
                builder.stampExpansion(entry[0].trim(), parseFloat(t === "percent" ? entry[1].trim().substring(-1) : entry[1].trim()), t);
            });

            jinkei.find("tr").each((i, elm) => {
                const text = $($(elm).find("td").get(1)).text().trim();
                if (text === "") {
                    return;
                }

                const entry = text.split("+");
                const t = entry[1].trim().indexOf("%") !== -1 ? "percent" : "fix";
                builder.stampCollect(entry[0].trim(), parseFloat(t === "percent" ? entry[1].trim().substring(-1) : entry[1].trim()), t);
            });

            const skillHeader = findHeaderElement($, "h3", "スキル", true);
            const skills = [skillHeader.next(), skillHeader.next().next(), skillHeader.next().next().next()];

            for (let i = 0; i < skills.length; i++) {
                const skill = skills[i];
                const snames = $(skill.find("th").get(0)).text().trim().split("\n");

                const sname = snames[0];
                const skilltern = parseInt(snames.length > 1 ? snames[1].substring(8, snames[1].length - 1) : 0);

                const desc = $(skill.find("td").get(0)).text().replace("【スキル効果】", "").trim();
                const soul = getSoulBern(desc);

                const soulbern = $(skill.find("td").get(2)).text().replace("【魂力解放効果】", "")
                const usesoul = useSoulBern(soulbern);

                const levelupText = $(skill.find("td").get(1)).text().replace("【スキル強化】", "").trim()
                    .split("\n").filter(t => t !== "");


                const level = [];
                levelupText.forEach(t => {
                    const entry = t.split("：")[1];
                    const match = entry.match(/([^0-9]*)([\d]*)([^0-9]*)/);

                    level.push({

                        label: match[1],
                        value: parseInt(match[2]),
                        type: match[3].replace("％", "").replace("%", ""),
                        num: match[3].indexOf("％") !== -1 || match[3].indexOf("%") !== -1 ? "percent" : "fix"
                    });
                });

                builder.skill(sname, skilltern, desc.split("\n").join(""), {
                    soul: soul,
                    soulbern: soulbern !== "",
                    bern_desc: soulbern.split("\n").join(""),
                    usesoul: usesoul
                }, level);
            }
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