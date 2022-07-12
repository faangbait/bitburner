import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { ReservedRam } from "lib/Swap";
import { FACTION_MODEL, SINGULARITY_FILES } from "lib/Variables";

export async function main(ns: NS) {
    let logger = new TermLogger(ns);

    try {
        for (const inv of FACTION_MODEL.filter(f => ns.singularity.checkFactionInvitations().includes(f.id))) {
            if (inv.blocks.length === 0) {
                await ReservedRam.use(ns, SINGULARITY_FILES.JOIN_FACTION,1, [inv.id])
            } else {
                // decide if we want to join the faction
            }
        }
    } catch {}
}
