import {NS} from "Bitburner";
import { TermLogger } from "lib/Helpers";

export const Factions = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("Factions Disabled")
    },

    async loop(ns: NS) {}
}

