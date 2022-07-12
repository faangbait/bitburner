/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {number} next_bitnode 
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { SYS_FILES } from "lib/Variables";

export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    let next_bitnode = args[0];

    if (typeof next_bitnode !== "number") { return }

        try {
            ns.singularity.destroyW0r1dD43m0n(next_bitnode, SYS_FILES.LAUNCHER)
        } catch {
            logger.err(`Ready to destroy world daemon and restart in bitnode ${next_bitnode}`)
        }
}
