/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} target
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { Scanner } from "lib/Scan";

export async function main(ns: NS) {
    const logger = new TermLogger(ns);
    const args = ns.args;
    if (typeof args[0] === "string") { 
        logger.info(Scanner.route(ns, args[0]).join("; connect ") + "; backdoor")
    }
}

export function autocomplete(data, args) {
    return data.servers;
}
