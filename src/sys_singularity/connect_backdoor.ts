/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} hostname
 * @argument {boolean} backdoor if true, installs a backdoor on server
 * 
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { Scanner } from "lib/Scan";


export async function main(ns: NS) {
    let args = ns.args;

    let hostname = args[0];
    let backdoor = args[1];

    if (typeof hostname !== "string") { return }
    if (typeof backdoor !== "boolean") { backdoor = false }

    let route_list = Scanner.route(ns, hostname, true);
    try {
        if (route_list) {
            let first_stop = route_list.shift(); // pop home off
            if (first_stop && first_stop != "home") { route_list.unshift(first_stop) }
            for (let link of route_list) { ns.singularity.connect(link) }
            if (backdoor) {
                await ns.singularity.installBackdoor();
                await ns.sleep(30000)
                ns.singularity.connect("home");
            }
        }
    } catch {
        ns.tprint("REQUIRED ROUTING: ")
        ns.tprint(route_list.join("; connect ") + "; backdoor")
    }
}
