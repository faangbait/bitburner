import { NS } from "Bitburner";
import { PORTS, SYS_FILES } from "lib/Variables";

export const main = async (ns: NS) => {
    var count = 0;
    while (true) {
        await ns.sleep(60000);

        if (count > 120) {
            ns.tprint("scheduled reboot");
            ns.ps("home").filter(process => process.filename != SYS_FILES.KEEPALIVE.toString()).forEach(process => ns.kill(process.pid));
            ns.run(SYS_FILES.PHOENIX.toString());

            count = 0;
        }

        if (ns.ps("home").filter(process => process.filename == SYS_FILES.PHOENIX.toString()).length != 1) {
            ns.run(SYS_FILES.PHOENIX.toString());
            ns.print("phoenix not found");
        }

        try {
            let heartbeat = ns.peek(PORTS.heartbeat);
            let curtime = new Date().valueOf();
            ns.print((curtime - heartbeat) / 1000, " seconds since last heartbeat");

            if ((curtime - heartbeat) / 1000 > 300) {
                throw "Heartbeat is old.";
            }
        } catch (e) {

            ns.tprint("error ", e);

            ns.ps("home").filter(process => process.filename != SYS_FILES.KEEPALIVE.toString()).forEach(process => ns.kill(process.pid));
            ns.run(SYS_FILES.PHOENIX.toString());

        }
        count++;

    }
}
