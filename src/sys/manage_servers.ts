/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} command buy or sell
 * @argument {string} hostname hostname of the server
 * @argument {number} size size in GB
 *
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";

export async function main(ns: NS) {
    let args = ns.args;

    let command = args[0];
    let hostname = args[1];
    let size = args[2];

    if (typeof (command) === "string") {
        if (typeof (hostname) === "string") {
            if (command === "buy") {
                if (typeof (size) === "number") {
                    ns.tprint(`Purchased server ${ns.purchaseServer(hostname, size)} of size ${size}`)
                } else { ns.tprint("Can't buy server - size not found") }
            } else if (command === "sell") {
                if (ns.deleteServer(hostname)) { ns.tprint(`Deleted server ${hostname}`) }
            }
        } else { ns.tprint("Can't buy/sell server - invalid hostname") }
    }
}
