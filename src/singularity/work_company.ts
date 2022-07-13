/**
 * @typedef {import(".").NS} ns
 * 
 * @argument {string} name company name
 * @argument {boolean} focus defaults true
 * 
 * @export
 * @param {ns} ns
 */

import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";

export async function main(ns: NS) {
    let logger = new TermLogger(ns);
    let args = ns.args;

    let name = args[0];
    let focus = args[1];

    if (typeof (name) !== "string") { name = "" }
    if (typeof (focus) !== "boolean") { focus = true }

    ns.singularity.workForCompany(name, focus)
}
