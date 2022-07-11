/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} target
 * @argument {boolean} runonce defaults false
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { check_control_sequence } from "lib/Database";
import { TermLogger } from "lib/Helpers";

export const main = async (ns: NS) => {
    ns.disableLog("ALL");
    ns.enableLog("hack");
    ns.enableLog("grow");
    ns.enableLog("weaken");

    let args = ns.args;
    let logger = new TermLogger(ns);

    if (typeof args[0] == "string") {
        let target = args[0];
        do {
            await check_control_sequence(ns);
            await ns.hack(target);
        } while (!args[1]);
    } else {
        logger.err("Invalid arguments")
    }
}
