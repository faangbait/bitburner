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
                    ns.nuke(s.id)
                }
            }
        })
    },

    threadCount(server: ServerObject, scriptRam: number, strictMode = false) {
        let threads = Math.floor(server.ram.free / scriptRam);

        if (strictMode && threads <= 0) {
            throw "no threads available";
        }
        return threads;
    },

    backdoor_critical_servers(ns: NS) {

    }
}

