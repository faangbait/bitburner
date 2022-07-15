import { NS } from "Bitburner";
import { CONTROL_SEQUENCES } from "lib/Database";
import DaemonDefault from "logic/DaemonDefault";
import { PlayerObject } from "modules/players/PlayerEnums";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerInfo } from "modules/servers/Servers";

export default class DaemonVisible extends DaemonDefault {
    daemon_difficulty: number;
    daemon: ServerObject;
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.daemon = ServerInfo.detail(ns, "w0r1dd43m0n")
        this.daemon_difficulty = 3000 * this.bn.multipliers.hacking.daemon;
    }

    active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
        return null
    }

    select_hack_algorithm(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];

        if (player.money > 1e8) {
            return this.__hack_max_xp(ns, attackers, targets, player);
        } else {
            return this.__hack_default(ns, attackers, targets, player);
        }

        return bundles
    }

    // kill_scripts(ns: NS, servers: ServerObject[], player: PlayerObject): { filename: string; servers: ServerObject[] }[] {
    //     if (this.daemon && this.daemon.admin) {
    //         if (this.daemon.level <= player.hacking.level) {
    //             return this.all_home_hackbins
    //         }
    //     } else {
    //         return [
    //             {
    //                 filename: '/bin/hk.js',
    //                 servers: servers.filter(s => s.pids.some(p => p.target && p.target.id !== "n00dles"))
    //             },
    //             {
    //                 filename: '/bin/gr.js',
    //                 servers: servers.filter(s => s.pids.some(p => p.target && p.target.id !== "n00dles"))
    //             },
    //             {
    //                 filename: '/bin/wk.js',
    //                 servers: servers.filter(s => s.pids.some(p => p.target && p.target.id !== "n00dles"))
    //             },
    //         ]
    //     }
    //     return []
    // }

    // next_goals(ns: NS, servers: ServerObject[], player: PlayerObject): ProgressionGoal[] {
    //     let bitnodes = Array.from(GameState.read(ns).sourcefiles.entries()).filter(([n, lvl]) => lvl < 3);
    //     if (bitnodes.length === 0) { bitnodes = [[12, 0]] }
    //     bitnodes.sort(([a_n, a_lvl], [b_n, b_lvl]) => a_lvl - b_lvl)

    //     return [{
    //         stat: "hacking",
    //         current: player.hacking.level,
    //         target: this.daemon_difficulty,
    //         comparison: 1,
    //         progress_rate: player.hacking.multipliers.exp, // TODO: Not a progress rate
    //         on_completion: async () => { await ReservedRam.use(ns, SINGULARITY_FILES.DESTROY_DAEMON, 1, [bitnodes[0][0]]) }
    //     }]
    // }
}
