/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} target
 * @argument {number} time in millis
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { check_control_sequence } from "lib/Database";

const RUNTIME_MOD = 3.2;

export const main = async (ns: NS) => {
    let args = ns.args;

    let target = args[0];
    let nextlaunchdate = args[1];

    if (typeof target !== "string") { return }
    if (typeof nextlaunchdate !== "number") { return }

    let hackTime = ns.getHackTime(target);
    let runtime = hackTime * RUNTIME_MOD;
    let looptime = Math.max(hackTime * 4, 40);

    while (true) {
        await check_control_sequence(ns);
        let curtime = new Date().valueOf();
        let sleeptime = nextlaunchdate - curtime - runtime;
        await ns.sleep(sleeptime);
        await ns.grow(target);
        nextlaunchdate += looptime;
        ns.tprint(`Grow finished against ${target} at ${new Date().getSeconds()}.${new Date().getMilliseconds()}`)
    }
}
