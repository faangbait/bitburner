import { NS } from "Bitburner";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { ServerObject } from "modules/servers/ServerEnums";

/**
 * Will run until we have 3 ports. Assume we already have 256GB home ram.
 */
export default class DaemonFresh extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.module = "DAEMON_FRESH"
        this.max_ports = 3;
    }

    disqualify_target(ns: NS, t: ServerObject): boolean {
        return t.level > 40
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return player.ports < 3
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_owned = Array.from(augments.values()).filter(a => a.owned).length;
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;

        return player.ports >= 3 || augs_owned > augs_installed
    }
}
