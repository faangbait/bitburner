/**
 * Note: File meant to be zero-ram and imported
 */

import { NS } from "Bitburner";
import { Cache, PORTS } from "lib/Database";
import { Crime } from "modules/crimes/CrimeEnums";


export const CrimeCache = {
    all(ns: NS): Map<string, Crime> {
        return Cache.all(ns, PORTS.crimes)
    },

    read(ns: NS, id: string): Crime {
        return Cache.read(ns, PORTS.crimes, id)
    },

    async update(ns: NS, obj: Crime): Promise<Map<string, Crime>> {
        return await Cache.update(ns, PORTS.crimes, obj)
    },

    async delete(ns: NS, id: string): Promise<Map<string, Crime>> {
        return await Cache.delete(ns, PORTS.crimes, id)
    }
}
