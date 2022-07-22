import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import { SINGULARITY_SCRIPTS } from "lib/Variables";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";

/**
 * Runs when owned augs > 1; basically we buy our best aug to start this script
 */
export default class DaemonPrepareToReset extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.module = "DAEMON_PREPRESET"
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_owned = Array.from(augments.values()).filter(a => a.owned).length;
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;

        return augs_owned > augs_installed
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;
        return augs_installed >= this.bn_mults.augmentations.daedalus_req
    }
    
    set_control_sequence(ns: NS): CONTROL_SEQUENCES | null {
        return CONTROL_SEQUENCES.LIQUIDATE_CAPITAL
    }

    disqualify_target(ns: NS, t: ServerObject): boolean {
        return t.level >= 100 || t.money.available <= 1e4
    }

    generate_hacking_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        if (targets.length === 0) {
            return [{
                file: SINGULARITY_SCRIPTS.PREPARE_FOR_RESET,
                priority: -100
            }]
        }
        return this.__hack_cash(ns, attackers, targets)
    }
}
