import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import { ReservedRam } from "lib/Swap";
import { CURRENT_BITNODE, SYS_FILES } from "lib/Variables";
import { PurchaseServers } from "logic/MoneyPurchaseServer";

export const MoneyStrategy = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);

        if (![8].includes(CURRENT_BITNODE)) {
            await ReservedRam.use(ns, SYS_FILES.HACKNET)
        }
        
    },

    async loop(ns: NS) {
        const logger = new TermLogger(ns);
        while (true) {
            let servers = SInfo.all(ns);
            let player = PInfo.detail(ns);
            servers.filter(s => !s.admin && player.ports >= s.ports.required).forEach(s => s.sudo())

                    await ReservedRam.use(ns, SYS_FILES.MARKET);
                }

                if (![8].includes(CURRENT_BITNODE)) {
                    PurchaseServers(ns, servers)
                }
                
            }

            await ns.asleep(30000);
        }
    }
}
