

const findHeaderElement = ($, text, mode) => {

    const check = mode === true
        ? (t1, t2) => t1 === t2 
        : (t1, t2) => t1.indexOf(t2) !== -1;

    const entries = $(".archive-style-wrapper h3");

    for(let i=0; i<entries.length; i++) {
        const h3 = $(entries.get(i));
        if(check(h3.text(), text)) {
            return h3;
        }
    }

    return null;
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
                    name : name,
                    url : url
                });
            });
            return result;
        }).registerCaharacterDataPageParser( async ($, builder) => {
            builder.clearSkill().clearStampCollect().clearStampExpansion();

            await builder.thumbnail(async() => {
                const image = $(".archive-style-wrapper .a-paragraph .a-img").attr("src");
                const thumbnail = await getImageSrc(image);
                return thumbnail;
            });

            const name = $("#hm_1").text().substring(0, $("#hm_1").text().indexOf("の基本情報"));
            const base = findHeaderElement($, "の基本情報").next();
            const rare = parseInt($(base.find("tr").get(3)).find("td").text().trim().substring(1));
            const type = $(base.find("tr").get(4)).find("td").text().trim();
            const clazz = $(base.find("tr").get(5)).find("td").text().trim();
            builder.baseData(name, rare, type, clazz);

            const status = findHeaderElement($, "最大ステータス【入手時 / 覚醒後】").next();

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
            
            const jinkei = findHeaderElement($, "陣形効果").next();

            jinkei.find("tr").each((i, elm) => {
                const text = $($(elm).find("td").get(0)).text().trim();
                if(text === "") {
                    return;
                }

                const entry = text.split("+");
                const t = entry[1].trim().indexOf("%") !== -1 ? "percent" : "fix";
                builder.stampExpansion(entry[0].trim(), parseFloat(t === "percent" ? entry[1].trim().substring(-1) : entry[1].trim()), t);
            });

            jinkei.find("tr").each((i, elm) => {
                const text = $($(elm).find("td").get(1)).text().trim();
                if(text === "") {
                    return;
                }

                const entry = text.split("+");
                const t = entry[1].trim().indexOf("%") !== -1 ? "percent" : "fix";
                builder.stampCollect(entry[0].trim(), parseFloat(t === "percent" ? entry[1].trim().substring(-1) : entry[1].trim()), t);
            });

            const skillHeader = findHeaderElement($, "スキル" ,true);
            const skills = [skillHeader.next(), skillHeader.next().next(), skillHeader.next().next().next()];

            for(let i=0; i<skills.length; i++) {
                const skill = skills[i];
                const snames = $(skill.find("th").get(0)).text().trim().split("\n");

                const sname = snames[0];
                const skilltern = parseInt(snames.length > 1 ? snames[1].substring(8, snames[1].length-1) : 0);

                const desc = $(skill.find("td").get(0)).text().replace("【スキル効果】", "").trim();
                const soul = getSoulBern(desc);

                const soulbern =$(skill.find("td").get(2)).text().replace("【魂力解放効果】", "")
                const usesoul = useSoulBern(soulbern);

                const levelupText = $(skill.find("td").get(1)).text().replace("【スキル強化】", "").trim()
                    .split("\n").filter(t => t !== "");

                
                const level = [];
                levelupText.forEach(t => {
                    const entry = t.split("：")[1];
                    const match = entry.match(/([^0-9]*)([\d]*)([^0-9]*)/);

                    level.push({

                        label : match[1],
                        value : parseInt(match[2]),
                        type : match[3].replace("％", "").replace("%", ""),
                        num  : match[3].indexOf("％") !== -1 || match[3].indexOf("%") !== -1 ? "percent" : "fix"
                    });
                });

                builder.skill(sname, skilltern, desc.split("\n").join(""), {
                    soul : soul,
                    soulbern : soulbern !== "",
                    bern_desc : soulbern.split("\n").join(""),
                    usesoul : usesoul
                }, level);
            }
        });
};