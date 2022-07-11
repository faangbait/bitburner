import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import PrettyTable from "lib/PrettyTable";

export async function route(ns: NS, server = "", sf4 = false) {
    const server_list: Set<string> = new Set(["home"]);
    let route = [];

    const scanNode = (parent: string, server: string, target: string, route: string[]) => {
        const children = ns.scan(server);
        for (let child of children) {
            if (!server_list.has(child)) {
                server_list.add(child);
            }

            if (parent === child) {
                continue;
            }

            if (child === target) {
                route.unshift(child);
                route.unshift(server);
                return true;
            }

            if (scanNode(server, child, target, route)) {
                route.unshift(server);
                return true;
            }

        }
        return false;
    };

    scanNode('', 'home', server, route);
    if (server) {
        if (sf4) {
            return route;
        } else {
            ns.tprint(route.join("; connect ") + "; backdoor");
        }
    } else {
        return Array.from(server_list.keys())
    }

}

export async function main(ns: NS) {
    const logger = new TermLogger(ns);

    let args = ns.args;
    if (args.length > 0 && typeof args[0] == "string") {
        await route(ns, args[0]);
    } else {
        let names = await route(ns);
        if (names === undefined) {
            logger.err("Error getting server list");
        } else {
            let servers = names.map(s => {
                return {
                    id: s,
                    hostname: s,
                    level: ns.getServerRequiredHackingLevel(s),
                    admin: ns.hasRootAccess(s),
                    ports: {
                        required: ns.getServerNumPortsRequired(s),
                    },
                    ram: {
                        max: ns.getServerMaxRam(s)
                    },
                    money: {
                        available: ns.getServerMoneyAvailable(s),
                        max: ns.getServerMaxMoney(s)
                    },
                    security: {
                        level: ns.getServerSecurityLevel(s),
                        min: ns.getServerMinSecurityLevel(s)
                    }
                }
            });

            // servers.sort((a,b) => a.level - b.level);
            let pt = new PrettyTable();
            var headers = ["SERVERNAME", "LEVEL", "HACKED", "CASH%", "SEC+", "RAM"];
            var rows = servers.map(s => [
                s.id,
                s.level,
                s.admin ? "\u01a6oot" : s.ports.required,
                ns.nFormat(s.money.available / s.money.max || -1, "0%"),
                ns.nFormat(Math.max(0, s.security.level - s.security.min), "0.0"),
                ns.nFormat(s.ram.max * 1024 * 1024 * 1024, "0 ib"),
            ]);
            pt.create(headers, rows);
            pt.sortTable("LEVEL");
            ns.tprint(pt.print());


        }
    }
}

export function autocomplete(data, args) {
    return data.servers;
}
