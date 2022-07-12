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

    let faction_name = args[0];

    if (typeof faction_name !== "string") { return }

    try {
        ns.singularity.joinFaction(faction_name);
    } catch {
        logger.err(`REQUIRED FACTION JOIN: ${faction_name}`)
    }
}
