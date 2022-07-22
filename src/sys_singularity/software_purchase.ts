import { NS } from "Bitburner";
import { Sing } from "modules/Singularity";

export async function main(ns: NS) {
    if (!Sing.has_access(ns)) { return }
    let args = ns.args;
    let name = args[0];

    if (typeof name !== "string") { return }
    ns.singularity.purchaseTor();
    ns.singularity.purchaseProgram(name);
    
}
