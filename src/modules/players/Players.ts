/**
 * Note: OK for main script to use this file
 */
import { NS } from "Bitburner";

class Player {
    id: string;
    hp: { current: number; max: number; };
    level: number;
    money: number;
    intelligence: number;
    city: string;
    location: string;
    className: string;
    company: { companyName: string; multipliers: { rep: number; }; };
    bladeburner: { multipliers: { analysis: number; max_stamina: number; stamina_gain: number; success_chance: number; }; };
    createProg: { progName: string; reqLevel: number; };
    crime: { type: string; multipliers: { money: number; success: number; }; kills: number; karma: any; };
    work: { isWorking: boolean; type: string; jobs: any; current: { factionName: string; factionDesc: string; }; multipliers: { money: number; }; stats: { agi: { gained: number; rate: number; }; str: { gained: number; rate: number; }; cha: { gained: number; rate: number; }; dex: { gained: number; rate: number; }; def: { gained: number; rate: number; }; hack: { gained: number; rate: number; }; money: { gained: number; rate: number; loss: number; }; rep: { gained: number; rate: number; }; }; };
    charisma: { level: number; exp: number; multipliers: { exp: number; level: number; }; };
    agility: { level: number; exp: number; multipliers: { exp: number; level: number; }; };
    dexterity: { level: number; exp: number; multipliers: { exp: number; level: number; }; };
    defense: { level: number; exp: number; multipliers: { exp: number; level: number; }; };
    strength: { level: number; exp: number; multipliers: { exp: number; level: number; }; };
    faction: { membership: string[]; multipliers: { rep: number; }; };
    hacking: { exp: number; level: number; multipliers: { chance: number; exp: number; grow: number; money: number; level: number; speed: number; }; };
    hnet: { multipliers: { coreCost: number; levelCost: number; production: number; purchaseCost: number; ramCost: number; }; };
    market: { api: { tix: boolean; fourSigma: boolean; }; manual: { wse: boolean; fourSigma: boolean; }; };
    playtime: { total: number; sinceAug: number; sinceBitnode: number; };
    ports: number;
    software: { tor: boolean; ssh: boolean; ftp: boolean; smtp: boolean; http: boolean; sql: boolean; formulas: boolean; };
    
    constructor(ns: NS) {
        let data = ns.getPlayer();
        this.id = 'player';
        this.level = data.hacking;
        this.money = data.money;
        this.intelligence = data.intelligence;
        this.city = data.city;
        this.location = data.location;
        this.className = data.className;
        
        this.hp = {
            current: data.hp,
            max: data.max_hp
        };

        this.company = {
            companyName: data.companyName,
            multipliers: {
                rep: data.company_rep_mult
            }
        };

        this.bladeburner = {
            multipliers: {
                analysis: data.bladeburner_analysis_mult,
                max_stamina: data.bladeburner_max_stamina_mult,
                stamina_gain: data.bladeburner_stamina_gain_mult,
                success_chance: data.bladeburner_success_chance_mult,
            }
        };

        this.createProg = {
            progName: data["createProgramName"],
            reqLevel: data["createProgramReqLvl"]
        };

        this.crime = {
            type: data.crimeType,
            multipliers: {
                money: data.crime_money_mult,
                success: data.crime_success_mult
            },
            kills: data.numPeopleKilled,
            karma: ns.heart.break()
        };

        this.work = {
            isWorking: data.isWorking,
            type: data.workType,
            jobs: data.jobs,
            current: {
                factionName: data.currentWorkFactionName,
                factionDesc: data.currentWorkFactionDescription
            },
            multipliers: {
                money: data.work_money_mult
            },
            stats: {
                agi: {
                    gained: data.workAgiExpGained,
                    rate: data.workAgiExpGainRate
                },
                str: {
                    gained: data.workStrExpGained,
                    rate: data.workStrExpGainRate
                },
                cha: {
                    gained: data.workChaExpGained,
                    rate: data.workChaExpGainRate
                },
                dex: {
                    gained: data.workDexExpGained,
                    rate: data.workDexExpGainRate
                },
                def: {
                    gained: data.workDefExpGained,
                    rate: data.workDefExpGainRate
                },
                hack: {
                    gained: data.workHackExpGained,
                    rate: data.workHackExpGainRate
                },
                money: {
                    gained: data.workMoneyGained,
                    rate: data.workMoneyGainRate,
                    loss: data.workMoneyLossRate
                },
                rep: {
                    gained: data.workRepGained,
                    rate: data.workRepGainRate
                }
            }
        };

        this.charisma = {
            level: data.charisma,
            exp: data.charisma_exp,
            multipliers: {
                exp: data.charisma_exp_mult,
                level: data.charisma_mult,
            }
        };

        this.agility = {
            level: data.agility,
            exp: data.agility_exp,
            multipliers: {
                exp: data.agility_exp_mult,
                level: data.agility_mult,
            }
        };

        this.dexterity = {
            level: data.dexterity,
            exp: data.dexterity_exp,
            multipliers: {
                exp: data.dexterity_exp_mult,
                level: data.dexterity_mult,
            }
        };

        this.defense = {
            level: data.defense,
            exp: data.defense_exp,
            multipliers: {
                exp: data.defense_exp_mult,
                level: data.defense_mult,
            }
        };

        this.strength = {
            level: data.strength,
            exp: data.strength_exp,
            multipliers: {
                exp: data.strength_exp_mult,
                level: data.strength_mult,
            }
        };

        this.faction = {
            membership: data.factions,
            multipliers: {
                rep: data.faction_rep_mult
            }
        };

        this.hacking = {
            exp: data.hacking_exp,
            level: data.hacking,
            multipliers: {
                chance: data.hacking_chance_mult,
                exp: data.hacking_exp_mult,
                grow: data.hacking_grow_mult,
                money: data.hacking_money_mult,
                level: data.hacking_mult,
                speed: data.hacking_speed_mult
            }
        };

        this.hnet = {
            multipliers: {
                coreCost: data.hacknet_node_core_cost_mult,
                levelCost: data.hacknet_node_level_cost_mult,
                production: data.hacknet_node_money_mult,
                purchaseCost: data.hacknet_node_purchase_cost_mult,
                ramCost: data.hacknet_node_ram_cost_mult,
            }
        };

        this.market = {
            api: {
                tix: data.hasTixApiAccess,
                fourSigma: data.has4SDataTixApi
            },
            manual: {
                wse: data.hasWseAccount,
                fourSigma: data.has4SData
            }
        };

        this.playtime = {
            total: data.totalPlaytime,
            sinceAug: data.playtimeSinceLastAug,
            sinceBitnode: data.playtimeSinceLastBitnode
        };

        this.ports = ns.ls("home").filter(file => [
            "BruteSSH.exe",
            "FTPCrack.exe",
            "relaySMTP.exe",
            "HTTPWorm.exe",
            "SQLInject.exe"
        ].includes(file)).length;

        this.software = {
            tor: data.tor,

            ssh: ns.ls("home").some(file => [
                "BruteSSH.exe",
            ].includes(file)),

            ftp: ns.ls("home").some(file => [
                "FTPCrack.exe",
            ].includes(file)),

            smtp: ns.ls("home").some(file => [
                "RelaySMTP.exe",
            ].includes(file)),

            http: ns.ls("home").some(file => [
                "HTTPWorm.exe",
            ].includes(file)),

            sql: ns.ls("home").some(file => [
                "SQLInject.exe"
            ].includes(file)),

            formulas: ns.ls("home").some(file => [
                "Formulas.exe"
            ].includes(file)),
        };
    }
}


export const PlayerInfo = {
    detail(ns: NS): Player {
        return new Player(ns);
    }
}
