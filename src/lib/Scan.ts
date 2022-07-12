import { NS } from "Bitburner";

const universal_scanner = (ns: NS, server = "", sf4 = false) : { route: string[], server_list: Set<string> }=> {
    const server_list: Set<string> = new Set(["home"]);
    let route: string[] = [];

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
    return {route, server_list};
}

export const Scanner = {
    list(ns: NS): string[] {
        let {route, server_list} = universal_scanner(ns);
        return Array.from(server_list.keys());
    },

    route(ns: NS, target="", sf4 = false): string[] {
        let {route, server_list} = universal_scanner(ns, target, sf4);
        return route
    },
}
