import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import { SINGULARITY_SCRIPTS } from "lib/Variables";
import DaemonDefault from "logic/DaemonDefault";
import { AugmentationFuncs } from "modules/augmentations/AugmentationFunctions";
import { FactionCache } from "modules/factions/FactionCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerFuncs } from "modules/servers/ServerFunctions";
import { ServerInfo } from "modules/servers/Servers";
import { Sing } from "modules/Singularity";

/**
 * Runs when world daemon is visible.
 * Goal: Win game
 */
export default class DaemonVisible extends DaemonDefault {
    constructor(ns) {
        super(ns);
        this.module = "DAEMON_VISIBLE"
        this.max_ports = 5;
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return servers.filter(s => s.hostname === "w0r1d_d43m0n").length > 0
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return servers.filter(s => s.hostname === "w0r1d_d43m0n" && s.admin && s.backdoored).length > 0
    }

    set_control_sequence(ns: NS): CONTROL_SEQUENCES | null {
        return null
    }

    generate_hacking_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let player = PlayerInfo.detail(ns);

        if (Sing.has_access(ns)) {
            if (ServerInfo.detail(ns, "w0r1d_d43m0n").admin) {
                return [{
                    file: SINGULARITY_SCRIPTS.DESTROY_DAEMON,
                    priority: -99
                }]
            }
        }

        if (player.money > 1e8) {
            return this.__hack_max_xp(ns, attackers, targets)
        } else {
            return this.__hack_default(ns, attackers, targets)
        }
    }
}
