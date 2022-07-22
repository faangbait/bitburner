/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} name the faction name
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";

export async function main(ns: NS) {
    let args = ns.args;

    let faction_name = args[0];

    if (typeof faction_name !== "string") { return }

    try {
        ns.singularity.joinFaction(faction_name);
    } catch {
        ns.tprint(`REQUIRED FACTION JOIN: ${faction_name}`)
    }
}
