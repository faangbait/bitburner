import { NS } from "Bitburner";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { ServerObject } from "modules/servers/ServerEnums";

/**
 * Runs when we are established and at Daedalus augs req
 */
export default class DaemonJoinDaedalus extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.module = "DAEMON_JOINDAEDALUS"
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;

        return augs_installed >= this.bn_mults.augmentations.daedalus_req
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return player.faction.membership.includes("Daedalus")
    }
}
