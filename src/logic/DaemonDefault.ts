import { NS } from "Bitburner";
import { CONTROL_SEQUENCES, PORTS } from "lib/Database";
import PrettyTable from "lib/PrettyTable";
import { BIN_SCRIPTS, SINGULARITY_SCRIPTS, SYS_SCRIPTS } from "lib/Variables";
import { AugCache } from "modules/augmentations/AugmentationCache";
import { AugmentationFuncs } from "modules/augmentations/AugmentationFunctions";
import { BitNodeCache } from "modules/bitnodes/BitnodeCache";
import { CrimeFuncs } from "modules/crimes/CrimeFunctions";
import { FactionCache } from "modules/factions/FactionCache";
import { FactionType } from "modules/factions/FactionEnums";
import { PlayerObject } from "modules/players/PlayerEnums";
import { PlayerInfo } from "modules/players/Players";
import { DeploymentBundle, ServerObject } from "modules/servers/ServerEnums";
import { ServerFuncs } from "modules/servers/ServerFunctions";
import { ServerInfo } from "modules/servers/Servers";
import { Sing } from "modules/Singularity";
import MinHeap from "structures/heaps/minHeap";

export default class DaemonDefault {
    bn: number;
    max_ports: number;
    module: string;
    bn_mults: import("/home/ss/dev/bitburner/src/modules/bitnodes/BitnodeEnums").BitnodeMultiplier;

    constructor(ns: NS) {
        let bn = BitNodeCache.read(ns, "current");
        this.bn = bn.number;
        this.bn_mults = bn.multipliers
        this.max_ports = 5;
        this.module = "DAEMON_DEFAULT"
    }

    set_control_sequence(ns: NS): CONTROL_SEQUENCES | null {
        let player = PlayerInfo.detail(ns);
        if (player.ports < this.max_ports) {
            let faction_servers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].slice(0, this.max_ports);
            if (faction_servers.map(s =>
                ServerInfo.detail(ns, s)).filter(s =>
                    player.ports < s.ports.required &&
                    player.hacking.level >= s.level
                ).length > 0) { return CONTROL_SEQUENCES.LIQUIDATE_CAPITAL }
        }

        return null
    }

    generate_focus_bundle(ns: NS): DeploymentBundle[] {
        if (!Sing.has_access(ns)) { return [] }

        let factions = Array.from(FactionCache.all(ns).values())
            .filter(f => f.member || f.invited)
            .filter(f => f.augmentations.some(a => AugCache.read(ns, a).wanted && AugCache.read(ns, a).baseRepRequirement > f.rep))
        
        if (factions.length > 0) {
            return this.__work_faction(ns, factions[0].name)
        } else {
            return this.__select_crime(ns, false, "intelligence")
        }

    }

    generate_hacking_bundle(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        return this.__hack_default(ns, attackers, targets);
    }

    generate_money_bundle(ns: NS): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);

        if (player.ports < this.max_ports) {
            let target = {
                0: 7e5,
                1: 1.5e6,
                2: 5e6,
                3: 3e7,
                4: 2.5e8
            };
            if (player.money > target[player.ports] && player.ports < this.max_ports) {
                bundles.push(...this.__buy_software(ns))
            }
        }

        if (
            ServerFuncs.get_processes(ns, "home", SYS_SCRIPTS.HACKNET).length > 0 &&
            !player.faction.membership.includes("Netburners") &&
            ![8].includes(this.bn)
        ) {
            bundles.push({
                file: SYS_SCRIPTS.HACKNET,
                priority: -1
            })
        }

        if (player.market.api.tix) {
            switch (ns.peek(PORTS.control)) {
                case CONTROL_SEQUENCES.LIQUIDATE_CAPITAL:
                    if (ServerFuncs.get_processes(ns, "home", SYS_SCRIPTS.MARKET).length > 0) {
                        bundles.push({
                            file: SYS_SCRIPTS.MARKET,
                            args: ["-l"],
                            priority: -99
                        })
                    }
                    break;
                default:
                    if (ServerFuncs.get_processes(ns, "home", SYS_SCRIPTS.MARKET).length === 0) {
                        bundles.push({
                            file: SYS_SCRIPTS.MARKET,
                            priority: -10
                        })
                    }
                    break;
            }
        }

        return bundles
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


    deploy_package(ns: NS, bundle: DeploymentBundle): number {
        return ns.exec(bundle.file, bundle.attacker || "home", bundle.threads, ...bundle.args || [])
    }

    active(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return true
    }

    escape(ns: NS, servers: ServerObject[], player: PlayerObject): boolean {
        return false
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
        // return
        ns.clearLog();
        let pt = new PrettyTable();
        let headers = ["TARGET", "SCRIPT", "THREADS"]

        let targets: Map<string, Map<string, number>> = new Map();

        bundles.forEach(b => {
            let target_id = "home";
            if (b.args && b.args[0]) { target_id = b.args[0].toString() }

            let targets_map = targets.get(target_id);
            if (!targets_map) { targets.set(target_id, new Map()); targets_map = targets.get(target_id) as Map<string, number>; }

            let threads = targets_map.get(b.file);
            if (!threads) { targets_map.set(b.file, 0); threads = 0; }

            targets_map.set(b.file, threads + (b.threads || 1))

        })

        let rows: string[][] = [];

        for (const [id, file_map] of targets) {
            for (const [file, threads] of file_map) {
                rows.push([id, file, threads.toString()])
            }
        }

        pt.create(headers, rows);
        ns.print(this.module);
        ns.print(pt.print());

    }

    __select_crime(ns: NS, force?: boolean, stat?: "agility" | "charisma" | "defense" | "dexterity" | "strength" | "hacking" | "intelligence" | "combat", crime_name?: string): DeploymentBundle[] {
        if (!Sing.has_access(ns)) { return [] }
        let player = PlayerInfo.detail(ns);
        if (!force && player.work.isWorking) { return [] }
        if (!crime_name) { crime_name = CrimeFuncs.get_best(ns, stat || "hacking").id }

        return [{
            file: SINGULARITY_SCRIPTS.CRIMES_COMMIT,
            args: [crime_name],
            priority: 0
        }]
    }

    __write_software(ns: NS, software_name?: string, force?: boolean): DeploymentBundle[] {
        if (!Sing.has_access(ns)) { return [] }
        let player = PlayerInfo.detail(ns);
        if (!force && player.work.isWorking) { return [] }

        if (!software_name) {
            if (!player.software.sql) { software_name = "sqlinject.exe" }
            if (!player.software.http) { software_name = "httpworm.exe" }
            if (!player.software.smtp) { software_name = "relaysmtp.exe" }
            if (!player.software.ftp) { software_name = "ftpcrack.exe" }
            if (!player.software.ssh) { software_name = "brutessh.exe" }
        }

        if (software_name) {
            return [{
                file: SINGULARITY_SCRIPTS.SOFTWARE_WRITE,
                args: [software_name],
                priority: -10

            }]
        }

        return []
    }

    __buy_software(ns: NS, software_name?: string): DeploymentBundle[] {
        if (!Sing.has_access(ns)) { return [] }
        let player = PlayerInfo.detail(ns);

        if (!software_name) {
            if (!player.software.sql) { software_name = "sqlinject.exe" }
            if (!player.software.http) { software_name = "httpworm.exe" }
            if (!player.software.smtp) { software_name = "relaysmtp.exe" }
            if (!player.software.ftp) { software_name = "ftpcrack.exe" }
            if (!player.software.ssh) { software_name = "brutessh.exe" }
        }

        if (software_name) {
            return [{
                file: SINGULARITY_SCRIPTS.SOFTWARE_PURCHASE,
                args: [software_name],
                priority: -90
            }]
        }

        return []
    }

    __purchase_servers(ns: NS, max_servers = 25, min_size = 6): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let player = PlayerInfo.detail(ns);
        let servers = ServerInfo.all(ns).filter(s => s.admin);

        // TODO: Bitnode multipliers

        const ram = (power: number) => { return Math.pow(2, power) }
        const purchase_cost = (power: number) => { return ram(power) * 55000 }
        const can_afford_server = (power: number) => { return servers.filter(s => s.isHome)[0].money.available >= purchase_cost(power) }

        let purchased_servers = servers.filter(s => s.purchased);
        let strongest_server: ServerObject;
        let weakest_server: ServerObject;

        if (purchased_servers.length > 0) {
            strongest_server = purchased_servers.reduce((max, cur) => cur.power > max.power ? cur : max);
            weakest_server = purchased_servers.reduce((min, cur) => cur.power < min.power ? cur : min);
        } else {
            strongest_server = servers.filter(s => s.isHome)[0]
            weakest_server = servers.filter(s => s.isHome)[0]
        }

        let next_upgrade = Math.max(min_size, strongest_server.power + 1);

        // sell servers
        if (purchased_servers.length === max_servers && can_afford_server(next_upgrade) && weakest_server.power < 18) {
            bundles.push({
                file: SYS_SCRIPTS.PURCHASE_SVR,
                args: ["sell", weakest_server.hostname],
                priority: -6
            })
            purchased_servers.pop() // doesn't matter what we pop, we're about to buy a replacement
        } else { ns.tprint(`Not attempting to sell server: ${purchased_servers.length} < ${max_servers}; ${next_upgrade} cost ${purchase_cost(next_upgrade)}; weakest: ${weakest_server.power}`) }

        // buy servers
        if (purchased_servers.length < max_servers && can_afford_server(next_upgrade)) {
            bundles.push({
                file: SYS_SCRIPTS.PURCHASE_SVR,
                args: ["buy", "cluster-", ram(next_upgrade)],
                priority: -5
            })
        } else { ns.tprint(`Not attempting to buy server: ${purchased_servers.length} >= ${max_servers}; ${next_upgrade} cost ${purchase_cost(next_upgrade)}; strongest: ${strongest_server.power}`) }

        return bundles
    }

    __upgrade_home(ns: NS, type: "ram" | "core"): DeploymentBundle[] {
        if (!Sing.has_access(ns)) { return [] }
        return [{
            file: SINGULARITY_SCRIPTS.SOFTWARE_UPGRADEHOME,
            args: [type],
            priority: -30
        }]
    }

    __work_faction(ns: NS, faction_name?: string, type?: "Hacking" | "Field" | "Security", force?: boolean): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        if (!Sing.has_access(ns)) { return [] }
        let player = PlayerInfo.detail(ns);
        if (!force && player.work.isWorking) { return [] }

        let desired_augs = AugmentationFuncs.get_augmentation_path(ns);
        let still_desired = Array.from(desired_augs.values()).filter(a => !a.owned);
        if (still_desired.length === 0) { return [] }

        if (!faction_name) {
            let aug_at_faction = still_desired.find(aug => aug.factions.find(f => FactionCache.read(ns, f).member || FactionCache.read(ns, f).invited));
            if (aug_at_faction) {
                faction_name = aug_at_faction.name
            }
        }

        if (!faction_name) {
            let aug_at_company = still_desired.find(aug => aug.factions.find(f => FactionCache.read(ns, f).type === FactionType.Corporation))
            if (aug_at_company) {
                let company_name = aug_at_company.factions.find(f => FactionCache.read(ns, f).type === FactionType.Corporation)
                if (company_name) {
                    let position = "IT Manager" // TODO
                    return this.__work_company(ns, company_name, position, true)
                }
            }
        }

        if (!faction_name) { faction_name = player.faction.membership[0] }
        if (!faction_name) { return [] }

        if (!type) { type = "Hacking" }

        if (!player.faction.membership.includes(faction_name)) {
            bundles.push({
                file: SINGULARITY_SCRIPTS.FACTION_JOIN,
                args: [faction_name],
                priority: -40
            })
        }

        bundles.push({
            file: SINGULARITY_SCRIPTS.FACTION_WORK,
            args: [faction_name, type, force || false],
            priority: -39

        })

        return bundles
    }

    __work_company(ns: NS, company_name?: string, position?: string, force?: boolean): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];

        if (!Sing.has_access(ns)) { return [] }
        let player = PlayerInfo.detail(ns);
        if (!force && player.work.isWorking) { return [] }

        if (!company_name) { company_name = player.company.companyName }
        if (!position) { return [] } // TODO Fix this

        if (player.company.companyName !== company_name) {
            bundles.push({
                file: SINGULARITY_SCRIPTS.COMPANY_APPLY,
                args: [company_name, position],
                priority: -50
            })
        }

        bundles.push({
            file: SINGULARITY_SCRIPTS.COMPANY_WORK,
            args: [company_name, true],
            priority: -49
        })

        return bundles
    }

    __get_attackers(ns: NS, servers: ServerObject[]) {
        return servers.filter(s => s.isAttacker && !this.disqualify_attacker(ns, s))
    }

    __get_targets(ns: NS, servers: ServerObject[]) {
        return servers.filter(s => s.isTarget && !this.disqualify_target(ns, s))
    }

    __prepare_attackers(ns: NS, servers: ServerObject[]) {
        return servers.map(s => this.prepare_attacker(ns, s));
    }

    __prepare_targets(ns: NS, servers: ServerObject[]) {
        return servers.map(s => this.prepare_target(ns, s));
    }

    __package(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        return [...this.generate_focus_bundle(ns), ...this.generate_hacking_bundle(ns, attackers, targets), ...this.generate_money_bundle(ns)]
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

    __hack_default(ns: NS, attackers: ServerObject[], targets: ServerObject[]) {
        let bundles: DeploymentBundle[] = [];
        let target_heap: MinHeap<string> = new MinHeap();
        let attacker_heap: MinHeap<string> = new MinHeap();

        let target_batch_req: Map<string, {
            h_threads: number,
            g_threads: number,
            w_threads: number
        }> = new Map();

        let files = [
            {
                job: "hack",
                filename: BIN_SCRIPTS.BASIC_HACK,
                ram: 1.7,
                priority: 8
            },
            {
                job: "grow",
                filename: BIN_SCRIPTS.BASIC_GROW,
                ram: 1.75,
                priority: 9
            },
            {
                job: "weaken",
                filename: BIN_SCRIPTS.BASIC_WEAK,
                ram: 1.75,
                priority: 10
            }
        ]

        let smallest_ram = Math.min(...files.map(f => f.ram));

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
                if (isFinite(t.money.max / t.money.available)) {
                    thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, t.money.max / t.money.available))
                } else {
                    thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, t.money.max / 1000))
                }
            }

            if (t.security.level > t.security.min) {
                thread_batch.w_threads = Math.ceil((t.security.level - t.security.min) / .05)
            }

            for (let key in thread_batch) {
                if (!isFinite(thread_batch[key])) { thread_batch[key] = 10000; }
                thread_batch[key] = Math.max(0, thread_batch[key])
            }

            let sum_threads = [
                thread_batch.h_threads,
                thread_batch.g_threads,
                thread_batch.w_threads
            ].reduce((a, c) => a + c, 0);

            if (sum_threads > 0) {
                target_batch_req.set(t.id, thread_batch)
                target_heap.enqueue(t.id, sum_threads)
            }

        }

        if (target_heap.size == 0) { return [] }

        attacker_heap.buildHeap(new Map(attackers.filter(a => a.ram.free > smallest_ram).map(a => [a.id, a.ram.free])), [])

        let next_target = target_heap.dequeue();
        while (next_target) {
            if (!target_batch_req.has(next_target.key)) { next_target = target_heap.dequeue(); continue; }

            let target = next_target.key;
            let thread_batch = target_batch_req.get(next_target.key);
            if (!thread_batch) { next_target = target_heap.dequeue(); continue; }

            let next_attacker = attacker_heap.findMin();

            while (next_attacker) {
                let a = next_attacker.key;
                let ram = next_attacker.val;

                for (const file of files) {
                    let threads = 0;

                    if (file.job === "weaken" && thread_batch.w_threads > 0) {
                        threads = Math.floor(Math.min(ram / file.ram, thread_batch.w_threads));
                        thread_batch.w_threads -= threads;
                    }

                    if (file.job === "grow" && thread_batch.g_threads > 0) {
                        threads = Math.floor(Math.min(ram / file.ram, thread_batch.g_threads));
                        thread_batch.g_threads -= threads;
                    }

                    if (file.job === "hack" && thread_batch.h_threads > 0) {
                        threads = Math.floor(Math.min(ram / file.ram, thread_batch.h_threads));
                        thread_batch.h_threads -= threads;
                    }

                    if (threads > 0) {
                        bundles.push({
                            file: file.filename,
                            attacker: a,
                            threads: threads,
                            args: [target, true]
                        })
                        ram -= (threads * file.ram);
                    }
                }

                if (ram < smallest_ram) { attacker_heap.deleteKey(a) } else { attacker_heap.decreaseKey(a, ram) }


                if ([
                    thread_batch.h_threads,
                    thread_batch.g_threads,
                    thread_batch.w_threads
                ].reduce((a, c) => a + c, 0) > 0) {
                    next_attacker = attacker_heap.findMin();
                } else { next_attacker = null; }
            }


            next_target = target_heap.dequeue();
        }

        let next_attacker = attacker_heap.dequeue();

        while (next_attacker) {
            let a = next_attacker.key;
            let ram = next_attacker.val;

            let file = files.filter(f => f.job === "weaken")[0]

            if (ram >= file.ram) {
                bundles.push({
                    file: file.filename,
                    attacker: a,
                    threads: Math.floor(ram / file.ram),
                    args: ["n00dles", true]
                })
            }

            next_attacker = attacker_heap.dequeue();
        }

        return bundles;

    }

    __hack_max_xp(ns: NS, attackers: ServerObject[], targets: ServerObject[]) {
        let bundles: DeploymentBundle[] = [];
        let file = { job: "weaken", filename: BIN_SCRIPTS.BASIC_WEAK, ram: 1.75 }
        for (const a of attackers) {
            let threads = ServerFuncs.threadCount(a, file.ram)
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

    __hack_cash(ns: NS, attackers: ServerObject[], targets: ServerObject[]) {
        let bundles: DeploymentBundle[] = [];
        let target_heap: MinHeap<string> = new MinHeap();
        let attacker_heap: MinHeap<string> = new MinHeap();

        let target_batch_req: Map<string, {
            h_threads: number,
            g_threads: number,
            w_threads: number
        }> = new Map();

        let files = [
            {
                job: "hack",
                filename: BIN_SCRIPTS.BASIC_HACK,
                ram: 1.7,
                priority: 8
            },
            {
                job: "grow",
                filename: BIN_SCRIPTS.BASIC_GROW,
                ram: 1.75,
                priority: 9
            },
            {
                job: "weaken",
                filename: BIN_SCRIPTS.BASIC_WEAK,
                ram: 1.75,
                priority: 10
            }
        ]


        let smallest_ram = Math.min(...files.map(f => f.ram));

        for (const t of targets) {
            let thread_batch = {
                h_threads: 0,
                g_threads: 0,
                w_threads: 0
            }

            if (t.money.available > 1e4 && t.security.level <= t.security.min + 1) {
                thread_batch.h_threads = Math.ceil(ns.hackAnalyzeThreads(t.id, t.money.available))
            }

            if (t.money.available > 1e4 && t.security.level > t.security.min) {
                thread_batch.w_threads = Math.ceil((t.security.level - t.security.min) / .05)
            }

            for (let key in thread_batch) {
                if (!isFinite(thread_batch[key])) { thread_batch[key] = 10000; }
                thread_batch[key] = Math.max(0, thread_batch[key])
            }

            let sum_threads = [
                thread_batch.h_threads,
                thread_batch.g_threads,
                thread_batch.w_threads
            ].reduce((a, c) => a + c, 0);

            if (sum_threads > 0) {
                target_batch_req.set(t.id, thread_batch)
                target_heap.enqueue(t.id, sum_threads)
            }

        }

        if (target_heap.size == 0) { return [] }

        attacker_heap.buildHeap(new Map(attackers.filter(a => a.ram.free > smallest_ram).map(a => [a.id, a.ram.free])), [])

        let next_target = target_heap.dequeue();
        while (next_target) {
            if (!target_batch_req.has(next_target.key)) { next_target = target_heap.dequeue(); continue; }

            let target = next_target.key;
            let thread_batch = target_batch_req.get(next_target.key);
            if (!thread_batch) { next_target = target_heap.dequeue(); continue; }

            let next_attacker = attacker_heap.dequeue();

            while (next_attacker) {
                let a = next_attacker.key;
                let ram = next_attacker.val;

                for (const file of files) {
                    let threads = 0;


                    if (file.job === "hack" && thread_batch.h_threads > 0) {
                        threads = Math.floor(Math.min(ram / file.ram, thread_batch.h_threads));
                        thread_batch.h_threads -= threads;
                    }
                    if (file.job === "weaken" && thread_batch.w_threads > 0) {
                        threads = Math.floor(Math.min(ram / file.ram, thread_batch.w_threads));
                        thread_batch.w_threads -= threads;
                    }

                    if (threads > 0) {
                        bundles.push({
                            file: file.filename,
                            attacker: a,
                            threads: threads,
                            args: [target, true]
                        })
                        ram -= (threads * file.ram);
                    }
                }

                if ([
                    thread_batch.h_threads,
                    thread_batch.g_threads,
                    thread_batch.w_threads
                ].reduce((a, c) => a + c, 0) > 0) {
                    next_attacker = attacker_heap.dequeue();
                } else { next_attacker = null; }
            }


            next_target = target_heap.dequeue();
        }
        return bundles
    }

    __hack_support_stocks(ns: NS, attackers: ServerObject[], targets: ServerObject[]) { // TODO: Optimize algo
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
        let required_threads: Map<string, { h_threads: number, g_threads: number, w_threads: number }> = new Map();
        for (const t of targets) {
            let thread_batch = {
                h_threads: 0,
                g_threads: 0,
                w_threads: 0
            }



            let ticker = symbols.get(t.hostname);
            if (ticker) {
                let position: [number, number, number, number] | undefined = positions[ticker];
                if (position) {
                    if (t.security.level > t.security.min) {
                        thread_batch.w_threads = Math.ceil((t.security.level - t.security.min) / .05)
                    }

                    if (position[0] > 0) {
                        thread_batch.g_threads = Math.ceil(ns.growthAnalyze(t.id, (t.money.max / Math.max(t.money.available, 1))))
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

        targeted_servers.sort(([a_id, a_threads], [b_id, b_threads]) => (a_threads.g_threads + a_threads.h_threads) - (b_threads.g_threads + b_threads.h_threads));


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
                                let threads = Math.min(ServerFuncs.threadCount(a, file.ram), thread_batch.h_threads);
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
                                let threads = Math.min(ServerFuncs.threadCount(a, file.ram), thread_batch.g_threads);
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
                                let threads = Math.min(ServerFuncs.threadCount(a, file.ram), thread_batch.w_threads);
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
