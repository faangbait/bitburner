import { NS } from "Bitburner";
import { Cache, PORTS } from "lib/Database";
import { Bitnode } from "./BitnodeEnums";

export const BitNodeCache = {
    all(ns: NS): Map<string,Bitnode> {
        return Cache.all(ns, PORTS.bitnodes)
    },

    read(ns: NS, id: string): Bitnode {
        return Cache.read(ns, PORTS.bitnodes, id)
    },

    async update(ns: NS, obj: Bitnode): Promise<Map<string, Bitnode>> {
        return await Cache.update(ns, PORTS.bitnodes, obj)
    },

    async delete(ns: NS, id: string): Promise<Map<string, Bitnode>> {
        return await Cache.delete(ns, PORTS.bitnodes, id)
    }
}
