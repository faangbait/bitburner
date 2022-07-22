// import { NS } from "Bitburner";
// import { CONTROL_SEQUENCES } from "lib/Database";
// import DaemonDefault from "logic/DaemonDefault";
// import { PlayerObject } from "modules/players/PlayerEnums";
// import { PlayerInfo } from "modules/players/Players";
// import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
// import { ServerInfo } from "modules/servers/Servers";

// /**
//  * Will run until we have 3 ports. Assume we already have 256GB home ram.
//  */
// export default class DaemonFresh extends DaemonDefault {
//     constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
//         super(ns, servers, player);
//         this.module = "DAEMON_FRESH";
//     }

//     active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
//         if (["CSEC", "avmnite-02h", "I.I.I.I"].map(s =>
//             ServerInfo.detail(ns, s)).filter(s =>
//                 player.ports < s.ports.required &&
//                 player.hacking.level >= s.level
//             ).length > 0) { return CONTROL_SEQUENCES.LIQUIDATE_CAPITAL }
        
//             return null
//     }

//     disqualify_target(ns: NS, t: ServerObject): boolean {
//         return t.level > 40
//     }

//     find_focus_task(ns: NS, attackers: ServerObject[], player: PlayerObject): DeploymentBundle[] {
//         let bundles: DeploymentBundle[] = [];
//         if (player.faction.membership.length > 0) {
//             bundles.push(...this.__start_faction_work(ns, player.faction.membership[0], "Hacking"))
//         } 
//         return bundles
//     }

//     generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
//         let bundles: DeploymentBundle[] = [];
//         let player = PlayerInfo.detail(ns);

//         bundles.push(...this.__buy_software(ns, 3))

//         if (bundles.length == 0) {
//             if (player.money > 3e7) { bundles.push(...this.__market(ns)) }
//             bundles.push(...this.__hacknet(ns))
//         }

//         bundles.push(...this.select_hack_algorithm(ns, attackers, targets, player));
//         return bundles
//     }
// }
