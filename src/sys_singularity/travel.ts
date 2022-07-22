/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} city the destination city
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";

export async function main(ns: NS) {
    let args = ns.args;

    let city = args[0];
    if (typeof (city) !== "string") { return }

    try {
        ns.singularity.travelToCity(city);
    } catch {
        ns.tprint(`REQUIRED TRAVEL: ${city}`)
    }

}
