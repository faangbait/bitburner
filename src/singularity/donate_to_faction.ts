/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} name the faction name
 * @argument {number} amount the donation amount
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";

export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    let name = args[0];
    let amount = args[1];

    if (typeof name !== "string") { return }
    if (typeof amount !== "number") { return }

    try {
        ns.singularity.donateToFaction(name, amount);
    } catch {
        logger.err(`REQUIRED FACTION DONATION: ${name} - ${amount}`)
    }
}
