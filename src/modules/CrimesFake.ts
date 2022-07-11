import {NS} from "Bitburner";
import { TermLogger } from "lib/Helpers";

export const Crimes = {
    async init(ns: NS) {

        const logger = new TermLogger(ns);
        logger.log("Crimes Disabled")
    },

    async loop(ns: NS) {}
}

