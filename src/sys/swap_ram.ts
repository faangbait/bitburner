import { NS } from "Bitburner";
import { PORTS } from "lib/Database";

export async function main(ns: NS) {
    while (true) {
        let comms: string = ns.readPort(PORTS.swap);
    
        switch (comms) {
            case "NULL PORT DATA":
                await ns.share();
                break;
            default:
            try {
                let command = JSON.parse(comms);
                if (command.home_required) {
                    ns.spawn(command.file, command.threads, ...command.args)
                } else {
                    // TODO: Find server with free RAM
                }
            } catch {
                ns.tprint(`Error parsing JSON on port ${PORTS.swap}, received: ${comms}`)
            }
        }
    }
}
