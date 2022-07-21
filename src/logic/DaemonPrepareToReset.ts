import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";

/**
 * Runs when owned augs > 1; basically we buy our best aug to start this script
 */
export default class DaemonPrepareToReset extends DaemonDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.module = "DAEMON_RESET";
    }

    active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
        if (servers.filter(s => s.level < 100 && s.admin && s.money.available > 1e4).length == 0) {
            return CONTROL_SEQUENCES.SIGHUP
        }
        return null
    }

    disqualify_target(ns: NS, t: ServerObject): boolean {
        return t.level >= 100 || t.money.available < 1e4
    }

    generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = []
        let player = PlayerInfo.detail(ns);

        bundles.push(...this.__hack_cash(ns, attackers, targets, player))
        return bundles
    }
    

}
