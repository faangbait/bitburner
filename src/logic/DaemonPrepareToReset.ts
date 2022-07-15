import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { ServerObject } from "modules/servers/ServerEnums";

export default class DaemonPrepareToReset extends DaemonDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
    }

    active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
        return CONTROL_SEQUENCES.SIGHUP
    }

}
