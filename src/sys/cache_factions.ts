import { NS } from "Bitburner";
import { FactionInfo } from "modules/factions/Factions";
import { FactionCache } from "modules/factions/FactionCache";

export const main = async (ns: NS) => {
    for (const fact of FactionInfo.all(ns)) {
        await FactionCache.update(ns, fact)
    }
}
