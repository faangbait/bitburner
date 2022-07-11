import { NS } from "Bitburner";
import { SInfo } from "lib/Servers";
import { BIN_FILES } from "lib/Variables";
import HackDefault from "logic/HackDefault";
import { DeploymentBundle, PlayerObject, ServerObject } from "Phoenix";

export default class HackSupportStocks extends HackDefault {
    symbols: Map<string, string>;
    
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);

        this.symbols = new Map([
            ["ecorp", "ECP"],
            ["megacorp", "MGCP"],
            ["blade", "BLD"],
            ["clarkinc", "CLRK"],
            ["omnitek", "OMTK"],
            ["4sigma", "FSIG"],
            ["kuai-gong", "KGI"],
            ["fulcrumtech", "FLCM"],
            ["stormtech", "STM"],
            ["defcomm", "DCOMM"],
            ["helios", "HLS"],
            ["vitalife", "VITA"],
            ["icarus", "ICRS"],
            ["univ-energy", "UNV"],
            ["aerocorp", "AERO"],
            ["omnia", "OMN"],
            ["solaris", "SLRS"],
            ["global-pharm", "GPH"],
            ["nova-med", "NVMD"],
            ["lexocorp", "LXO"],
            ["rho-construction", "RHOC"],
            ["alpha-ent", "APHE"],
            ["syscore", "SYSC"],
            ["computek", "CTK"],
            ["netlink", "NTLK"],
            ["omega-net", "OMGA"],
            ["foodnstuff", "FNS"],
            ["joesguns", "JGN"],
            ["sigma-cosmetics", "SGC"],
            ["catalyst", "CTYS"],
            ["microdyne", "MDYN"],
            ["titan-labs", "TITN"],
        ])
    }

    get_position(ns: NS, s: ServerObject): [number, number, number, number] | undefined {
        let ticker = this.symbols.get(s.hostname);
        if (ticker) {
            let positions: {
                "ECP": [number, number, number, number],
                "MGCP": [number, number, number, number],
                "BLD": [number, number, number, number],
                "CLRK": [number, number, number, number],
                "OMTK": [number, number, number, number],
                "FSIG": [number, number, number, number],
                "KGI": [number, number, number, number],
                "FLCM": [number, number, number, number],
                "STM": [number, number, number, number],
                "DCOMM": [number, number, number, number],
                "HLS": [number, number, number, number],
                "VITA": [number, number, number, number],
                "ICRS": [number, number, number, number],
                "UNV": [number, number, number, number],
                "AERO": [number, number, number, number],
                "OMN": [number, number, number, number],
                "SLRS": [number, number, number, number],
                "GPH": [number, number, number, number],
                "NVMD": [number, number, number, number],
                "LXO": [number, number, number, number],
                "RHOC": [number, number, number, number],
                "APHE": [number, number, number, number],
                "SYSC": [number, number, number, number],
                "CTK": [number, number, number, number],
                "NTLK": [number, number, number, number],
                "OMGA": [number, number, number, number],
                "FNS": [number, number, number, number],
                "JGN": [number, number, number, number],
                "SGC": [number, number, number, number],
                "CTYS": [number, number, number, number],
                "MDYN": [number, number, number, number],
                "TITN": [number, number, number, number]
            } = JSON.parse(ns.read("/Temp/stock-getPosition.txt"))

            return positions[ticker];
        } else { return undefined }
    }

    get_long(ns: NS, s: ServerObject): boolean {
        let position = this.get_position(ns, s);
        if (position) {
            return position[0] > 0
        }
        
        return false
    }

    get_short(ns: NS, s: ServerObject): boolean {
        let position = this.get_position(ns, s);
        if (position) {
            return position[2] > 0
        }
        return false
    }

    disqualify_target(ns: NS, s: ServerObject): boolean {
        let position = this.get_position(ns, s);
        if (position) {
            return !position.some(p => p > 0)
        }
        return true
    }

    generate_target_matrix(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let required_threads: Map<string, {h_threads: number, g_threads: number, w_threads: number}> = new Map();

        if (targets.length === 0) {
            let file = {
                job: "weaken",
                filename: BIN_FILES.BASIC_WEAK.toString(),
                ram: 1.75
            }

            for (const a of attackers) {
                let threads = a.threadCount(file.ram)
                if (threads > 0) {
                    bundles.push({
                        file: file.filename,
                        attacker: a.id,
                        threads: threads,
                        args: ["n00dles", a.isHome]
                    });
                }
            }
        } else {
            SInfo.detail(ns, "n00dles").targeted_by.forEach(proc => ns.kill(proc.pid))
        }

        for (const t of targets) {
            let thread_batch = {
                h_threads: 0,
                g_threads: 0,
                w_threads: 0
            }

            if (t.security.level > t.security.min) {
                thread_batch.w_threads = Math.ceil((t.security.level - t.security.min) / .05)
            }

            if (this.get_long(ns, t)) {
                thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, (t.money.max / t.money.available)))
            }
            
            if (this.get_short(ns, t)) {
                thread_batch.h_threads = Math.ceil(ns.hackAnalyzeThreads(t.id, t.money.available))
            }

            if (
                thread_batch.h_threads > 0 ||
                thread_batch.g_threads > 0 ||
                thread_batch.w_threads > 0
            ) {
                required_threads.set(t.id, thread_batch)
            }

        }

        let targeted_servers = Array.from(required_threads.entries())

        targeted_servers.sort(([a_id, a_threads],[b_id, b_threads]) => (a_threads.g_threads + a_threads.h_threads) - (b_threads.g_threads + b_threads.h_threads));

        for (const [t_id, thread_batch] of targeted_servers) {
            for (const a of attackers) {
                let assigned_ram = 0;
                for (const file of this.files) {
                    switch (file.job) {
                        case "hack":
                            if (thread_batch.h_threads > 0) {
                                let threads = Math.min(a.threadCount(file.ram), thread_batch.h_threads);
                                if (threads > 0) {
                                    bundles.push({
                                        file: file.filename,
                                        attacker: a.id,
                                        threads: threads,
                                        args: [t_id, true]
                                    })

                                    assigned_ram += threads * file.ram
                                }

                            }
                            break;
                        case "grow":
                            if (thread_batch.g_threads > 0) {
                                let threads = Math.min(a.threadCount(file.ram), thread_batch.g_threads);
                                if (threads > 0) {
                                    bundles.push({
                                        file: file.filename,
                                        attacker: a.id,
                                        threads: threads,
                                        args: [t_id, true]
                                    })
                                    
                                    assigned_ram += threads * file.ram
                                }
                            }
                            break;
                        case "weaken":
                            if (thread_batch.w_threads > 0) {
                                let threads = Math.min(a.threadCount(file.ram), thread_batch.w_threads);
                                if (threads > 0) {
                                    bundles.push({
                                        file: file.filename,
                                        attacker: a.id,
                                        threads: threads,
                                        args: [t_id, true]
                                    })
                                    assigned_ram += threads * file.ram
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        return bundles;
    }
}
