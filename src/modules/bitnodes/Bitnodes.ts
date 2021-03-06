/**
 * Note: File meant to be used by loader apps, not the main script
 */

import { BitNodeMultipliers, NS } from "Bitburner";
import { TEMP_F } from "lib/Variables";
import { BitnodeMultiplier, Bitnodes } from "modules/bitnodes/BitnodeEnums";

const DEFAULT_MULTS = {
    AgilityLevelMultiplier: 1,
    AugmentationMoneyCost: 1,
    AugmentationRepCost: 1,
    BladeburnerRank: 1,
    BladeburnerSkillCost: 1,
    CharismaLevelMultiplier: 1,
    ClassGymExpGain: 1,
    CodingContractMoney: 1,
    CompanyWorkExpGain: 1,
    CompanyWorkMoney: 1,
    CorporationSoftcap: 1,
    CorporationValuation: 1,
    CrimeExpGain: 1,
    CrimeMoney: 1,
    DaedalusAugsRequirement: 1,
    DefenseLevelMultiplier: 1,
    DexterityLevelMultiplier: 1,
    FactionPassiveRepGain: 1,
    FactionWorkExpGain: 1,
    FactionWorkRepGain: 1,
    FourSigmaMarketDataApiCost: 1,
    FourSigmaMarketDataCost: 1,
    GangSoftcap: 1,
    HackExpGain: 1,
    HackingLevelMultiplier: 1,
    HacknetNodeMoney: 1,
    HomeComputerRamCost: 1,
    InfiltrationMoney: 1,
    InfiltrationRep: 1,
    ManualHackMoney: 1,
    PurchasedServerCost: 1,
    PurchasedServerLimit: 1,
    PurchasedServerMaxRam: 1,
    PurchasedServerSoftcap: 1,
    RepToDonateToFaction: 1,
    ScriptHackMoney: 1,
    ScriptHackMoneyGain: 1,
    ServerGrowthRate: 1,
    ServerMaxMoney: 1,
    ServerStartingMoney: 1,
    ServerStartingSecurity: 1,
    ServerWeakenRate: 1,
    StaneksGiftExtraSize: 1,
    StaneksGiftPowerMultiplier: 1,
    StrengthLevelMultiplier: 1,
    WorldDaemonDifficulty: 1
}

class Bitnode {
    id: string;
    number: number;
    completed: number;
    multipliers: BitnodeMultiplier;

    constructor(ns: NS, n: number, completed = 0) {
        this.number = n;
        this.completed = completed;

        let current = JSON.parse(ns.read(TEMP_F.CURRENT_BITNODE))
        let mult: BitNodeMultipliers;

        if (current !== n) {
            this.id = `BitNode${n}`
            mult = DEFAULT_MULTS;
        } else {
            this.id = 'current'
            try { mult = ns.getBitNodeMultipliers() } catch { mult = DEFAULT_MULTS; }
        }

        this.multipliers = {
            augmentations: {
                money: mult.AugmentationMoneyCost,
                rep: mult.AugmentationRepCost,
                daedalus_req: mult.DaedalusAugsRequirement
            },
            agility: mult.AgilityLevelMultiplier,
            charisma: mult.CharismaLevelMultiplier,
            defense: mult.DefenseLevelMultiplier,
            dexterity: mult.DexterityLevelMultiplier,
            strength: mult.StrengthLevelMultiplier,
            bladeburner: {
                rank: mult.BladeburnerRank,
                skill: mult.BladeburnerSkillCost
            },
            gym: mult.ClassGymExpGain,
            leetcode: mult.CodingContractMoney,
            company: {
                exp: mult.CompanyWorkExpGain,
                money: mult.CompanyWorkMoney
            },
            corporation: {
                softcap: mult.CorporationSoftcap,
                valuation: mult.CorporationValuation
            },
            crime: {
                exp: mult.CrimeExpGain,
                money: mult.CrimeMoney
            },
            faction: {
                passive: mult.FactionPassiveRepGain,
                rep: mult.FactionWorkRepGain,
                min_favor: mult.RepToDonateToFaction,
                work: {
                    exp: mult.FactionWorkExpGain,
                    rep: mult.FactionWorkRepGain
                }
            },
            tix: mult.FourSigmaMarketDataApiCost,
            gang: mult.GangSoftcap,
            hacking: {
                exp: mult.HackExpGain,
                level: mult.HackingLevelMultiplier,
                manual: mult.ManualHackMoney,
                money: {
                    gain: mult.ScriptHackMoneyGain,
                    movement: mult.ScriptHackMoney
                },
                max_money: mult.ServerMaxMoney,
                starting_money: mult.ServerStartingMoney,
                starting_sec: mult.ServerStartingSecurity,
                growth: mult.ServerGrowthRate,
                weaken: mult.ServerWeakenRate,
                daemon: mult.WorldDaemonDifficulty
            },
            hacknet: {
                production: mult.HacknetNodeMoney,
            },
            purchased_servers: {
                cost: mult.PurchasedServerCost,
                limit: mult.PurchasedServerLimit,
                ram: mult.PurchasedServerMaxRam,
                softcap: mult.PurchasedServerSoftcap,
                home_ram: mult.HomeComputerRamCost
            },
            infiltration: {
                money: mult.InfiltrationMoney,
                rep: mult.InfiltrationRep
            },
            stanek: {
                power: mult.StaneksGiftPowerMultiplier,
                size: mult.StaneksGiftExtraSize
            }
        }
    }
}

/**
 * Returns a list of Bitnode objects
 */
export const BitnodeInfo = {
    all(ns: NS): Bitnode[] {
        return [...ns.getOwnedSourceFiles().map(sf => new Bitnode(ns, sf.n, sf.lvl)), BitnodeInfo.current(ns)]
    },

    detail(ns: NS, n: number) {
        return BitnodeInfo.all(ns).filter(bn => bn.number == n)[0]
    },

    current(ns: NS) {
        let current = JSON.parse(ns.read(TEMP_F.CURRENT_BITNODE))
        return new Bitnode(ns, current, 0)
    }
}
