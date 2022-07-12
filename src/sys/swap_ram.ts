import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { PORTS } from "lib/Variables";
import { HomeExec } from "Phoenix";

export async function main(ns: NS) {
    let logger = new TermLogger(ns);
    while (true) {
        let comms: HomeExec | string = JSON.parse(ns.readPort(PORTS.swap));
    
        switch (comms) {
            case "NULL PORT DATA":
                await ns.share();
            default:
                if (typeof(comms) === "string") {
                    logger.err(`Invalid communication on Swap port (${PORTS.swap}): ${comms}`) 
                } else {
                    if (comms.home_required) {
                        ns.spawn(comms.file, comms.threads, ...comms.args)
                    } else {
                        // TODO: Find server with free RAM
                    }
                }
        }
    }
}
