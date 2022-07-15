/**
 * Note: File meant to be zero-ram and imported
 */

import { NS } from "Bitburner";
import { Cache, PORTS } from "lib/Database";
import { Faction } from "./FactionEnums";


export const FactionCache = {
    all(ns: NS): Map<string,Faction> {
        return Cache.all(ns, PORTS.factions)
    },

    read(ns: NS, id: string): Faction {
        return Cache.read(ns, PORTS.factions, id)
    },

    async update(ns: NS, obj: Faction): Promise<Map<string, Faction>> {
        return await Cache.update(ns, PORTS.factions, obj)
    },

    async delete(ns: NS, id: string): Promise<Map<string, Faction>> {
        return await Cache.delete(ns, PORTS.factions, id)
    }
}
