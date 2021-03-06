/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {number} next_bitnode 
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { CORE_RUNTIMES, TEMP_F } from "lib/Variables";

export async function main(ns: NS) {
    let args = ns.args;

    let next_bitnode = args[0];

    if (typeof next_bitnode !== "number") { return }
    await ns.write(TEMP_F.CURRENT_BITNODE, next_bitnode)
    
        try {
            ns.singularity.destroyW0r1dD43m0n(next_bitnode, CORE_RUNTIMES.LAUNCHER)
        } catch {
            ns.tprint(`Ready to destroy world daemon and restart in bitnode ${next_bitnode}`)
        }
}
