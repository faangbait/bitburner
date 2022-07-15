/**
 * This file uses only Enums and Cache files, which makes it zero-ram. 
 * It can use other functions that are already present on the server, like exec, ServerInfo, and PlayerInfo.
 */

import { NS } from "Bitburner";
import { ReservedRam } from "lib/Swap";
import { SINGULARITY_SCRIPTS } from "lib/Variables";
import { PlayerInfo } from "modules/players/Players";
import { ServerInfo } from "modules/servers/Servers";
import { FactionCache } from "modules/factions/FactionCache";

const backdoor_faction_servers = async (ns: NS) => {
    let player = PlayerInfo.detail(ns);
    let backdoors = Array.from(FactionCache.all(ns).values()).map(f => f.backdoor_req)
    let faction_servers = backdoors.filter(hostname => hostname !== "").map(hostname => ServerInfo.detail(ns, hostname))
    for (const server of faction_servers.filter(s => 
        s.admin && 
        !s.backdoored && 
        s.level <= player.hacking.level && 
        s.ports.required <= 
        player.ports)) {
            await ReservedRam.use(ns, SINGULARITY_SCRIPTS.CONNECT_SERVER,1, [true])
        }
    
}
