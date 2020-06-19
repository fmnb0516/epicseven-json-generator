const getSoulBern = (text) => {
    const match = text.match(/魂力(\d*)獲得/)
    return match === null ? 0 : parseInt(match[1]);
}

const useSoulBern = (text) => {
    const match = text.match(/魂力(\d*)消費/)
    return match === null ? 0 : parseInt(match[1]);
};

const resolveDesc = ($, elements, label) => {

    for (let i = 0; i < elements.length; i++) {
        const element = $(elements.get(i));
        const text = element.text().trim();

        if(text.indexOf(label) !== -1) {
            return text.replace(label, "").trim();
        }
    }

    return "";
};

const parseUseMaterial = (texts) => {

    return texts.map(t => {

        const entry = t.substring(t.indexOf("：") + 1).split("/")
            .map(e => {
                const pair = e.split("×");
                return {
                    name : pair[0].trim(),
                    count: parseInt(pair[1].trim())
                }
            });

        return entry;
    });

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
    
    const dataPage = async ($, builder,ctx) => {
    
        builder.clearSkill().clearStampCollect().clearStampExpansion();

        await builder.thumbnail(async () => {
            const image = $(".archive-style-wrapper .a-paragraph .a-img").attr("src");
            const thumbnail = await context.common.imageToBase64(image);
            return thumbnail;
        });
    
        const name = $("#hm_1").text().substring(0, $("#hm_1").text().indexOf("の基本情報")).trim();
        const base = context.helper.findHeaderElement($, "h3", "の基本情報").next();
        const rare = parseInt($(base.find("tr").get(3)).find("td").text().trim().substring(1));
        const type = $(base.find("tr").get(4)).find("td").text().trim();
        const clazz = $(base.find("tr").get(5)).find("td").text().trim();
        builder.baseData(name, rare, type, clazz);

        builder.extention("camping",ctx.campingData[name]);
    
        const status = context.helper.findHeaderElement($, "h3", "最大ステータス【入手時 / 覚醒後】").next();
    
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
    
        const jinkei = context.helper.findHeaderElement($, "h3", "陣形効果").next();
    
        jinkei.find("tr").each((i, elm) => {
            const text = $($(elm).find("td").get(0)).text().trim();
            if (text === "") {
                return;
            }
    
            const entry = text.indexOf("+") !== -1 ? text.split("+") : [
                text.substring(0, text.search( /\d/)),
                text.substring(text.search( /\d/)),
            ];

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
    
        const skillHeader = context.helper.findHeaderElement($, "h3", "スキル", true);
        const skills = [skillHeader.next(), skillHeader.next().next(), skillHeader.next().next().next()];
    
        const skillMutiple = ctx.skillData[name];
        for (let i = 0; i < skills.length; i++) {
            const skill = skills[i];
            const snames = $(skill.find("th").get(0)).text().trim().split("\n");
    
            const sname = snames[0];
            const skilltern = parseInt(snames.length > 1 ? snames[1].substring(8, snames[1].length - 1) : 0);
    
            const desc = resolveDesc($, skill.find("td"), "【スキル効果】");
            const soul = getSoulBern(desc);
    
            const soulbern = resolveDesc($, skill.find("td"),"【魂力解放効果】");
            const usesoul = useSoulBern(soulbern);
    
            const levelupText = resolveDesc($, skill.find("td"),"【スキル強化】")
                .split("\n").filter(t => t !== "");

            const materialText = resolveDesc($, skill.find("td"),"【スキル強化素材】").split("+")
                .map(t => t.trim())
                .filter(t => t.indexOf("現在準備中") === -1)
                .filter(t => t !== "");
                
            const levelUpMaterials = parseUseMaterial(materialText);
    
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
            }, level, levelUpMaterials);
        }
    };

    return {
        listPage : listPage,
        dataPage : dataPage,
        url :"https://game8.jp/epic-seven/301575"
    };
};