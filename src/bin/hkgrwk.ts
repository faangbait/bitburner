/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} target
 * @argument {boolean} loop defaults true
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { ServerCache, check_control_sequence } from "lib/Database";

export const main = async (ns: NS) => {
    ns.disableLog("ALL");
    ns.enableLog("hack");
    ns.enableLog("grow");
    ns.enableLog("weaken");

    let args = ns.args;
    if (typeof args[0] == "string") {
        let target_host = args[0];
        do {
            await check_control_sequence(ns);
            let target = ServerCache.read(ns, target_host);
            if (!target) {
                await ns.sleep(100)
            } else {
                let sec = target.security.level;
                let minsec = target.security.min;
                let money = target.money.available;
                let maxMoney = target.money.max;

                if (sec > minsec + 5) {
                    await ns.weaken(target.id);
                } else if (money < 0.75 * maxMoney) {
                    await ns.grow(target.id);
                } else { await ns.hack(target.id); }
            }

        } while (!ns.args[1]);
    }
}
