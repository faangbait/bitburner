import { NS } from "Bitburner";

export const main = async (ns: NS) => {
    let args = ns.args;
    let name = args[0];
    let field = args[1];

    if (typeof name !== "string") { return }
    if (typeof field !== "string") { return }
    ns.singularity.applyToCompany(name, field)
}
