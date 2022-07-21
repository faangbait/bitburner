/**
 * This file uses only Enums and Cache files, which makes it zero-ram. 
 * It can use other functions that are already present on the server, like exec, ServerInfo, and PlayerInfo.
 */

import { NS } from "Bitburner";
import { CrimeCache } from "modules/crimes/CrimeCache";
import { Crime } from "modules/crimes/CrimeEnums";

export const CrimeFuncs = {
    rank_crimes(ns: NS) {
        let crimes = CrimeCache.all(ns)
        return Array.from(crimes.values()).sort((a,b) => b.chance - a.chance)
    },

    get_best(ns: NS, stat: "agility" | "charisma" | "defense" | "dexterity" | "strength" | "hacking" | "intelligence" | "combat"): Crime {
        let crimes = CrimeFuncs.rank_crimes(ns);
        let stat_name = ""
        switch (stat) {
            case "agility":
                stat_name = "agility_exp"
                break;
            case "charisma":
                stat_name = "charisma_exp"
                break;
            case "defense":
                stat_name = "defense_exp"
                break;
            case "dexterity":
                stat_name = "dexterity_exp"
                break;
            case "strength":
                stat_name = "strength_exp"
                break;
            case "hacking":
                stat_name = "hacking_exp"
                break;
            case "intelligence":
                stat_name = "intelligence_exp"
                break;
            case "combat":
                return crimes.sort((a,b) => 
                ((b.stats.agility_exp + b.stats.defense_exp + b.stats.dexterity_exp + b.stats.strength_exp) * b.chance) / b.stats.time -
                ((a.stats.agility_exp + a.stats.defense_exp + a.stats.dexterity_exp + a.stats.strength_exp) * a.chance) / a.stats.time
                )[0]
            default:
                break;
            }

        crimes.sort((a,b) => (b.stats[stat_name] * b.chance) / b.stats.time - (a.stats[stat_name] * a.chance) / a.stats.time)
        return crimes[0]
    }
}
