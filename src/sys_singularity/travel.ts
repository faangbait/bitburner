/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} city the destination city
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";
import { TermLogger } from "lib/Logger";

export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    let city = args[0];
    if (typeof (city) !== "string") { return }

    try {
        ns.singularity.travelToCity(city);
    } catch {
        logger.err(`REQUIRED TRAVEL: ${city}`)
    }

}
