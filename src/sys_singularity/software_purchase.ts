import { NS } from "Bitburner";
import { Sing } from "modules/Singularity";

export async function main(ns: NS) {
    if (!Sing.has_access(ns)) { return }
    
    ns.singularity.purchaseTor();

    for (const file in [
        "brutessh.exe",
        "ftpcrack.exe",
        "relaysmtp.exe",
        "httpworm.exe",
        "sqlinject.exe"
    ]) {
        ns.singularity.purchaseProgram(file);
    }
}
