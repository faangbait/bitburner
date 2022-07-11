import {NS} from "Bitburner";
import { TermLogger } from "lib/Helpers";

export const Corps = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("Corporations Disabled")
    },

    async loop(ns: NS) {}
}

