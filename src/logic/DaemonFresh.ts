import { NS } from "Bitburner";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";

/**
 * Will run until we have 3 ports. Assume we already have 256GB home ram.
 */
export default class DaemonFresh extends DaemonDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.module = "DAEMON_FRESH";
    }

    find_focus_task(ns: NS, attackers: ServerObject[], player: PlayerObject): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        if (player.faction.membership.length > 0) {
            bundles.push(...this.__start_faction_work(ns, player.faction.membership[0], "Hacking"))
        } 
        return bundles
    }

    generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        bundles.push(...this.__buy_software(ns, 3))

        if (bundles.length == 0) {
            if (player.money > 3e7) { bundles.push(...this.__market(ns)) }
            bundles.push(...this.__hacknet(ns))
        }

        bundles.push(...this.select_hack_algorithm(ns, attackers, targets, player));
        return bundles
    }
}
