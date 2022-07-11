import { NS } from "Bitburner";
import { BIN_FILES } from "lib/Variables";
import { DeploymentBundle, PlayerObject, ServerObject } from "Phoenix";
import HackDefault from "logic/HackDefault";

export default class HackMaxHP extends HackDefault {
    constructor(ns: NS, servers: ServerObject[], player: PlayerObject) {
        super(ns, servers, player);
        this.files = [
            {
                job: "weaken",
                filename: BIN_FILES.BASIC_WEAK.toString(),
                ram: 1.75
            }
        ]
    }

    disqualify_target(ns: NS, s: ServerObject): boolean {
        return s.hostname !== "n00dles";
    }

    generate_target_matrix(ns: NS, attackers: ServerObject[], targets: ServerObject[]): DeploymentBundle[] {
        let bundles: DeploymentBundle[] = [];
        let file = this.files[0];
        for (const t of targets) {
            for (const a of attackers) {
                let threads = a.threadCount(file.ram)
                if (threads > 0) {
                    bundles.push({
                        file: file.filename,
                        attacker: a.id,
                        threads: threads,
                        args: [t.id, a.isHome]
                    });
                }
            }
        }
        return bundles;
    }
}
