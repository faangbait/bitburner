import { NodeStats, NS } from "Bitburner";

export const main = async (ns: NS) => {
    ns.disableLog("ALL");

    const BREAKEVEN_TIME = 120 * 60; // in seconds
    const SLEEP_TIME = 2 * 1000;
    const BUDGET_PERCENTAGE = 0.5;
    const PROD_MULT = ns.getPlayer().hacknet_node_money_mult;
    const BN_PROD_MULT = 1;
    const MAX_NODES = 14;
    
    while(ns.hacknet.numNodes() === 0) { ns.hacknet.purchaseNode(); await ns.sleep(5); }

    const get_nodes = () => {
        let nodes = new Map();

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            nodes.set(i, ns.hacknet.getNodeStats(i))
        }

        return nodes
    }

    const get_money = () => ns.getServerMoneyAvailable("home") * BUDGET_PERCENTAGE;
    const calc_production = (level: number, ram: number, cores: number) => (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * PROD_MULT * BN_PROD_MULT;
    const calc_payback_time = (cost: number, old_prod: number, new_prod: number) => cost / (new_prod - old_prod);

    enum UpgradeType {
        level,
        ram,
        core
    }

    // first-pass initialization of Netburners faction

    let nodes: Map<number, NodeStats> = get_nodes();

    while (nodes.size < 8 || Array.from(nodes.values()).reduce((acc, cur) => acc + cur.level, 0) < 100) {
        ns.clearLog();
        ns.print("Node\tLevel\tRAM\tCores\tProd/s")

        if (nodes.size > 0) {
            let cheapest_node = {
                idx: 0,
                stats: nodes.get(0) as NodeStats
            };

            for (const [i, node] of nodes.entries()) {
                ns.print(`Node ${i}\t${node.level}\t${node.ram}\t${node.cores}\t${ns.nFormat(node.production, '0.0a')}`)
                if (node.level < cheapest_node.stats.level) {
                    cheapest_node = {
                        idx: i,
                        stats: node
                    }
                }
            }

            if (get_money() >= ns.hacknet.getLevelUpgradeCost(cheapest_node.idx, 1)) { ns.hacknet.upgradeLevel(cheapest_node.idx, 1) }
            if (get_money() >= ns.hacknet.getPurchaseNodeCost()) { ns.hacknet.purchaseNode(); }
        }

        await ns.sleep(5);
        nodes = get_nodes();
    }

    // continue buying until past breakeven point

    while (true) {
        ns.clearLog();
        ns.print("Node\tLevel\tRAM\tCores\tProd/s")
        // upgrade existing
        const ratios: {
            // ratio: number,
            cost: number,
            payback: number,
            idx: number,
            upgrade: UpgradeType
        }[] = [];

        for (const [i, node] of nodes.entries()) {
            ns.print(`Node ${i}\t${node.level}\t${node.ram}\t${node.cores}\t${ns.nFormat(node.production, '0.0a')}`)
            // get upgrades cost
            const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(i, 1);
            const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(i, 1);
            const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(i, 1);
            // get prod. growth / cost ratios
            // const levelUpgradeRatio = (calc_production(node.level + 1, node.ram, node.cores) - node.production) / levelUpgradeCost;
            // const ramUpgradeRatio = (calc_production(node.level, node.ram * 2, node.cores) - node.production) / ramUpgradeCost;
            // const coreUpgradeRatio = (calc_production(node.level, node.ram, node.cores + 1) - node.production) / coreUpgradeCost;
            
            const levelPaybackTime = calc_payback_time(
                levelUpgradeCost,
                calc_production(node.level, node.ram, node.cores), calc_production(node.level+1, node.ram, node.cores)
            )

            const ramPaybackTime = calc_payback_time(
                ramUpgradeCost,
                calc_production(node.level, node.ram, node.cores), calc_production(node.level, node.ram*2, node.cores)
            )

            const corePaybackTime = calc_payback_time(
                coreUpgradeCost,
                calc_production(node.level, node.ram, node.cores), calc_production(node.level, node.ram, node.cores+1)
            )

            if (node.level < 200) { ratios.push({cost: levelUpgradeCost, payback: levelPaybackTime, idx:i, upgrade: UpgradeType.level}) }
            if (node.ram < 64) { ratios.push({cost: ramUpgradeCost, payback: ramPaybackTime, idx:i, upgrade: UpgradeType.ram}) }
            if (node.cores < 20) { ratios.push({cost: coreUpgradeCost, payback: corePaybackTime, idx:i, upgrade: UpgradeType.core}) }
            
    
            // const currentNodeUpgrades = [
            //     {
            //         // ratio: levelUpgradeRatio,
            //         cost: levelUpgradeCost,
            //         payback: levelPaybackTime,
            //         idx: i,
            //         upgrade: UpgradeType.level
            //     },
            //     {
            //         // ratio: ramUpgradeRatio,
            //         cost: ramUpgradeCost,
            //         payback: ramPaybackTime,
            //         idx: i,
            //         upgrade: UpgradeType.ram
            //     },
            //     {
            //         // ratio: coreUpgradeRatio,
            //         cost: coreUpgradeCost,
            //         payback: corePaybackTime,
            //         idx: i,
            //         upgrade: UpgradeType.core
            //     },

            // ];
            // ratios.push(...currentNodeUpgrades);
        }

        if (ratios.every(r => r.payback > BREAKEVEN_TIME)) { 
            if (nodes.size >= MAX_NODES) {
                return;
            } else {
                // try to buy a new node
                while (ns.hacknet.getPurchaseNodeCost() > get_money()) {
                    await ns.sleep(SLEEP_TIME)
                }
                ns.hacknet.purchaseNode();
            }
         } else {
            const { cost, idx, upgrade } = ratios.sort((a,b) => a.payback - b.payback)[0]
            if (isFinite(cost) && cost) {
                while (get_money() < cost) {
                    await ns.sleep(SLEEP_TIME);
                }

                switch (upgrade) {
                    case UpgradeType.level:
                        ns.hacknet.upgradeLevel(idx, 1);
                        break;
                    case UpgradeType.ram:
                        ns.hacknet.upgradeRam(idx, 1);
                        break;
                    case UpgradeType.core:
                        ns.hacknet.upgradeCore(idx, 1);
                        break;
                    default:
                        continue;
                }
            }
        }

        // calc most profitable upgrade
        // const { cost, idx, upgrade } = ratios.sort((a, b) => b.ratio - a.ratio)[0]
        // if (cost !== Infinity && cost) {

        //     while (get_money() < cost) {
        //         await ns.sleep(1);
        //     }
        //     switch (upgrade) {
        //         case UpgradeType.level:
        //             ns.hacknet.upgradeLevel(idx, 1);
        //             break;
        //         case UpgradeType.ram:
        //             ns.hacknet.upgradeRam(idx, 1);
        //             break;
        //         case UpgradeType.core:
        //             ns.hacknet.upgradeCore(idx, 1);
        //             break;
        //         default:
        //             continue;
        //     }
        // }

        // check if we can purchase a new node
        // const purchaseNodeCost = ns.hacknet.getPurchaseNodeCost();
        // const missingMoney = purchaseNodeCost - get_money();
        // if (missingMoney < 0) { ns.hacknet.purchaseNode(); } else if (missingMoney < hacknetProduction * SLEEP_TIME) {
        //     while (get_money() < purchaseNodeCost) {
        //         await ns.sleep(1);
        //     }
        //     ns.hacknet.purchaseNode();
        // }

        // await ns.sleep(SLEEP_TIME);
        nodes = get_nodes();
    }

}