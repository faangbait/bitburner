import { NS } from "Bitburner";
import { ServerInfo } from "modules/servers/Servers";
import { ServerCache } from "modules/servers/ServerCache";

export const main = async (ns: NS) => {
    for (const server of ServerInfo.all(ns)) {
        await ServerCache.update(ns, server)
    }
}
