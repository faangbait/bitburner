import {NS, SleeveInformation} from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import { SleeveObject } from "Phoenix";

export const SleeveInfo = {
    all(ns: NS): SleeveObject[] {
        let sleeves: SleeveObject[] = [];
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            sleeves.push(SleeveInfo.detail(ns, i))
        }

        return sleeves
    },


    detail(ns: NS, sleeveNumber: number): SleeveObject {
        let info = ns.sleeve.getInformation(sleeveNumber);
        let stats = ns.sleeve.getSleeveStats(sleeveNumber);
        let task = ns.sleeve.getTask(sleeveNumber);

        let sleeve: SleeveObject = {
            id: sleeveNumber,
            hp: {
                current: info.hp,
                max: info.maxHp
            },
            money: info.earningsForTask.workMoneyGain,
            city: info.city,
            location: task.location,
            work: {
                isWorking: info.timeWorked > 0,
                type: task.task,
                jobs: info.jobs,
                titles: info.jobTitle,
                time: info.timeWorked,
            },
            gym: {
                stat: task.gymStatType,
            },
            software: {
                tor: info.tor
            },
            multipliers: {
                companyRep: info.mult.companyRep
            },
            crime: {
                type: task.crime,
                multipliers: {
                    money: info.mult.crimeMoney,
                    success: info.mult.crimeSuccess
                }
            },
            faction: {
                multipliers: {
                    rep: info.mult.factionRep
                }
            },
            agility: {
                level: stats.agility,
                multipliers: {
                    exp: info.mult.agilityExp,
                    level: info.mult.agility
                }
            },
            charisma: {
                level: stats.charisma,
                multipliers: {
                    exp: info.mult.charismaExp,
                    level: info.mult.charisma
                }
            },
            defense: {
                level: stats.defense,
                multipliers: {
                    exp: info.mult.defenseExp,
                    level: info.mult.defense
                }
            },
            dexterity: {
                level: stats.dexterity,
                multipliers: {
                    exp: info.mult.dexterityExp,
                    level: info.mult.dexterity
                }
            },
            hacking: {
                level: stats.hacking,
                multipliers: {
                    exp: info.mult.hackingExp,
                    level: info.mult.hacking
                }
            },
            strength: {
                level: stats.strength,
                multipliers: {
                    exp: info.mult.strengthExp,
                    level: info.mult.strength
                }
            },
            shock: stats.shock,
            sync: stats.sync,
            augs: {
                owned: ns.sleeve.getSleeveAugmentations(sleeveNumber),
                buyable: ns.sleeve.getSleevePurchasableAugs(sleeveNumber).map(pair => {
                    return {
                        cost: pair.cost,
                        name: pair.name
                    }
                }),
                buy: function (name: string) {
                    return ns.sleeve.purchaseSleeveAug(sleeveNumber, name)
                }
            },
            actions: {
                bladeburner: function (action: string, contract?: string): boolean { return ns.sleeve.setToBladeburnerAction(sleeveNumber, action, contract) },
                crime: function (name: string): boolean {return ns.sleeve.setToCommitCrime(sleeveNumber, name)},
                work: function (name: string): boolean {return ns.sleeve.setToCompanyWork(sleeveNumber, name)},
                faction: function (name: string, type: string): boolean | undefined {return ns.sleeve.setToFactionWork(sleeveNumber, name, type)},
                gym: function (name: string, stat: string): boolean {return ns.sleeve.setToGymWorkout(sleeveNumber, name, stat)},
                recover: function (): boolean {return ns.sleeve.setToShockRecovery(sleeveNumber)},
                sync: function (): boolean {return ns.sleeve.setToSynchronize(sleeveNumber)},
                uni: function (uni: string, cls: string): boolean {return ns.sleeve.setToUniversityCourse(sleeveNumber, uni, cls)},
                travel: function (city: string): boolean {return ns.sleeve.travel(sleeveNumber, city)},
            }
        };
        return sleeve;
    }
}

export const Sleeves = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);
        logger.log("Sleeves Enabled")
    },

    async loop(ns: NS) {
        const logger = new TermLogger(ns);
        while (true) {
            await ns.asleep(30000);
            let servers = SInfo.all(ns);
            let player = PInfo.detail(ns);
            let sleeves = SleeveInfo.all(ns);
            
            sleeves.filter(s => s.sync < 10).forEach(s => s.actions.sync())
            sleeves.filter(s => s.shock > 90).forEach(s => s.actions.recover())

            if (player.work.isWorking) {
                if (player.work.current.factionName) {
                    sleeves.forEach(s => s.actions.faction(player.work.current.factionName, player.work.type))
                }
            }

            sleeves.filter(s => s.work.type === "Idle").forEach(s => ns.tprint(`Sleeve ${s.id} is idle at end of loop.`))
        }
    }
}

