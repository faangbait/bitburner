import { CrimeStats, NS } from "Bitburner";
import { CrimeNames, Crimes } from "modules/crimes/CrimeEnums";

class Crime {
    id: string;
    chance: number;
    stats: CrimeStats

    constructor(ns: NS, name: string) {
        this.id = name;
        this.chance = ns.singularity.getCrimeChance(name);
        this.stats = ns.singularity.getCrimeStats(name);
    }
}

export const CrimeInfo = {
    all(ns: NS): Crime[] {
        let crimes: Crime[] = [];
        for (const cname in CrimeNames) {
            crimes.push(new Crime(ns, CrimeNames[cname]))
        }
        return crimes
    },

    detail(ns: NS, cname: string): Crime {
        return new Crime(ns, cname)
    }
}
