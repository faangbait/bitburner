import { NS } from "Bitburner";
import { attemptContract } from "modules/contracts/ContractsFunctions";
import { ServerCache } from "modules/servers/ServerCache";
export const main = async (ns: NS) => {
    let servers = ServerCache.all(ns);

    let server_names = Array.from(servers.values()).map(s => s.hostname).filter(host => ns.ls(host, ".cct").length > 0);

    for (const server of server_names) {
        for (const contractName of ns.ls(server, ".cct")) {
            let contractData = ns.codingcontract.getData(contractName, server);
            let contractType = ns.codingcontract.getData(contractName, server);

            let solution: any;
            try {
                solution = attemptContract(contractType, contractData);
            } catch {}

            if (solution) {
                let attempt = ns.codingcontract.attempt(solution, contractName, server, { returnReward: true })
                if (attempt) {
                    ns.tprint(`${contractType}: ${attempt}`)
                } else { ns.tprint(`${contractType}: ${attempt}`)}
            }
        }
    }
    
}
