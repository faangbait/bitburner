import { NS } from "Bitburner";
import { PlayerObject } from "Phoenix";

export const PInfo = {
    all(ns: NS): PlayerObject[] {
        return [
            PInfo.detail(ns)
        ]
    },
    detail(ns: NS): PlayerObject {
        let data = ns.getPlayer();

        let player = {
            id: 'player',
            updated_at: new Date().valueOf(),
            hp: {
                current: data.hp,
                max: data.max_hp
            },
            level: data.hacking,
            money: data.money,
            intelligence: data.intelligence,
            city: data.city,
            location: data.location,
            className: data.className,
            company: {
                companyName: data.companyName,
                multipliers: {
                    rep: data.company_rep_mult
                }
            },
            bladeburner: {
                multipliers: {
                    analysis: data.bladeburner_analysis_mult,
                    max_stamina: data.bladeburner_max_stamina_mult,
                    stamina_gain: data.bladeburner_stamina_gain_mult,
                    success_chance: data.bladeburner_success_chance_mult,
                }
            },
            createProgram: {
                progName: data["createProgramName"],
                reqLevel: data["createProgramReqLvl"]
            },
            crime: {
                type: data.crimeType,
                multipliers: {
                    money: data.crime_money_mult,
                    success: data.crime_success_mult
                },
                kills: data.numPeopleKilled,
                karma: ns.heart.break()
            },
            work: {
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
            },
            charisma: {
                level: data.charisma,
                exp: data.charisma_exp,
                multipliers: {
                    exp: data.charisma_exp_mult,
                    level: data.charisma_mult,
                }
            },
            agility: {
                level: data.agility,
                exp: data.agility_exp,
                multipliers: {
                    exp: data.agility_exp_mult,
                    level: data.agility_mult,
                }
            },
            dexterity: {
                level: data.dexterity,
                exp: data.dexterity_exp,
                multipliers: {
                    exp: data.dexterity_exp_mult,
                    level: data.dexterity_mult,
                }
            },
            defense: {
                level: data.defense,
                exp: data.defense_exp,
                multipliers: {
                    exp: data.defense_exp_mult,
                    level: data.defense_mult,
                }
            },
            strength: {
                level: data.strength,
                exp: data.strength_exp,
                multipliers: {
                    exp: data.strength_exp_mult,
                    level: data.strength_mult,
                }
            },
            faction: {
                membership: data.factions,
                multipliers: {
                    rep: data.faction_rep_mult
                }
            },
            hacking: {
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
            },
            hnet: {
                multipliers: {
                    coreCost: data.hacknet_node_core_cost_mult,
                    levelCost: data.hacknet_node_level_cost_mult,
                    production: data.hacknet_node_money_mult,
                    purchaseCost: data.hacknet_node_purchase_cost_mult,
                    ramCost: data.hacknet_node_ram_cost_mult,
                }
            },
            market: {
                api: {
                    tix: data.hasTixApiAccess,
                    fourSigma: data.has4SDataTixApi
                },
                manual: {
                    wse: data.hasWseAccount,
                    fourSigma: data.has4SData
                }
            },
            playtime: {
                total: data.totalPlaytime,
                sinceAug: data.playtimeSinceLastAug,
                sinceBitnode: data.playtimeSinceLastBitnode
            },
            ports: ns.ls("home").filter(file => [
                "BruteSSH.exe",
                "FTPCrack.exe",
                "relaySMTP.exe",
                "HTTPWorm.exe",
                "SQLInject.exe"
            ].includes(file)).length,
            software: {
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

            },
        };
        return player;
    }
    
}
