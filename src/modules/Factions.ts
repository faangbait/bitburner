import {NS} from "Bitburner";
import { PlayerObject, ServerObject } from "Phoenix";
import { TermLogger } from "lib/Helpers";
import { PInfo } from "lib/Players";
import { SInfo } from "lib/Servers";

export const Factions = {
    async init(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);
        logger.log("Factions Enabled")
    },

    async loop(ns: NS) {
        let servers = SInfo.all(ns);
        let player = PInfo.detail(ns);
        const logger = new TermLogger(ns);
    }
}

