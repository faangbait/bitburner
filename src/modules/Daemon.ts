/**
 * Daemon's goal is to bring the set of desired scripts on all servers into alignment with a strategy by starting or stopping scripts.
 */
 import { NS } from "Bitburner";
 import DaemonDefault from "logic/DaemonDefault";
 import DaemonJoinDaedalus from "logic/DaemonJoinDaedalus";
 import DaemonPrepareToReset from "logic/DaemonPrepareToReset";
 import DaemonRedPill from "logic/DaemonRedPill";
 import DaemonVisible from "logic/DaemonVisible";
 import { PlayerInfo } from "modules/players/Players";
 import { ServerInfo } from "modules/servers/Servers";
 import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
 import { PlayerObject } from "modules/players/PlayerEnums";
 import { AugCache } from "modules/augmentations/AugmentationCache";
 import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
 import { ServerFuncs } from "modules/servers/ServerFunctions";
 import DaemonMinimal from "logic/DaemonMinimal";
 import DaemonFresh from "logic/DaemonFresh";
 import DaemonMeetDaedalus from "logic/DaemonMeetDaedalus";
 import { FactionCache } from "modules/factions/FactionCache";
 import { FactionFuncs } from "modules/factions/FactionFunctions";
 import { Sing } from "modules/Singularity";
import { PORTS } from "lib/Database";
 
 export const DaemonStrategy = {
     async init(ns: NS) {
         await ServerFuncs.scp_binaries(ns);
     },
 
     async loop(ns: NS) {
         while (true) {
             let servers = ServerInfo.all(ns);
             let player = PlayerInfo.detail(ns);

             ServerFuncs.sudo(ns);
             if (Sing.has_access(ns)) {
                await FactionFuncs.singularity_backdoor(ns);
                await FactionFuncs.join_unblocked_factions(ns);
             }

 

             await GameStrategy.execute_strategy(ns, servers, player);
             await ns.asleep(1000);
         }
     },
 }
 
 /**
  * Milestone order is roughly:
  * - Daemon Minimal             -> Develop a solid base from minimal resources
  * - Daemon Fresh               -> Develop a solid base from some resources (post-Reset)
  * - Daemon Default             -> Achieve long-term stability of resources
  * - Daemon PrepareToReset      -> Maximize potential of upcoming reset
  * - Daemon MeetDaedalus        -> We are under the number of required augmentations to join Daedalus
  * - Daemon JoinDaedalus        -> We meet the number of required augmentations to join Daedalus
  * - Daemon RedPill             -> We have Daedalus membership and can rush the Red Pill
  * - Daemon Visible             -> We have taken the red pill and our only remaining goal is to backdoor the world daemon
  */
 class GameStrategy { // TODO: Adjust this
     static select_algorithm(ns: NS, servers: ServerObject[], player: PlayerObject) {
        let algos = [
            new DaemonMinimal(ns),
            new DaemonFresh(ns),
            new DaemonPrepareToReset(ns),
            new DaemonMeetDaedalus(ns),
            new DaemonJoinDaedalus(ns),
            new DaemonRedPill(ns),
            new DaemonVisible(ns)
        ]

        for (const algo of algos) {
            if (algo.active(ns, servers, player) && !algo.escape(ns, servers, player)) { return algo }
        }

        return new DaemonDefault(ns)
     }
 
     static async execute_strategy(ns: NS, servers: ServerObject[], player: PlayerObject) {
        const gs = this.select_algorithm(ns, servers, player);
        const active_control_sequence = gs.set_control_sequence(ns)
        ns.clearPort(PORTS.control)

        if (active_control_sequence) {
            await ns.writePort(PORTS.control, active_control_sequence)
            await ns.asleep(1)
        }

        let results : {
            servers: ServerObject[],
            legal_attackers: ServerObject[],
            legal_targets: ServerObject[],
            prepared_attackers: ServerObject[],
            prepared_targets: ServerObject[],
            bundles: DeploymentBundle[],
            pids: number[]
        } = {
            servers: servers,
            legal_attackers: gs.__get_attackers(ns, servers),
            legal_targets: gs.__get_targets(ns, servers),
            prepared_attackers: [],
            prepared_targets: [],
            bundles: [],
            pids: []
        }

        results.prepared_attackers = gs.__prepare_attackers(ns, results.legal_attackers);
        results.prepared_targets = gs.__prepare_targets(ns, results.legal_targets);
        results.bundles = gs.__package(ns, results.prepared_attackers, results.prepared_targets);
        results.pids = gs.__deploy(ns, results.bundles)

        gs.__iterate(ns, results);

     }
 }
 