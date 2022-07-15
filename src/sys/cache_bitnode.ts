/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {number} current_bitnode
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { BitnodeInfo } from "modules/bitnodes/Bitnodes";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";

export const main = async (ns: NS) => {
    const bitnodes = BitnodeInfo.all(ns);
    for (const bn of bitnodes.values()) {
        await BitNodeCache.update(ns, bn);
    }
    
    let args = ns.args;
    let current_bitnode = args[0];
    if (typeof current_bitnode !== "number" ) { return }
    
    let current = BitnodeInfo.current(ns, current_bitnode);
    if (current) { await BitNodeCache.update(ns, current) }
}
