import { NS } from "Bitburner";
import { GameState } from "lib/GameState";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";
import { ReservedRam } from "lib/Swap";
import { CONTROL_SEQUENCES, PORTS, SYS_FILES } from "lib/Variables";
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

            let ctrl_sequence = ns.peek(PORTS.control);

            switch(ctrl_sequence) {
                case CONTROL_SEQUENCES.LIQUIDATE_CAPITAL:
                    await ReservedRam.use(ns, SYS_FILES.MARKET,1,["-l"]);
                    while (ns.peek(PORTS.control) == CONTROL_SEQUENCES.LIQUIDATE_CAPITAL) {
                        await ns.asleep(10);
                    }
                default:
                    break;
            }
            
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
