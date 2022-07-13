import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { ReservedRam } from "lib/Swap";
import { FACTIONS, FACTION_MODEL, SINGULARITY_FILES } from "lib/Variables";

export async function main(ns: NS) {
    let logger = new TermLogger(ns);

    try {

        for (const inv of Array.from(FACTION_MODEL.entries()).filter(f => ns.singularity.checkFactionInvitations().includes(f[0]))) {
            if (inv[1].length === 0) {
                await ReservedRam.use(ns, SINGULARITY_FILES.FACTION_JOIN,1, [FACTIONS[inv[0]]])
            } else {
                // decide if we want to join the faction
            }
        }
    } catch {}
}
