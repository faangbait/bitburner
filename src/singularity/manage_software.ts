import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";

export async function main(ns: NS) {
    let logger = new TermLogger(ns);

    for (const file in [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe"
    ]) {
        if (!ns.fileExists(file)) {
            try {
                ns.singularity.purchaseTor();
                ns.singularity.purchaseProgram(file);
            } catch {
                logger.err(`REQUIRED SOFTWARE PURCHASE: ${file}`)
                return
            }
        }
    }
}
