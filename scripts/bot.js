import { generateFantasyName } from "./utils";

export function spawnBot(test) {
    // const botAmount = Math.floor(Math.random() * 10)
    const botAmount = Math.floor(Math.random() * 7) + 5
    // const botAmount = 699
    console.log(`Spawning ${botAmount} bots...`)

    const bots = []
    for (let i = 0; i < botAmount; i++) {
        const bot = test.spawnSimulatedPlayer({ x: 0, y: 1, z: 0 }, generateFantasyName(true))
        bots.push(bot)
    }
    test.print("Mimi bot spawned!")
}
