/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {boolean} softreset if true, resets without augs. default installs augs.
 *
 * @export
 * @param {ns} ns
 */


import { NS } from "Bitburner";
import { TermLogger } from "lib/Logger";
import { CORE_RUNTIMES } from "lib/Variables";

export async function main(ns: NS) {
    let args = ns.args;
    let logger = new TermLogger(ns);

    let soft = args[0];

    if (typeof soft !== "boolean" ) { soft = false }

    // TODO: Purchase Augmentations

    try {
        if (!soft) {
            ns.singularity.installAugmentations(CORE_RUNTIMES.LAUNCHER)
        } else {
            ns.singularity.softReset(CORE_RUNTIMES.LAUNCHER)
        }
    } catch {
        if (!soft) {
            logger.err(`Ready to install augmentations.`)
        } else {
            logger.err(`Ready for soft reset.`)
        }
    }
}
