import { NS } from "Bitburner";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { ServerObject } from "modules/servers/ServerEnums";

export default class DaemonRedPill extends DaemonDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
    }
}
