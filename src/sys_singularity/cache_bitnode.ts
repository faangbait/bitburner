import { NS } from "Bitburner";
import { BitnodeInfo } from "modules/bitnodes/Bitnodes";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
import { Sing } from "modules/Singularity";

export const main = async (ns: NS) => {
    if (!Sing.has_access(ns)) { return }

    for (const bn of BitnodeInfo.all(ns)) {
        await BitNodeCache.update(ns, bn);
    }
}
