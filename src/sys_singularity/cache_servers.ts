import { NS } from "Bitburner";
import { ServerInfo } from "modules/servers/Servers";
import { ServerCache } from "modules/servers/ServerCache";
import { Sing } from "modules/Singularity";

export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }
    
    const servers = ServerInfo.all(ns);
    for (const server of servers) {
        await ServerCache.update(ns, server)
    }
}
