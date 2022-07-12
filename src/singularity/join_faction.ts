/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} name the faction name
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";

export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    if (typeof (args[0]) === "string") {
        try {
            ns.singularity.joinFaction(args[0]);
        } catch {
            logger.err(`REQUIRED FACTION JOIN: ${args[0]}`)
        }
    }
}
