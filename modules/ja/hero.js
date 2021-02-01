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
            const image = $(".archive-style-wrapper .a-paragraph .a-img").attr("data-src");
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
            }, level, levelUpMaterials , skillMutiple !== undefined ? skillMutiple[i] : {});
        }
    };

    const csvEntry = (() => {
        const csvLevelText = (level) => {
            return level === undefined ? "" : level.label + " " + level.value + (level.num === "percent" ? "%" : "") + " " + level.type;
        };
    
        const stamp = {
            "3" : {"D":0, "C":1, "B":2, "A":3, "S":4, "SS":5, "SSS":6},
            "4" : {"D":-1, "C":0, "B":1, "A":2, "S":3, "SS":4, "SSS":4},
            "5" : {"D":-1, "C":-1, "B":0, "A":1, "S":2, "SS":3, "SSS":4},
        };

        const csvStampValue = (rare, obj, rank) => {
            const index = stamp[rare + ""][rank];
            return index != -1 ? obj[index].value : "";
        };

        return (key, json) => {
            if(key === "名称") return json.name;
            if(key === "レアリティ") return "★" + json.rare;
            if(key === "クラス") return json.clazz;
            if(key === "属性") return json.type;
    
            if(key === "攻撃力(max)") return json.status.max.attack;
            if(key === "生命力(max)") return json.status.max.health;
            if(key === "防御力(max)") return json.status.max.defense;
            if(key === "速度(max)") return json.status.max.speed;
            if(key === "クリティカル発生率") return json.status.max.critical_hit;
            if(key === "クリティカルダメージ") return json.status.max.critical_damage;
            if(key === "効果命中率") return json.status.max.debuff_hit;
            if(key === "効果抵抗率") return json.status.max.debuff_resist;
            if(key === "連携攻撃発生率") return json.status.max.unity_chance;
    
            if(json.extention.camping !== undefined) {
                if(key === "会話1 ID") return json.extention.camping.topic[0].id;
                if(key === "会話1 名称") return json.extention.camping.topic[0].name;
                if(key === "会話2 ID") return json.extention.camping.topic[1].id;
                if(key === "会話2 名称") return json.extention.camping.topic[1].name;
                if(key === "士気増減") return Object.keys(json.extention.camping.camping)
                        .map(k => k + ":" + json.extention.camping.camping[k]).join("\r\n");
            }
    
            if(key === "スキル1名称") return json.skill[0].name;
            if(key === "ターン(S1)") return json.skill[0].tern;
            if(key === "説明(S1)") return json.skill[0].desc;
            if(key === "魂力開放 説明(S1)") return json.skill[0].soul.bern_desc;
            if(key === "獲得魂力(S1)") return json.skill[0].soul.soul;
            if(key === "消費魂力(S1)") return json.skill[0].soul.usesoul;
            if(key === "魂力開放(S1)") return json.skill[0].soul.soulbern ? "TRUE" : "FALSE";
            if(key === "+1(S1)") return csvLevelText(json.skill[0].level[0]);
            if(key === "+2(S1)") return csvLevelText(json.skill[0].level[1]);
            if(key === "+3(S1)") return csvLevelText(json.skill[0].level[2]);
            if(key === "+4(S1)") return csvLevelText(json.skill[0].level[3]);
            if(key === "+5(S1)") return csvLevelText(json.skill[0].level[4]);
            if(key === "+6(S1)") return csvLevelText(json.skill[0].level[5]);
            if(key === "+7(S1)") return csvLevelText(json.skill[0].level[6]);
    
            if(key === "スキル2名称") return json.skill[1].name;
            if(key === "ターン(S2)") return json.skill[1].tern;
            if(key === "説明(S2)") return json.skill[1].desc;
            if(key === "魂力開放 説明(S2)") return json.skill[1].soul.bern_desc;
            if(key === "獲得魂力(S2)") return json.skill[1].soul.soul;
            if(key === "消費魂力(S2)") return json.skill[1].soul.usesoul;
            if(key === "魂力開放(S2)") return json.skill[1].soul.soulbern ? "TRUE" : "FALSE";
            if(key === "+1(S2)") return csvLevelText(json.skill[1].level[0]);
            if(key === "+2(S2)") return csvLevelText(json.skill[1].level[1]);
            if(key === "+3(S2)") return csvLevelText(json.skill[1].level[2]);
            if(key === "+4(S2)") return csvLevelText(json.skill[1].level[3]);
            if(key === "+5(S2)") return csvLevelText(json.skill[1].level[4]);
            if(key === "+6(S2)") return csvLevelText(json.skill[1].level[5]);
            if(key === "+7(S2)") return csvLevelText(json.skill[1].level[6]);
    
            if(key === "スキル3名称") return json.skill[2].name;
            if(key === "ターン(S3)") return json.skill[2].tern;
            if(key === "説明(S3)") return json.skill[2].desc;
            if(key === "魂力開放 説明(S3)") return json.skill[2].soul.bern_desc;
            if(key === "獲得魂力(S3)") return json.skill[2].soul.soul;
            if(key === "消費魂力(S3)") return json.skill[2].soul.usesoul;
            if(key === "魂力開放(S3)") return json.skill[2].soul.soulbern ? "TRUE" : "FALSE";
            if(key === "+1(S3)") return csvLevelText(json.skill[2].level[0]);
            if(key === "+2(S3)") return csvLevelText(json.skill[2].level[1]);
            if(key === "+3(S3)") return csvLevelText(json.skill[2].level[2]);
            if(key === "+4(S3)") return csvLevelText(json.skill[2].level[3]);
            if(key === "+5(S3)") return csvLevelText(json.skill[2].level[4]);
            if(key === "+6(S3)") return csvLevelText(json.skill[2].level[5]);
            if(key === "+7(S3)") return csvLevelText(json.skill[2].level[6]);

            if(json.stamp.expansion.length !== 0) {
                if(key === "陣形効果") return json.stamp.expansion[0].label + (json.stamp.expansion[0].type === "fix" ? "(固定)" : "(%)");
                if(key === "D(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "D");
                if(key === "C(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "C");
                if(key === "B(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "B");
                if(key === "A(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "A");
                if(key === "S(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "S");
                if(key === "SS(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "SS");
                if(key === "SSS(陣形)") return csvStampValue(json.rare, json.stamp.expansion, "SSS");
            }

            if(json.stamp.collect.length !== 0) {
                if(key === "刻印集中") return json.stamp.collect[0].label + (json.stamp.collect[0].type === "fix" ? "(固定)" : "(%)");
                if(key === "D(刻印)") return csvStampValue(json.rare, json.stamp.collect, "D");
                if(key === "C(刻印)") return csvStampValue(json.rare, json.stamp.collect, "C");
                if(key === "B(刻印)") return csvStampValue(json.rare, json.stamp.collect, "B");
                if(key === "A(刻印)") return csvStampValue(json.rare, json.stamp.collect, "A");
                if(key === "S(刻印)") return csvStampValue(json.rare, json.stamp.collect, "S");
                if(key === "SS(刻印)") return csvStampValue(json.rare, json.stamp.collect, "SS");
                if(key === "SSS(刻印)") return csvStampValue(json.rare, json.stamp.collect, "SSS");
            }

            return "";  
        };
    })();

    return {
        csvEntry : csvEntry,
        listPage : listPage,
        dataPage : dataPage,
        url :"https://game8.jp/epic-seven/301575",
        csvHeaders : ["名称", "レアリティ", "クラス", "属性", "攻撃力(max)", "生命力(max)", "防御力(max)", "速度(max)",
                "クリティカル発生率", "クリティカルダメージ", "効果命中率", "効果抵抗率", "連携攻撃発生率",
                "スキル1名称", "ターン(S1)", "説明(S1)", "魂力開放 説明(S1)", "獲得魂力(S1)", "消費魂力(S1)", "魂力開放(S1)", "+1(S1)", "+2(S1)", "+3(S1)", "+4(S1)", "+5(S1)", "+6(S1)", "+7(S1)",
                "スキル2名称", "ターン(S2)", "説明(S2)", "魂力開放 説明(S2)", "獲得魂力(S2)", "消費魂力(S2)", "魂力開放(S2)", "+1(S2)", "+2(S2)", "+3(S2)", "+4(S2)", "+5(S2)", "+6(S2)", "+7(S2)",
                "スキル3名称", "ターン(S3)", "説明(S3)", "魂力開放 説明(S3)", "獲得魂力(S3)", "消費魂力(S3)", "魂力開放(S3)", "+1(S3)", "+2(S3)", "+3(S3)", "+4(S3)", "+5(S3)", "+6(S3)", "+7(S3)",
                "陣形効果", "D(陣形)", "C(陣形)", "B(陣形)", "A(陣形)", "S(陣形)", "SS(陣形)", "SSS(陣形)",
                "刻印集中", "D(刻印)", "C(刻印)", "B(刻印)", "A(刻印)", "S(刻印)", "SS(刻印)", "SSS(刻印)",
                "会話1 ID", "会話1 名称", "会話2 ID", "会話2 名称", "士気増減"
            ]
    };
};