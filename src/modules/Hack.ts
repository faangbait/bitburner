import { NS } from "Bitburner";
import { DeploymentBundle, PlayerObject, ServerObject } from "Phoenix";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import HackDefault from "logic/HackDefault";
import HackHWGW from "logic/HackHWGW";
import HackMaxHP from "logic/HackMaxXP";
import HackSupportStocks from "logic/HackSupportStocks";
import { GameState } from "lib/GameState";
import { PORTS } from "lib/Variables";

export const HackingStrategy = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);

        for (const s of servers) {
            let bin = ns.ls("home", "/bin/");
            await ns.scp(bin, "home", s.id);
            let lib = ns.ls("home", "/lib/");
            await ns.scp(lib, "home", s.id);
        }

        logger.log("Hack Logic Initialized")
    },

    async loop(ns: NS) {
        const logger = new TermLogger(ns);
        while (true) {
            let { servers, player } = await HackStrategy.init(ns);
            while(ns.peek(PORTS.swap) !== "NULL PORT DATA") {
                await ns.asleep(30000);
            }
            HackStrategy.do_hack(ns, servers, player);
            await ns.asleep(1000);
        }
    }
}

class HackStrategy {
    static async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);

        return { servers, player }
    }

    static select_algorithm(ns: NS, servers: ServerObject[], player: PlayerObject) {
        if (GameState.read(ns).bitnode.current === 8) {
            if (player.market.api.tix && ns.ls("home", "/Temp/stock-getPosition.txt").length > 0) {
                return new HackSupportStocks(ns, servers, player)
            }
        }

        if ([8].includes(GameState.read(ns).bitnode.current)) {
            return new HackMaxHP(ns, servers, player);
        }
        
        if (servers.reduce((acc,cur) => acc + cur.ram.trueMax, 0) >= Math.pow(2,20)) {
            return new HackHWGW(ns, servers, player);
        }

        return new HackDefault(ns, servers, player);
    }

    static do_hack(ns: NS, servers: ServerObject[], player: PlayerObject) {
        const algo = this.select_algorithm(ns, servers, player);

        let results: {
            servers: ServerObject[],
            legal_attackers: ServerObject[],
            legal_targets: ServerObject[],
            prepared_attackers: ServerObject[],
            prepared_targets: ServerObject[],
            bundles: DeploymentBundle[],
            pids: number[]
        } = {
            servers: servers,
            legal_attackers: algo.__get_attackers(ns, servers),
            legal_targets: algo.__get_targets(ns, servers),
            prepared_attackers: [],
            prepared_targets: [],
            bundles: [],
            pids: []
        };

        results.prepared_attackers = algo.__prepare_attackers(ns, results.legal_attackers);
        results.prepared_targets = algo.__prepare_target(ns, results.legal_targets);
        results.bundles = algo.__package(ns, results.prepared_attackers, results.prepared_targets);
        results.pids = algo.__deploy(ns, results.bundles);

        algo.__iterate(ns, results)

        return { servers, player }
    }
}
