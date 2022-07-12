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
    if (typeof(args[0]) === "number") {
        try {
            ns.singularity.destroyW0r1dD43m0n(args[0], SYS_FILES.LAUNCHER)
        } catch {
            logger.err(`Ready to destroy world daemon and restart in bitnode ${args[0]}`)
        }
    }
}
