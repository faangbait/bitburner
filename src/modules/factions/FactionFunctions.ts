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
import { Faction } from "modules/factions/FactionEnums";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";

export const FactionFuncs = {
    async singularity_backdoor(ns: NS) {
        let player = PlayerInfo.detail(ns);
        let backdoors = Array.from(FactionCache.all(ns).values()).map(f => f.backdoor_req)
        let faction_servers = backdoors.filter(hostname => hostname !== "").map(hostname => ServerInfo.detail(ns, hostname))
        for (const server of faction_servers.filter(s => 
            s.admin && 
            !s.backdoored && 
            s.level <= player.hacking.level && 
            s.ports.required <= 
            player.ports)) {
                await ReservedRam.use(ns, SINGULARITY_SCRIPTS.CONNECT_SERVER, 1, [server.id, true])
            }

    },

    get_donation_to_target_rep(ns: NS, faction: Faction, target_rep: number) {
        let favor = faction.favor;
        let required_rep = target_rep - faction.rep;
        if (required_rep <= 0) { return 0 }

        return 1e6 * (required_rep / PlayerInfo.detail(ns).faction.multipliers.rep)
    },

    min_donation_favor(ns: NS) {
        return 150 * BitNodeCache.read(ns, "current").multipliers.faction.min_favor
    }

}


