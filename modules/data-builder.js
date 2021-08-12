
class MaterialDataBuilder {
    constructor(data) {
        this.json = data !== null ? data : {
            normal : {},
            hard : {}
        };
    };

    clearDrop() {
        this.json.normal = {};
        this.json.hard = {};
        return this;
    };

    baseData(name, type, normal_shop, hard_shop, epic) {
        this.json.name = name;
        this.json.type = type;
        this.json.epic_material = epic;
        this.json.normal_material = epic === false;

        this.json.normal_shop = normal_shop.map(e => {
            return {
                area_id : e[0],
                area_label : e[1]
            };
        });
        
        this.json.hard_shop = hard_shop.map(e => {
            return {
                area_id : e[0],
                area_label : e[1]
            };
        });

        return this;
    };

    hardDrop(area_id, area_name, stage_id, stage_name) {
        if(this.json.hard[area_id] === undefined) {
            this.json.hard[area_id] = {
                label : area_name,
                id : area_id,
                stage : []
            };
        }

        this.json.hard[area_id].stage.push({
            label : stage_name,
            id : stage_id
        });
    };

    normalDrop(area_id, area_name, stage_id, stage_name) {
        if(this.json.normal[area_id] === undefined) {
            this.json.normal[area_id] = {
                label : area_name,
                id : area_id,
                stage : []
            };
        }

        this.json.normal[area_id].stage.push({
            label : stage_name,
            id : stage_id
        });
    };

    async thumbnail(callback) {
        this.json.thumbnail = await callback();
        return this;
    };

    toJsonString() {
        return JSON.stringify(this.json, null, "\t");
    };
};

class ArtifactDataBuilder {
    constructor(data) {
        this.json = data !== null ? data : {
            effect : [],
            status : {}
        };
    };

    clearEffect() {
        this.json.effect = [];
        return this;
    };

    baseData(name, rare, target) {
        this.json["name"] = name;
        this.json["rare"] = rare;
        this.json["target"] = target;
        return this;
    };

    effect(skill_level, artifact_level, desc) {
        this.json.effect.push({
            skill_level : skill_level,
            artifact_level : artifact_level,
            desc : desc
        });
        return this;
    }

    maxStatus(attack, health) {
        this.json.status["max"] = {
            attack : attack,
            health : health
        };
        return this;
    };

    initStatus(attack, health) {
        this.json.status["init"] = {
            attack : attack,
            health : health
        };
        return this;
    };

    async thumbnail(callback) {
        this.json.thumbnail = await callback();
        return this;
    };

    toJsonString() {
        return JSON.stringify(this.json, null, "\t");
    };
};

class HeroDataBuilder {
    constructor(data) {
        this.json = data !== null ? data : {
            status : {},
            stamp : {
                expansion : [],
                collect : []
            },
            skill : []
        };
    };

    extention(key, data) {
        if(this.json["extention"] === undefined) {
            this.json["extention"] = {};
        }
        this.json["extention"][key] = data;
        return this;
    };

    baseData(name, rare, type, clazz) {
        this.json["name"] = name;
        this.json["rare"] = rare;
        this.json["type"] = type;
        this.json["clazz"] = clazz;
        return this;
    };

    maxStatus(attack, health, speed, defense, critical_hit, critical_damage, unity_chance, debuff_hit, debuff_resist) {
        this.json.status["max"] = {
            attack : attack,
            health : health,
            speed : speed,
            defense : defense,
            critical_hit : critical_hit,
            critical_damage : critical_damage,
            unity_chance : unity_chance,
            debuff_hit : debuff_hit,
            debuff_resist : debuff_resist
        };

        return this;

    };

    async thumbnail(callback) {
        this.json.thumbnail = await callback();
        return this;
    };

    initStatus(attack, health, speed, defense, critical_hit, critical_damage, unity_chance, debuff_hit, debuff_resist) {

        this.json.status["init"] = {
            attack : attack,
            health : health,
            speed : speed,
            defense : defense,
            critical_hit : critical_hit,
            critical_damage : critical_damage,
            unity_chance : unity_chance,
            debuff_hit : debuff_hit,
            debuff_resist : debuff_resist
        };

        return this;
    };

    stampExpansion(label, value, type) {
        this.json.stamp.expansion.push({
            label : label,
            value : value,
            type : type
        });
        return this;
    };

    stampCollect(label, value, type) {
        this.json.stamp.collect.push({
            label : label,
            value : value,
            type : type
        });
        return this;
    };

    skill(name, skilltern, desc, soul, level, material, multiple) {

        this.json.skill.push({
            name : name,
            tern : skilltern,
            desc : desc,
            soul : soul,
            level : level,
            material: material,
            multiple : multiple
        });
        return this;
    };

    clearStampCollect() {
        this.json.stamp.collect = [];
        return this;
    };

    clearStampExpansion() {
        this.json.stamp.expansion = [];
        return this;
    };

    clearSkill() {
        this.json.skill = [];
        return this;
    };

    toJsonString() {
        return JSON.stringify(this.json, null, "\t");
    };
};

module.exports.HeroDataBuilder = HeroDataBuilder;
module.exports.ArtifactDataBuilder = ArtifactDataBuilder;
module.exports.MaterialDataBuilder = MaterialDataBuilder;