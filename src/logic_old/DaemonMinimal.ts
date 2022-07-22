// import { NS } from "Bitburner";
// import { CONTROL_SEQUENCES } from "lib/Database";
// import { SINGULARITY_SCRIPTS } from "lib/Variables";
// import DaemonDefault from "logic/DaemonDefault";
// import { PlayerObject } from "modules/players/PlayerEnums";
// import { PlayerInfo } from "modules/players/Players";
// import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
// import { Sing } from "modules/Singularity";

// /**
//  * Will run until we have > 256 GB of Server RAM
//  * Goal: Increase home RAM > 256 GB
//  */
// export default class DaemonMinimal extends DaemonDefault {
//     constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
//         super(ns, servers, player);
//         this.module = "DAEMON_MINIMAL";
//     }

//     active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
//         return null
//     }

//     disqualify_target(ns: NS, t: ServerObject): boolean {
//         return t.level > 5
//     }

//     find_focus_task(ns: NS, attackers: ServerObject[], player: PlayerObject): DeploymentBundle[] {
//         let bundles: DeploymentBundle[] = [];
        
//         if (player.faction.membership.length > 0) {
//             bundles.push(...this.__start_faction_work(ns, player.faction.membership[0], "Hacking"))
//         } else if (player.agility.level + player.strength.level + player.defense.level + player.dexterity.level < 100) {
//             bundles.push(...this.__start_company_work(ns, "Joe's Guns", "Employee"))
//         } else { bundles.push(...this.select_crime(ns))}

//         return bundles
//     }

//     generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
//         let player = PlayerInfo.detail(ns);
//         let bundles: DeploymentBundle[] = [];

//         if (!player.work.isWorking) {
//             bundles.push(...this.find_focus_task(ns, attackers, player))
//         }

//         bundles.push(...this.__buy_software(ns, 1))

//         if (bundles.length == 0 ) {
//             if (player.money > 1e8) { bundles.push(...this.__upgrade_home(ns, "ram")) }
//             if (player.money > 3e7) { bundles.push(...this.__market(ns)) }
//         }
//         if (bundles.length == 0) {
//             bundles.push(...this.select_hack_algorithm(ns,attackers,targets, player));
//         }
        
//         if (player.money > 2e6) { bundles.push(...this.__hacknet(ns)) }
        
//         return bundles
//     }

// }

