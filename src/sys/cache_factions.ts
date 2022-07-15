import { NS } from "Bitburner";
import { FactionInfo } from "modules/factions/Factions";
import { FactionCache } from "modules/factions/FactionCache";

export const main = async (ns: NS) => {
    const factions = FactionInfo.all(ns);
    for (const fact of factions.values()) {
        await FactionCache.update(ns, fact)
    }
}
