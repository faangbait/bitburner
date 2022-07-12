import { NS } from "Bitburner";
import { ServerObject } from "Phoenix";
import { RESERVED_HOME_RAM } from "lib/Variables";
import { ServerCache } from "lib/Database";

export const SInfo = {
    all(ns: NS): ServerObject[] {
        return SInfo.names(ns).map(s => SInfo.detail(ns, s))
    },

    names(ns: NS, current = "home", set = new Set(["home"])): string[] {
        let connections = ns.scan(current)
        let next = connections.filter(c => !set.has(c))
        next.forEach(n => {
            set.add(n);
            return SInfo.names(ns, n, set)
        })
        return Array.from(set.keys())
    },

    detail(ns: NS, hostname: string): ServerObject {
        let data = ns.getServer(hostname);

        let svr: ServerObject = {
            id: hostname,
            updated_at: new Date().valueOf(),
            hostname: hostname,
            admin: data.hasAdminRights,
            ip: data.ip,
            level: data.requiredHackingSkill,
            purchased: (data.purchasedByPlayer && data.hostname !== "home"),
            connected: data.isConnectedTo,
            backdoored: data.backdoorInstalled,
            cores: data.cpuCores,
            ram: {
                used: data.ramUsed,
                max: data.maxRam - (data.hostname === "home" ? RESERVED_HOME_RAM : 0),
                free: Math.max(0, data.maxRam - data.ramUsed - (data.hostname === "home" ? RESERVED_HOME_RAM : 0)),
                trueMax: data.maxRam
            },
            power: Math.max(0, Math.log2(data.maxRam)),
            organization: data.organizationName,
            isHome: (data.hostname === "home"),
            ports: {
                required: data.numOpenPortsRequired,
                open: data.openPortCount,
                ftp: data.ftpPortOpen,
                http: data.httpPortOpen,
                smtp: data.smtpPortOpen,
                sql: data.sqlPortOpen,
                ssh: data.sshPortOpen
            },
            security: {
                level: data.hackDifficulty,
                min: data.minDifficulty,
            },
            money: {
                available: data.moneyAvailable,
                max: data.moneyMax,
                growth: data.serverGrowth
            },
            hackTime: Math.ceil(ns.getHackTime(data.hostname)),
            growTime: Math.ceil(ns.getHackTime(data.hostname) * 3.2),
            weakenTime: Math.ceil(ns.getHackTime(data.hostname) * 4),
            isTarget:
                (!data.purchasedByPlayer && data.hostname !== "home" &&
                    data.moneyMax > 0 && data.openPortCount >= data.numOpenPortsRequired &&
                    data.hasAdminRights && data.requiredHackingSkill <= ns.getHackingLevel()),
            isAttacker: (data.purchasedByPlayer || data.hostname === "home" || (data.maxRam > 0 && data.hasAdminRights)),
            pids: Array.from(ns.ps(hostname).map(p => {
                let t: string | null = null;

                if (p.args[0] in SInfo.names(ns)) {
                    t = p.args[0];
                }

                return Object.create({
                    filename: p.filename,
                    threads: p.threads,
                    args: p.args,
                    pid: p.pid,
                    owner: hostname,
                    target: t
                })
            })),
            targeted_by: Array.from(ns.ps(hostname).map(p => {
                let t: string | null = null;

                if (p.args[0] in SInfo.names(ns)) {
                    t = p.args[0];
                }

                return Object.create({
                    filename: p.filename,
                    threads: p.threads,
                    args: p.args,
                    pid: p.pid,
                    owner: hostname,
                    target: t
                })
            })).filter(p => p.target && p.target.id == hostname),
            sudo: function () {
                if (!this.admin) {
                    try {
                        ns.brutessh(this.id);
                        ns.ftpcrack(this.id);
                        ns.relaysmtp(this.id);
                        ns.httpworm(this.id);
                        ns.sqlinject(this.id);
                    }
                    catch { }
                    finally {
                        ns.nuke(this.id)
                    }
                }
            },

            threadCount: function (scriptRam: number, strictMode = false): number {
                let threads = Math.floor(this.ram.free / scriptRam);

                if (strictMode && threads <= 0) {
                    throw "no threads available";
                }
                return threads;
            },
        };
        return svr;
    },

    async update_cache(ns: NS, hostname: string, repeat = true) {
        do {
            if (repeat) {
                await ns.asleep(1000);
            }
            await ServerCache.update(ns, SInfo.detail(ns, hostname));
        } while (repeat)
    }
}
