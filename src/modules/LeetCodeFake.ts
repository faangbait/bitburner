import {NS} from "Bitburner";
import { TermLogger } from "lib/Helpers";

export const LeetCode = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("LeetCode Disabled")
    },

    async loop(ns: NS) {}
}

