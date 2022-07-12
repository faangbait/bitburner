import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import PrettyTable from "lib/PrettyTable";
import { BIN_FILES } from "lib/Variables";
import { DeploymentBundle, BatchFile, PlayerObject, ServerObject } from "Phoenix";

/**
 * Default strategy algorithm.
 * 
 * NOTE: When overloading, only overload methods ((WITHOUT)) underscores in front of their name.
 * The __methodname designation indicates that it is a core method and shouldn't be touched.
 */
export default class HackDefault {
    logger: TermLogger;
    files: BatchFile[];

    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        this.logger = new TermLogger(ns);

        this.files = [
            {
                job: "hack",
                filename: BIN_FILES.BASIC_HACK.toString(),
                ram: 1.7,
            },
            {
                job: "grow",
                filename: BIN_FILES.BASIC_GROW.toString(),
                ram: 1.75,
            },
            {
                job: "weaken",
                filename: BIN_FILES.BASIC_WEAK.toString(),
                ram: 1.75,
            }
        ]
    }

    /**
     * Disqualifies some (legal) servers from being considered as attackers.
     * Default: Disqualify no (legal) attackers.
    */
     disqualify_source(ns: NS, s: ServerObject): boolean {
        return false;
    }

    /**
     * Disqualifies some (legal) servers from being considered as targets.
     * Default: Disqualify no (legal) targets.
     */
    disqualify_target(ns: NS, s: ServerObject): boolean {
        return false;
    }

    /**
     * Anything that needs to happen prior to starting a hack.
     */
    prepare_attacker(ns: NS, a: ServerObject): ServerObject {
        return a
    }

    prepare_targets(ns: NS, t: ServerObject): ServerObject {
        return t
    }

    /**
     * 
     */
    generate_target_matrix(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let required_threads: Map<string, {h_threads: number, g_threads: number, w_threads: number}> = new Map();

        for (const t of targets) {
            let thread_batch = {
                h_threads: 0,
                g_threads: 0,
                w_threads: 0
            }

            if (t.money.available / t.money.max > .9 && t.security.level <= t.security.min + 1) {
                thread_batch.h_threads = Math.ceil(ns.hackAnalyzeThreads(t.id, t.money.available * .05))
            }

            if (t.money.available / t.money.max <= .9 && t.security.level <= t.security.min + 1) {
                thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, (t.money.max / Math.max(t.money.available,1))))
            }

            if (t.security.level > t.security.min) {
                thread_batch.w_threads = Math.ceil((t.security.level - t.security.min) / .05)
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

        targeted_servers.sort(([a_id, a_threads],[b_id, b_threads]) => (a_threads.g_threads + a_threads.h_threads + a_threads.w_threads) - (b_threads.g_threads + b_threads.h_threads + b_threads.w_threads));
        
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

    deploy_package(ns: NS, bundle: DeploymentBundle): number {
        return ns.exec(bundle.file, bundle.attacker, bundle.threads, ...bundle.args)
    }

    iterate(
        ns: NS,
        servers: ServerObject[],
        legal_attackers: ServerObject[],
        legal_targets: ServerObject[],
        prepared_attackers: ServerObject[],
        prepared_targets: ServerObject[],
        bundles: DeploymentBundle[],
        pids: number[]) {

        ns.clearLog();
        let pt = new PrettyTable();
        var headers = ["TARGET", "CASH", "SEC", "H_TIME", "HACK", "GROW", "WEAK"];
        var rows = prepared_targets.map(s => [
            s.id,
            `${ns.nFormat(s.money.available, "0a")}/${ns.nFormat(s.money.max, "0a")}`,
            `${ns.nFormat(Math.max(0, s.security.level), "0.0")}/${ns.nFormat(Math.max(0, s.security.min), "0.0")}`,
            `${ns.nFormat(s.hackTime / 1000, '0a')}`,
            `${ns.nFormat(Math.ceil(ns.hackAnalyzeThreads(s.id, (s.money.max * .05))), '0a')}`,
            `${ns.nFormat(Math.ceil(ns.growthAnalyze(s.id, s.money.max / Math.max(1,s.money.available))), '0a')}`,
            `${ns.nFormat(Math.ceil((0.002 + s.security.level - s.security.min) / .05), '0a')}`
        ]);
        pt.create(headers, rows);
        ns.print(pt.print());

        ns.print(`Bundles: ${bundles.length}`)
    }

    /**
     * Begin Core Methods - Don't overload below this line.
     */


     __get_attackers(ns: NS, servers: ServerObject[]): ServerObject[] {
        return servers.filter(s => s.isAttacker && (!this.disqualify_source(ns, s)));
    }

    __get_targets(ns: NS, servers: ServerObject[]): ServerObject[] {
        return servers.filter(t => t.isTarget && (!this.disqualify_target(ns, t)))
    }

    __prepare_attackers(ns: NS, attackers: ServerObject[]): ServerObject[] {
        return attackers.map(a => this.prepare_attacker(ns, a))
    }

    __prepare_target(ns: NS, targets: ServerObject[]): ServerObject[] {
        return targets.map(t => this.prepare_targets(ns, t))
    }
    
    __package(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        return this.generate_target_matrix(ns, attackers, targets)
    }

    __deploy(ns: NS, bundles: DeploymentBundle[]): number[] {
        return bundles.map(b => this.deploy_package(ns, b))
    }

    __iterate(ns: NS, results: {
        servers: ServerObject[],
        legal_attackers: ServerObject[],
        legal_targets: ServerObject[],
        prepared_attackers: ServerObject[],
        prepared_targets: ServerObject[],
        bundles: DeploymentBundle[],
        pids: number[]
    }) {
        return this.iterate(
            ns,
            results.servers,
            results.legal_attackers,
            results.legal_targets, 
            results.prepared_attackers, 
            results.prepared_targets, 
            results.bundles, 
            results.pids
            )
    }

}
