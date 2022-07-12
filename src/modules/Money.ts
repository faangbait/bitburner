import { NS } from "Bitburner";
import { GameState } from "lib/GameState";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import { ReservedRam } from "lib/Swap";
import { SYS_FILES } from "lib/Variables";
import { PurchaseServers } from "logic/MoneyPurchaseServer";

export const MoneyStrategy = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);

        if (![8].includes(GameState.read(ns).bitnode.current)) {
            await ReservedRam.use(ns, SYS_FILES.HACKNET)
        }
        
    },

    async loop(ns: NS) {
        const logger = new TermLogger(ns);
        while (true) {
            let servers = SInfo.all(ns);
            let player = PInfo.detail(ns);
            servers.filter(s => !s.admin && player.ports >= s.ports.required).forEach(s => s.sudo())

            if (ns.ps("home").every(p => p.filename !== SYS_FILES.HACKNET)) {
                if (player.market.api.tix && !ns.ps("home").some(proc => proc.filename === SYS_FILES.MARKET)) {
                    await ReservedRam.use(ns, SYS_FILES.MARKET);
                }

                if (![8].includes(GameState.read(ns).bitnode.current)) {
                    PurchaseServers(ns, servers)
                }
                
            }

            await ns.asleep(30000);
        }
    }
}
