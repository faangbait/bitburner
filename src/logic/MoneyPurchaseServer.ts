import { NS } from "Bitburner";
import { ServerObject } from "Phoenix";
import { ReservedRam } from "lib/Swap";
import { SInfo } from "lib/Servers";
import { SYS_FILES } from "lib/Variables";
import { TermLogger } from "lib/Helpers";

export const PurchaseServers = async (ns: NS, servers: ServerObject[]) => {
    ns.disableLog("sleep");
    let logger = new TermLogger(ns);

    const ram = (power: number) => { return Math.pow(2, power) }
    const purchase_cost = (power: number) => { return ram(power) * 55000 }
    const can_afford_server = (power: number) => { return servers.filter(s => s.isHome)[0].money.available >= purchase_cost(power) }

    const MAX_SERVERS = 25;
    const MIN_SIZE = Math.min(18, Math.max(6, servers.filter(s => s.isHome)[0].power));

    let purchased_servers = servers.filter(s => s.purchased);
    let strongest_server, weakest_server;

    if (purchased_servers.length > 0) {
        strongest_server = purchased_servers.reduce((max, cur) => cur.power > max.power ? cur : max);
        weakest_server = purchased_servers.reduce((min, cur) => cur.power < min.power ? cur : min);
    } else {
        strongest_server = servers.filter(s => s.isHome)[0]
        weakest_server = servers.filter(s => s.isHome)[0]
    }
    
    let next_upgrade = Math.max(MIN_SIZE, strongest_server.power + 1);

    // sell servers
    if (purchased_servers.length === MAX_SERVERS && can_afford_server(next_upgrade) && weakest_server.power < 18) {
        ReservedRam.use(ns, SYS_FILES.PURCHASE_SVR.toString(), 1, ["sell", weakest_server.hostname])
        purchased_servers.pop() // doesn't matter what we pop, we're about to buy a replacement
    } else { logger.info(`Not attempting to sell server: ${purchased_servers.length} < ${MAX_SERVERS}; ${next_upgrade} cost ${purchase_cost(next_upgrade)}; weakest: ${weakest_server.power}`)}

    // buy servers
    if (purchased_servers.length < MAX_SERVERS && can_afford_server(next_upgrade)) {
        ReservedRam.use(ns, SYS_FILES.PURCHASE_SVR.toString(), 1, ["buy", 'cluster-', ram(next_upgrade)])
    }  else { logger.info(`Not attempting to buy server: ${purchased_servers.length} >= ${MAX_SERVERS}; ${next_upgrade} cost ${purchase_cost(next_upgrade)}; strongest: ${strongest_server.power}`)}

    return SInfo.all(ns);
}
