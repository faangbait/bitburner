import { NS } from "Bitburner";
import { DeploymentBundle, PlayerObject, ServerObject } from "Phoenix";
import HackDefault from "logic/HackDefault";
import { PInfo } from "lib/Players";
import { BIN_FILES } from "lib/Variables";

export default class HackHWGW extends HackDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.files = [
            {
                job: "hack",
                filename: BIN_FILES.FUTURE_HACK.toString(),
                ram: 1.75,
            },
            {
                job: "grow",
                filename: BIN_FILES.FUTURE_GROW.toString(),
                ram: 1.8,
            },
            {
                job: "weaken",
                filename: BIN_FILES.FUTURE_WEAK.toString(),
                ram: 1.8,
            }
        ]
    }

    generate_target_matrix(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let percentage_hacked = 0.05;
        let spacing = 40;

        let required_threads: Map<string, {
            h_threads: number,
            g_threads: number,
            w1_threads: number,
            w2_threads: number,
            hack_time: number,
            grow_time: number,
            weaken_time: number,
        }> = new Map();

        let assigned_ram: Map<string, number> = new Map();

        for (const a of attackers) {
            assigned_ram.set(a.id, a.ram.free);
        }

        for (const t of targets) {
            let thread_batch = {
                h_threads: 0,
                g_threads: 0,
                w1_threads: 0,
                w2_threads: 0,
                hack_time: t.hackTime,
                grow_time: t.hackTime * 3.2,
                weaken_time: t.hackTime * 4,
            }

            if (t.money.max > t.money.available || t.security.level > t.security.min) {
                thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, t.money.max / (t.money.available)))
                thread_batch.w1_threads = Math.ceil((0.002 + t.security.level - t.security.min) / .05)
                thread_batch.w2_threads = Math.ceil((thread_batch.g_threads * .004) / .05)
            } else {
                thread_batch.h_threads = Math.ceil(ns.hackAnalyzeThreads(t.id, (t.money.max * percentage_hacked)));
                thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, 1 / percentage_hacked))
                thread_batch.w1_threads = Math.ceil((thread_batch.h_threads * .002) / .05);
                thread_batch.w2_threads = Math.ceil((thread_batch.g_threads * .004) / .05);
            }

            if (
                thread_batch.h_threads > 0 ||
                thread_batch.g_threads > 0 ||
                thread_batch.w1_threads > 0 ||
                thread_batch.w2_threads > 0
            ) {
                required_threads.set(t.id, thread_batch)
            }
            
        }

        let targeted_servers = Array.from(required_threads.entries())
        targeted_servers.sort(([a_id, a_threads],[b_id, b_threads]) => (a_threads.g_threads + a_threads.h_threads + a_threads.w1_threads + a_threads.w2_threads) - (b_threads.g_threads + b_threads.h_threads + b_threads.w1_threads + b_threads.w2_threads));
        
        for (const [t_id, thread_batch] of targeted_servers) {
            let suggested_bundles: DeploymentBundle[] = [];
            let nextlaunchdate = new Date().valueOf() + Math.max(2000, Math.ceil(thread_batch.weaken_time))
            for (const a of attackers) {
                let a_threads = {
                    w1: 0,
                    w2: 0,
                    g: 0,
                    h: 0
                }

                for (const file of this.files) {
                    let used_ram = assigned_ram.get(a.id)
                    if (used_ram && used_ram < a.ram.free) {
                        let available_threads = Math.floor((a.ram.free - used_ram) / file.ram);
                        if (available_threads === 0) { continue; }

                        switch (file.job) {
                            case "hack":
                                if (
                                    thread_batch.h_threads > 0 &&
                                    available_threads >= thread_batch.h_threads
                                    ) {
                                        a_threads.h = Math.min(available_threads, thread_batch.h_threads);
                                        thread_batch.h_threads = 0;
                                        suggested_bundles.push({
                                            file: file.filename,
                                            attacker: a.id,
                                            threads: a_threads.h,
                                            args: [t_id, nextlaunchdate]
                                        })
                                        assigned_ram.set(a.id, used_ram + a_threads.h * file.ram )
                                    }
                                break;
                            case "grow":
                                if (
                                    thread_batch.g_threads > 0 &&
                                    available_threads >= thread_batch.g_threads
                                    ) {
                                        a_threads.g = Math.min(available_threads, thread_batch.g_threads);
                                        thread_batch.g_threads = 0;
                                        suggested_bundles.push({
                                            file: file.filename,
                                            attacker: a.id,
                                            threads: a_threads.g,
                                            args: [t_id, nextlaunchdate + (spacing * 2)]
                                        })
                                        assigned_ram.set(a.id, used_ram + a_threads.g * file.ram )
                                    }
                                break;
                            case "weaken":
                                    if (thread_batch.w1_threads > 0) {
                                        if (available_threads >= thread_batch.w1_threads) {
                                            a_threads.w1 = Math.min(available_threads, thread_batch.w1_threads);
                                            thread_batch.w1_threads -= a_threads.w1;
                                            suggested_bundles.push({
                                                file: file.filename,
                                                attacker: a.id,
                                                threads: a_threads.w1,
                                                args: [t_id, nextlaunchdate + spacing]
                                            })
                                            assigned_ram.set(a.id, used_ram + a_threads.w1 * file.ram )
                                        }
                                    }

                                    available_threads -= a_threads.w1;

                                    if (thread_batch.w2_threads > 0) {
                                        if (available_threads >= thread_batch.w2_threads) {
                                            a_threads.w2 = Math.min(available_threads, thread_batch.w2_threads);
                                            thread_batch.w2_threads -= a_threads.w2;
                                            suggested_bundles.push({
                                                file: file.filename,
                                                attacker: a.id,
                                                threads: a_threads.w2,
                                                args: [t_id, nextlaunchdate + (spacing * 3)]
                                            })
                                            assigned_ram.set(a.id, used_ram + a_threads.w2 * file.ram )
                                        }
                                    }
                                break;
                            default:
                                continue;
                        }
                    }
                }
            }

            let sanity_check = required_threads.get(t_id);
            if (sanity_check) {
                let sanity_threads = sanity_check.h_threads + sanity_check.g_threads + sanity_check.w1_threads + sanity_check.w2_threads
                if (suggested_bundles.reduce((acc,cur) => acc + cur.threads,0) == sanity_threads) {
                    bundles.push(...suggested_bundles)
                } else {
                    for (const bundle of suggested_bundles) {
                        let ram = assigned_ram.get(bundle.attacker);
                        if (ram) { assigned_ram.set(bundle.attacker, ram + (bundle.threads * 1.75)) }
                    }
                }
            }


        }
        return bundles
    }
}
