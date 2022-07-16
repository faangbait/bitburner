import { NS } from "Bitburner";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { ServerObject } from "modules/servers/ServerEnums";

/**
 * Runs when we are established and at Daedalus augs req
 */
export default class DaemonJoinDaedalus extends DaemonDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.module = "DAEMON_JOINDAEDALUS";
    }
}
