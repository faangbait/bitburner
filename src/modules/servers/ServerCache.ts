/**
 * Note: File meant to be zero-ram and imported
 */

import { NS } from "Bitburner";
import { Cache, PORTS } from "lib/Database";
import { ServerObject } from "./ServerEnums";

export const ServerCache = {
    all(ns: NS): Map<string,ServerObject> {
        return Cache.all(ns, PORTS.servers)
    },

    read(ns: NS, id: string): ServerObject {
        return Cache.read(ns, PORTS.servers, id)
    },

    async update(ns: NS, obj: ServerObject): Promise<Map<string, ServerObject>> {
        return await Cache.update(ns, PORTS.servers, obj)
    },

    async delete(ns: NS, id: string): Promise<Map<string, ServerObject>> {
        return await Cache.delete(ns, PORTS.servers, id)
    }
}
