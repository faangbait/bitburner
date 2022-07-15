/**
 * Daemon's goal is to bring the set of desired scripts on all servers into alignment with a strategy by starting or stopping scripts.
 */
import { NS } from "Bitburner";
import { TermLogger } from "lib/Logger";
import DaemonDefault from "logic/DaemonDefault";
import DaemonEndgameFactions from "logic/DaemonEndgameFactions";
import DaemonGetAugs from "logic/DaemonGetAugs";
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

export const DaemonStrategy = {
    async init(ns: NS) {},

    async loop(ns: NS) {
        const logger = new TermLogger(ns);
        while (true) {
            let servers = ServerInfo.all(ns);
            let player = PlayerInfo.detail(ns);

            ServerFuncs.sudo(ns)
            await GameStrategy.execute_strategy(ns, servers, player);
            await ns.asleep(1000);
        }
    },
}

/**
 * Strategy order is roughly:
 * - Daemon Default             -> Develop a solid base
 * - Daemon GetAugs             -> Optimally pursue augmentations
 * - Daemon PrepareToReset      -> Close up shop, maximize reset potential
 * - Daemon GetAugs
 * - Daemon PrepareToReset
 * - Daemon GetAugs
 * - Daemon PrepareToReset
 * - Daemon Endgame Factions    -> Gathering our final augmentations before targeting Daedalus
 * - Daemon RedPill             -> We have Daedalus membership and can rush the Red Pill
 * - Daemon Visible             -> We have taken the red pill and have only to backdoor Daemon
 */
class GameStrategy { // TODO: Adjust this
    static select_algorithm(ns: NS, servers: ServerObject[], player: PlayerObject) {
        let logger = new TermLogger(ns);
        if (servers.filter(s => s.id === "w0r1d_d43m0n")) {
            return new DaemonVisible(ns, servers, player);
        }

        if (player.faction.membership.includes("Daedalus")) {
            return new DaemonRedPill(ns, servers, player);
        }

        let augments = AugCache.all(ns);
        let augs_installed = Array.from(augments.values()).filter(a => a.installed)
        let augs_owned = Array.from(augments.values()).filter(a => a.owned)
        let bn = BitNodeCache.read(ns, 'current');

        let daedalus_augs = bn.multipliers.augmentations.daedalus_req;

        if (augs_installed.length >= daedalus_augs) {
            return new DaemonEndgameFactions(ns, servers, player);
        }

        if (augs_owned.length >= daedalus_augs) {
            return new DaemonPrepareToReset(ns, servers, player);
        }

        if (augs_owned.length - augs_installed.length > 5) {
            return new DaemonPrepareToReset(ns, servers, player);
        }

        if (player.ports >= 5) { return new DaemonGetAugs(ns, servers, player); }

        return new DaemonDefault(ns, servers, player);

    }

    static async execute_strategy(ns: NS, servers: ServerObject[], player: PlayerObject) {
        let logger = new TermLogger(ns);
        const gs = this.select_algorithm(ns, servers, player);
        // logger.log(`Executing ${gs.module}`)
        
        if (await gs.__send_control_sequences(ns, servers, player)) {
            await ns.asleep(2000);
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
