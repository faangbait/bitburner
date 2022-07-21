import { NS } from "Bitburner";
import { FactionInfo } from "modules/factions/Factions";
import { FactionCache } from "modules/factions/FactionCache";
import { Sing } from "modules/Singularity";

export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }
    for (const faction of FactionInfo.all(ns)) {
        faction.invited = ns.singularity.checkFactionInvitations().includes(faction.name);
        faction.augmentations = ns.singularity.getAugmentationsFromFaction(faction.name);
        await FactionCache.update(ns, faction);
    }
}
