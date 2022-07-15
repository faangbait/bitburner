/**
 * This file uses only Enums and Cache files, which makes it zero-ram. 
 * It can use other functions that are already present on the server, like exec, ServerInfo, and PlayerInfo.
 */

import { NS } from "Bitburner";
import { ServerInfo } from "./Servers";

const gain_admin_on_servers = (ns: NS) => {
    ServerInfo.all(ns).forEach(s => s.sudo())
}

const backdoor_critical_servers = (ns: NS) => {
    
}
