# Phoenix Distributed Computing Engine

## What is Bitburner?
[Bitburner](https://github.com/danielyxie/bitburner) is a Javascript programming-based incremental game with a cyberpunk theme. The primary challenge of the game is to build and install real Javascript code into the game that automates its major mechanics:

- Managing available server resources (e.g. RAM) to maximally contribute towards progression
- Gaining access to new servers, either by meeting the prerequisites for hacking them or purchasing them. Servers have different qualities and can serve as launching points for scripts.
- Gaining access to factions by meeting their requirements. Factions allow you to install Augmentations, which increase your base stats. However, the cost of augmentations will increase exponentially until you install them, which resets your progress to level 1, albeit with increased base stats.
- Working a "job," which includes working for factions, companies, creating software, or committing crimes. Each of these jobs has its own requirements and rewards, so one must choose between hundreds of options in determining which contributes the most meaningfully to progression.
- Managing finances. Most of your stat boots are purchased, so you must maximize income and then spend in a way that contributes to progression.

In short, Bitburner quickly becomes a wildly complex decision optimization game built in real, industry-standard, asynchronous JavaScript ES6. Access to game mechanics, like hacking a server, are exposed by the NetScript module and are called like any other JavaScript function:

```
export const main = async (ns: NS) => {
  while (true) {
    await ns.hack("foodnstuff")
  }
}

```

Whether the player solves for these mechanics via a simple while-forever loop, implementing if-else logic, or a complex job-shop scheduling algorithm is left up to the player. 

## About Phoenix
Phoenix is my implementation of a Bitburner solution in TypeScript. The name comes from the core mechanic of the game: resetting your progress to achieve even greater progression on the next iteration. In the wake of this destruction, Phoenix rises from the ashes.

Phoenix's goal is to use every single mechanic available in BitBurner insofar as the mechanic more optimially leads to faster long-term progression. The core logic of the automation is managed by the Daemon, which (currently) uses a Strategy pattern to select from a variety of potential strategies to achieve short-term goals that meet specific milestones of progress. By maximizing the rate at which we clear each milestone, we simultaneously maximize the rate at which we can achieve the ultimate milestone: winning the game via installing a backdoor on the Bitnode's world daemon.
