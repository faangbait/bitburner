import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import { SINGULARITY_SCRIPTS } from "lib/Variables";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerFuncs } from "modules/servers/ServerFunctions";
import { ServerInfo } from "modules/servers/Servers";

export default class DaemonVisible extends DaemonDefault {
    daemon_difficulty: number;
    daemon: ServerObject;
    next_bitnode: number;
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.daemon = ServerInfo.detail(ns, "w0r1d_d43m0n")
        this.daemon_difficulty = 3000 * this.bn.multipliers.hacking.daemon;
        this.module = "DAEMON_VISIBLE";
        this.next_bitnode = 5;

    }

    active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
        return null
    }

    select_hack_algorithm(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        if (player.money > 1e8) {
            return this.__hack_max_xp(ns, attackers, targets, player);
        } else {
            bundles.push(...this.__market(ns))
            bundles.push(...this.__hack_default(ns, attackers, targets, player));
        }

        return bundles
    }

    generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);
        
        bundles.push(...this.__buy_ports(ns));

        if (this.daemon.level <= player.hacking.level) {
            if (!this.daemon.admin) {
                if (this.daemon.ports.required <= player.ports) {
                    ServerFuncs.sudo(ns)
                }
            }
            if (this.daemon.admin) {
                bundles.push({
                    file: SINGULARITY_SCRIPTS.DESTROY_DAEMON,
                    attacker: "home",
                    threads: 1,
                    args: [this.next_bitnode]
                })
            }
        }

        if (bundles.length > 0) { return bundles }

        return this.select_hack_algorithm(ns, attackers, targets, player);
    }
}
