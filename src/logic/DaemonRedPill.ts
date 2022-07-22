import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import { SINGULARITY_SCRIPTS } from "lib/Variables";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { AugmentationNames } from "modules/augmentations/AugmentationEnums";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
import { FactionFuncs } from "modules/factions/FactionFunctions";
import { FactionInfo } from "modules/factions/Factions";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { Sing } from "modules/Singularity";

/**
 * Runs when we are Daedalus members
 * Goal: Get Red Pill
 */
export default class DaemonRedPill extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.module = "DAEMON_REDPILL"
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return player.faction.membership.includes("Daedalus")
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let rp = augments.get(AugmentationNames.TheRedPill)
        if (rp && rp.installed) { return true }
        return false
    }

    generate_focus_bundle(ns: NS): DeploymentBundle[] {
        return this.__work_faction(ns, "Daedalus", "Hacking", true)
    }

    generate_hacking_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);
        let daedalus = FactionInfo.detail(ns, "Daedalus");

        if (Sing.has_access(ns)) {
            if (daedalus.rep > 2.5e7) {
                bundles.push({
                    file: SINGULARITY_SCRIPTS.PREPARE_FOR_RESET
                })
            }

            if (daedalus.favor > 150 * FactionFuncs.min_donation_favor(ns)) { // donations enabled
                let required_donation = FactionFuncs.get_donation_to_target_rep(ns, daedalus, 2.5e7)
                if (player.money > required_donation) {
                    bundles.push({
                        file: SINGULARITY_SCRIPTS.FACTION_DONATE,
                        args: ["Daedalus", required_donation]
                    })
                }
            }
        }

        bundles.push(...this.__hack_default(ns, attackers, targets))
        return bundles
        
    }
}
