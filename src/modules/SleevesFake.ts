import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";

export const Sleeves = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("Sleeves Disabled")
    },

    async loop(ns: NS) { }
}

