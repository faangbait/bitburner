import { NS } from "Bitburner";
import { CONTROL_SEQUENCES, PORTS } from "lib/Database";
import { TermLogger } from "lib/Logger";
import PrettyTable from "lib/PrettyTable";
import { ReservedRam } from "lib/Swap";
import { BIN_SCRIPTS, SINGULARITY_SCRIPTS, SYS_SCRIPTS } from "lib/Variables";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerInfo } from "modules/servers/Servers";

export default class DaemonDefault {
    bn: import("/home/ss/dev/bitburner/src/modules/bitnodes/BitnodeEnums").Bitnode;
    logger: TermLogger;

    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        this.bn = BitNodeCache.read(ns, 'current')
        this.logger = new TermLogger(ns);
    }

    active_control_sequence(ns: NS, servers: ServerObject[], player: PlayerObject): CONTROL_SEQUENCES | null {
        if (player.ports < 5) {
            if (["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].map(s =>
                ServerInfo.detail(ns, s)).filter(s =>
                    player.ports < s.ports.required &&
                    player.hacking.level >= s.level
                ).length > 0) { return CONTROL_SEQUENCES.LIQUIDATE_CAPITAL }
        }

        return null
    }

    disqualify_attacker(ns: NS, a: ServerObject): boolean {
        return false
    }

    disqualify_target(ns: NS, t: ServerObject): boolean {
        return false
    }

    prepare_attacker(ns: NS, a: ServerObject): ServerObject {
        return a
    }

    prepare_target(ns: NS, t: ServerObject): ServerObject {
        return t
    }

    select_hack_algorithm(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject) {
        return this.__hack_default(ns, attackers, targets, player);
    }


    __template(ns: NS): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);
        return bundles
    }

    __buy_ports(ns: NS): DeploymentBundle[] {
        let player = PlayerInfo.detail(ns);
        let bundles: DeploymentBundle[] = [];
        if (player.ports < 5) {
            let target = {
                0: 700000,
                1: 1500000,
                2: 5000000,
                3: 30000000,
                4: 250000000
            };
            if (player.money > target[player.ports]) {
                bundles.push({
                    file: SINGULARITY_SCRIPTS.MANAGE_SOFTWARE,
                    attacker: "home",
                    threads: 1,
                    args: [],
                    priority: 0,
                });
            }
        }
        return bundles
    }

    __hacknet(ns: NS): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);
        bundles.push(
            {
                file: SYS_SCRIPTS.HACKNET,
                attacker: "home",
                threads: 1,
                args: [],
                priority: 9
            }
        )
        return bundles
    }

    __market(ns: NS): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        switch (ns.peek(PORTS.control)) {
            case CONTROL_SEQUENCES.LIQUIDATE_CAPITAL:
                bundles.push({
                    file: SYS_SCRIPTS.MARKET,
                    attacker: "home",
                    threads: 1,
                    args: ["-l"],
                    priority: -99
                })
                break;
            default:
                bundles.push({
                    file: SYS_SCRIPTS.MARKET,
                    attacker: "home",
                    threads: 1,
                    args: [],
                    priority: 0
                })
                break;
        }
        return bundles
    }

    __purchase_servers(ns: NS, attackers: ServerObject[], max_servers=25, min_size=6): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        const ram = (power: number) => { return Math.pow(2, power) }
        const purchase_cost = (power: number) => { return ram(power) * 55000 }
        const can_afford_server = (power: number) => { return attackers.filter(s => s.isHome)[0].money.available >= purchase_cost(power) }

        let purchased_servers = attackers.filter(s => s.purchased);
        let strongest_server: ServerObject;
        let weakest_server: ServerObject;

        if (purchased_servers.length > 0) {
            strongest_server = purchased_servers.reduce((max, cur) => cur.power > max.power ? cur : max);
            weakest_server = purchased_servers.reduce((min, cur) => cur.power < min.power ? cur : min);
        } else {
            strongest_server = attackers.filter(s => s.isHome)[0]
            weakest_server = attackers.filter(s => s.isHome)[0]
        }
        
        let next_upgrade = Math.max(min_size, strongest_server.power + 1);
    
        // sell servers
        if (purchased_servers.length === max_servers && can_afford_server(next_upgrade) && weakest_server.power < 18) {
            bundles.push({
                file: SYS_SCRIPTS.PURCHASE_SVR,
                attacker: "home",
                threads: 1,
                args: ["sell", weakest_server.hostname]
            })
            purchased_servers.pop() // doesn't matter what we pop, we're about to buy a replacement
        } else { this.logger.info(`Not attempting to sell server: ${purchased_servers.length} < ${max_servers}; ${next_upgrade} cost ${purchase_cost(next_upgrade)}; weakest: ${weakest_server.power}`)}
    
        // buy servers
        if (purchased_servers.length < max_servers && can_afford_server(next_upgrade)) {
            bundles.push({
                file: SYS_SCRIPTS.PURCHASE_SVR,
                attacker: "home",
                threads: 1,
                args: ["buy", "cluster-", ram(next_upgrade)]
            })
        }  else { this.logger.info(`Not attempting to buy server: ${purchased_servers.length} >= ${max_servers}; ${next_upgrade} cost ${purchase_cost(next_upgrade)}; strongest: ${strongest_server.power}`)}
    

    
        return bundles
    }

    __find_job(ns: NS): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        if (!player.work.isWorking) {
            // TODO
        }

        return bundles
    }


    generate_action_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        bundles.push(...this.__buy_ports(ns));
        if (player.level < 10 && ![8].includes(this.bn.number)) { bundles.push(...this.__hacknet(ns)) }
        
        if (player.market.api.tix) { bundles.push(...this.__market(ns)) }

        if (player.ports >= 5 && ![8].includes(this.bn.number)) { 
            bundles.push(...this.__purchase_servers(ns, attackers))
        }

        if (bundles.length > 0) { // shortcircuit hack selection if we have other scripts to start
            return bundles
        }

        return this.select_hack_algorithm(ns, attackers, targets, player);
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
        pids: number[]
    ) {
        ns.clearLog();
        let pt = new PrettyTable();
        var headers = ["TARGET", "CASH", "SEC", "H_TIME", "HACK", "GROW", "WEAK"];
        var rows = prepared_targets.map(s => [
            s.id,
            `${ns.nFormat(s.money.available, "0a")}/${ns.nFormat(s.money.max, "0a")}`,
            `${ns.nFormat(Math.max(0, s.security.level), "0.0")}/${ns.nFormat(Math.max(0, s.security.min), "0.0")}`,
            `${ns.nFormat(s.hackTime / 1000, '0a')}`,
            `${ns.nFormat(Math.ceil(ns.hackAnalyzeThreads(s.id, (s.money.max * .05))), '0a')}`,
            `${ns.nFormat(Math.ceil(ns.growthAnalyze(s.id, s.money.max / Math.max(1, s.money.available))), '0a')}`,
            `${ns.nFormat(Math.ceil((0.002 + s.security.level - s.security.min) / .05), '0a')}`
        ]);
        pt.create(headers, rows);
        ns.print(pt.print());

        ns.print(`Bundles: ${bundles.length}`)

    }

    /**
     * Core methods, no overrides below
     */


    async __send_control_sequences(ns: NS, servers: ServerObject[], player: PlayerObject) {
        let cs = this.active_control_sequence(ns, servers, player);
        ns.clearPort(PORTS.control);
        if (cs) { await ns.writePort(PORTS.control, cs) }
        return cs
    }

    __get_attackers(ns: NS, servers: ServerObject[]) {
        return servers.filter(s => s.isAttacker && !(this.disqualify_attacker(ns, s)))
    }

    __get_targets(ns: NS, servers: ServerObject[]) {
        return servers.filter(s => s.isTarget && !(this.disqualify_target(ns, s)))
    }

    __prepare_attackers(ns: NS, servers: ServerObject[]) {
        return servers.map(s => this.prepare_attacker(ns, s));
    }

    __package(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        return this.generate_action_bundle(ns, attackers, targets)
    }

    __deploy(ns: NS, bundles: DeploymentBundle[]): number[] {
        bundles.sort((a, b) => (a.priority || 10) - (b.priority || 10))
        return bundles.map(b => this.deploy_package(ns, b))
    }

    __iterate(ns: NS, results: {
        servers: ServerObject[],
        legal_attackers: ServerObject[],
        prepared_attackers: ServerObject[],
        legal_targets: ServerObject[],
        prepared_targets: ServerObject[],
        bundles: DeploymentBundle[],
        pids: number[]
    }) {
        return this.iterate(
            ns,
            results.servers,
            results.legal_attackers,
            results.prepared_attackers,
            results.legal_targets,
            results.prepared_targets,
            results.bundles,
            results.pids
        )
    }

    __hack_default(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject) {
        let bundles: DeploymentBundle[] = [];
        let required_threads: Map<string, { h_threads: number, g_threads: number, w_threads: number }> = new Map();

        let files = [
            {
                job: "hack",
                filename: BIN_SCRIPTS.BASIC_HACK,
                ram: 1.7,
            },
            {
                job: "grow",
                filename: BIN_SCRIPTS.BASIC_GROW,
                ram: 1.75,
            },
            {
                job: "weaken",
                filename: BIN_SCRIPTS.BASIC_WEAK,
                ram: 1.75,
            }

        ]

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
                thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, (t.money.max / Math.max(t.money.available, 1))))
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

        targeted_servers.sort(([a_id, a_threads], [b_id, b_threads]) => (a_threads.g_threads + a_threads.h_threads + a_threads.w_threads) - (b_threads.g_threads + b_threads.h_threads + b_threads.w_threads));

        for (const [t_id, thread_batch] of targeted_servers) {
            for (const a of attackers) {
                let assigned_ram = 0;
                for (const file of files) {
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

    __hack_hwgw(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject) {
        let bundles: DeploymentBundle[] = [];
        let required_threads: Map<string, { h_threads: number, g_threads: number, w_threads: number }> = new Map();
        let files = [
            {
                job: "hack",
                filename: BIN_SCRIPTS[BIN_SCRIPTS.BASIC_HACK],
                ram: 1.7,
            },
            {
                job: "grow",
                filename: BIN_SCRIPTS[BIN_SCRIPTS.BASIC_GROW],
                ram: 1.75,
            },
            {
                job: "weaken",
                filename: BIN_SCRIPTS[BIN_SCRIPTS.BASIC_WEAK],
                ram: 1.75,
            }
        ]
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
                thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, (t.money.max / Math.max(t.money.available, 1))))
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

        targeted_servers.sort(([a_id, a_threads], [b_id, b_threads]) => (a_threads.g_threads + a_threads.h_threads + a_threads.w_threads) - (b_threads.g_threads + b_threads.h_threads + b_threads.w_threads));

        for (const [t_id, thread_batch] of targeted_servers) {
            for (const a of attackers) {
                let assigned_ram = 0;
                for (const file of files) {
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

    __hack_max_xp(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject) {
        let bundles: DeploymentBundle[] = [];
        let file = { job: "weaken", filename: BIN_SCRIPTS.BASIC_WEAK, ram: 1.75 }
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
        return bundles;
    }

    __hack_support_stocks(ns: NS, attackers: ServerObject[], targets: ServerObject[], player: PlayerObject) {
        let symbols = new Map([
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

        let bundles: DeploymentBundle[] = [];
        let required_threads: Map<string, {h_threads: number, g_threads: number, w_threads: number}> = new Map();
        for (const t of targets) {
            let thread_batch = {
                h_threads: 0,
                g_threads: 0,
                w_threads: 0
            }



            let ticker = symbols.get(t.hostname);
            if (ticker) {
                let position: [number,number,number,number] | undefined = positions[ticker];
                if (position) {
                    if (t.security.level > t.security.min) {
                        thread_batch.w_threads = Math.ceil((t.security.level - t.security.min) / .05)
                    }

                    if (position[0] > 0) {
                        thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, (t.money.max / Math.max(t.money.available,1))))
                    }

                    if (position[2] > 0) {
                        thread_batch.h_threads = Math.ceil(ns.hackAnalyzeThreads(t.id, t.money.available))
                    }
                }
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


        let files = [
            {
                job: "hack",
                filename: BIN_SCRIPTS.BASIC_HACK,
                ram: 1.7,
            },
            {
                job: "grow",
                filename: BIN_SCRIPTS.BASIC_GROW,
                ram: 1.75,
            },
            {
                job: "weaken",
                filename: BIN_SCRIPTS.BASIC_WEAK,
                ram: 1.75,
            }

        ]

        for (const [t_id, thread_batch] of targeted_servers) {
            for (const a of attackers) {
                let assigned_ram = 0;
                for (const file of files) {
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
