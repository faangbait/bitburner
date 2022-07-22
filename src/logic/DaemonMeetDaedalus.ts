import { NS } from "Bitburner";
import DaemonDefault from "logic/DaemonDefault";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { ServerObject } from "modules/servers/ServerEnums";

/**
 * Runs when we are very established but under Daedalus augs req
 */
export default class DaemonMeetDaedalus extends DaemonDefault {
    constructor(ns: NS) {
        super(ns);
        this.module = "DAEMON_MEETDAEDALUS"
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return player.hacking.level > 1000 
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        let augments = AugCache.all(ns);
        let augs_installed = Array.from(augments.values()).filter(a => a.installed).length;
        return augs_installed >= this.bn_mults.augmentations.daedalus_req
    }

}
