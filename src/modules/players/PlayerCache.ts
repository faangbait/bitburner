/**
 * Note: File meant to be zero-ram and imported
 */

import { NS } from "Bitburner";
import { Cache, PORTS } from "lib/Database";
import { PlayerObject } from "./PlayerEnums";

export const PlayerCache = {
    all(ns: NS): Map<string,PlayerObject> {
        return Cache.all(ns, PORTS.players)
    },

    read(ns: NS, id: string): PlayerObject {
        return Cache.read(ns, PORTS.players, id)
    },

    async update(ns: NS, obj: PlayerObject): Promise<Map<string, PlayerObject>> {
        return await Cache.update(ns, PORTS.players, obj)
    },

    async delete(ns: NS, id: string): Promise<Map<string, PlayerObject>> {
        return await Cache.delete(ns, PORTS.players, id)
    }
}
