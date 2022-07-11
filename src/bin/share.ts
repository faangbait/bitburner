/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} target does nothing, here for compatibility
 * @argument {boolean} loop defaults true
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { check_control_sequence } from "lib/Database";

export const main = async (ns: NS) => {
    let args = ns.args;
    do {
        await check_control_sequence(ns);
        await ns.share();
    } while (!args[1]);
}

