import { NS } from "Bitburner";
import { BitnodeInfo } from "modules/bitnodes/Bitnodes";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";

export const main = async (ns: NS) => {
    for (const bn of BitnodeInfo.all(ns)) {
        await BitNodeCache.update(ns, bn);
    }
}
