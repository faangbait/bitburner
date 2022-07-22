/**
 * This file uses only Enums and Cache files, which makes it zero-ram. 
 * It can use other functions that are already present on the server, like exec, ServerInfo, and PlayerInfo.
 */

import { NS } from "Bitburner";
import { ServerInfo } from "modules/servers/Servers";
import { ServerObject } from "./ServerEnums";

export const ServerFuncs = {
    sudo(ns: NS) {
        ServerInfo.all(ns).forEach(s => {
            if (!s.admin) {
                try {
                    ns.brutessh(s.id);
                    ns.ftpcrack(s.id);
                    ns.relaysmtp(s.id);
                    ns.httpworm(s.id);
                    ns.sqlinject(s.id);
                } catch {}
                finally {
                    try { ns.nuke(s.id) } catch {}
                }
            }
        })
    },

    async scp_binaries(ns: NS) {
        for (const server of ServerInfo.all(ns)){
            await ns.scp(ns.ls("home","/bin/"), server.id)
            await ns.scp(ns.ls("home","/lib/"), server.id)
        }
    },

    threadCount(server: ServerObject, scriptRam: number, strictMode = false) {
        let threads = Math.floor(server.ram.free / scriptRam);

        if (strictMode && threads <= 0) {
            throw "no threads available";
        }
        return threads;
    },

    get_processes(ns: NS, server_name: string, process_name: string) {
        return ns.ps(server_name).filter(proc => proc.filename === process_name)
    }
}

