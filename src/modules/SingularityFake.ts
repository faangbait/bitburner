import {NS} from "Bitburner";
import { TermLogger } from "lib/Helpers";

export const Singularity = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("Singularity Disabled")
    },

    async loop(ns: NS) {}
}

