/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} city the destination city
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";

export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    try {
        if (typeof (args[0]) === "string") {
            ns.singularity.travelToCity(args[0]);
        }
    } catch {
        logger.err(`REQUIRED TRAVEL: ${args[0]}`)
    }

}
