/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} name faction name
 * @argument {string} type work type
 * @argument {boolean} focus defaults true
 * 
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";

export async function main(ns: NS) {
    let args = ns.args;

    let name = args[0];
    let type = args[1];
    let focus = args[2];

    if (typeof (name) !== "string") { return }
    if (typeof (type) !== "string") { type = "Hacking Contract" }
    if (typeof (focus) !== "boolean") { focus = true }

    ns.singularity.workForFaction(name, type, focus);
}
