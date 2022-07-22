// import { NS } from "Bitburner";
// import { CONTROL_SEQUENCES } from "lib/Database";
// import { SINGULARITY_SCRIPTS } from "lib/Variables";
// import DaemonDefault from "logic/DaemonDefault";
// import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
// import { FactionFuncs } from "modules/factions/FactionFunctions";
// import { FactionInfo } from "modules/factions/Factions";
// import { PlayerObject } from "modules/players/PlayerEnums";
// import { PlayerInfo } from "modules/players/Players";
// import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
// import { Sing } from "modules/Singularity";

// /**
//  * Runs when we are Daedalus members
//  * Goal: Get Red Pill
//  */
// export default class DaemonRedPill extends DaemonDefault {
//     constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
//         super(ns, servers, player);
//         this.module = "DAEMON_REDPILL";
//     }

//     find_focus_task(ns: NS, attackers: ServerObject[], player: PlayerObject): DeploymentBundle[] {
//         let bundles: DeploymentBundle[] = [];
//         this.__start_faction_work(ns, "Daedalus", "Hacking", true);
//         return bundles
//     }

//     generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
//         let bundles: DeploymentBundle[] = [];
//         let player = PlayerInfo.detail(ns);
//         let daedalus = FactionInfo.detail(ns, "Daedalus");

//         if (Sing.has_access(ns)) {
//             if (daedalus.rep > 2.5e7) {
//                 bundles.push({
//                     file: SINGULARITY_SCRIPTS.PREPARE_FOR_RESET
//                 })
//             }
    
//             if (daedalus.favor > 150 * FactionFuncs.min_donation_favor(ns)) { // donations enabled
//                 let required_donation = FactionFuncs.get_donation_to_target_rep(ns, daedalus, 2.5e7)
//                 if (player.money > required_donation) {
//                     bundles.push({
//                         file: SINGULARITY_SCRIPTS.FACTION_DONATE,
//                         args: ["Daedalus", required_donation]
//                     })
//                 }
//             }

//         }

//         bundles.push(...this.select_hack_algorithm(ns, attackers, targets, player));
//         return bundles
//     }
// }
