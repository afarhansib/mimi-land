console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { MimiLandData } from "./db"
import { createParticleAroundBlock, createParticleBox, generateFantasyName, isMimiItem, readableCoords, sleep } from "./utils"
import { config } from "./config"
import { MimiLandGUI } from "./gui"
import { spawnBot } from "./bot"

world.afterEvents.itemUse.subscribe(event => {
    const { itemStack, source } = event

    if (isMimiItem(itemStack) && !source.isSneaking) {
        // source.sendMessage(generateFantasyName()) 
        MimiLandGUI.openMenu(source, selectedCoords, ParticleRunner)
    }
})

let lastInteractionTime = 0
const cooldown = 1000
const selectedCoords = new Map()
let ParticleRunner = null

// apparently playerInteractWithBlock is spamy, so we need to add a cooldown
world.beforeEvents.playerInteractWithBlock.subscribe(event => {
    const currentTime = Date.now()
    if (currentTime - lastInteractionTime < cooldown) {
        // event.cancel = true
        return
    }
    const { block, player, itemStack } = event
    const { x, y, z } = block.location

    if (isMimiItem(itemStack) && player.isSneaking) {
        if (selectedCoords.has(player)) {
            if (selectedCoords.get(player).length >= 2) {
                console.log(`${player.name} has selected block ${JSON.stringify(selectedCoords.get(player))}`)
                player.sendMessage(`${config["chat-prefix"]} §lOpen Menu§r to Create Land or Cancel Selection.`)
                system.run(() => {
                    player.playSound("random.pop")
                })
            } else {
                selectedCoords.get(player)[1] = { x, y, z }
                
                
                player.sendMessage(`${config["chat-prefix"]} §lSecond§r position set to (§e${readableCoords(block.location)}§r).`)
                system.run(() => {
                    createParticleBox(player.dimension, selectedCoords.get(player)[0], selectedCoords.get(player)[1])
                    player.playSound("random.pop2")
                    system.clearRun(ParticleRunner)
                    const particleDimension = player.dimension
                    ParticleRunner = system.runInterval(() => {
                        createParticleBox(particleDimension, selectedCoords.get(player)[0], selectedCoords.get(player)[1])
                    }, 20 * 1)
                })
            }
        } else {
            selectedCoords.set(player, [{ x, y, z }])
            player.sendMessage(`${config["chat-prefix"]} §lFirst§r position set to (§e${readableCoords(block.location)}§r).`)
            system.run(() => {
                // createParticleAroundBlock(player.dimension, 'minecraft:villager_happy', { x, y, z })
                createParticleBox(player.dimension, selectedCoords.get(player)[0], selectedCoords.get(player)[0])
                player.playSound("random.pop2")
                const particleDimension = player.dimension
                ParticleRunner = system.runInterval(() => {
                    createParticleBox(particleDimension, selectedCoords.get(player)[0], selectedCoords.get(player)[0])
                }, 20 * 1)
            })
        }
    }

    lastInteractionTime = currentTime
})

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === `minecraft:iron_ingot` && event.itemStack.nameTag === `Mimi Land Print`) {
        const mimiData = MimiLandData.getData('mimi_land')
        console.log(`Mimi Land Data Length: ${JSON.stringify(mimiData).length}`)
        // console.log(`Mimi Land Data: ${JSON.stringify(mimiData)}`)
        console.log(JSON.stringify(mimiData, null, 2))
        // world.sendMessage(`Mimi Land Data: ${JSON.stringify(mimiData)}`)
    }
})

system.runInterval(() => {
    mimiLandRunner()
}, 1 * 20)

world.beforeEvents.playerPlaceBlock.subscribe(event => blockInteractionHandler(event))
world.beforeEvents.playerBreakBlock.subscribe(event => blockInteractionHandler(event))
// world.beforeEvents.playerInteractWithBlock.subscribe(event => blockInteractionHandler(event, !event.isFirstEvent, true))
world.beforeEvents.playerInteractWithBlock.subscribe(event => blockInteractionHandler(event, null, true))
world.beforeEvents.explosion.subscribe(event => explosionHandler(event))
// system.runInterval(() => {
//     // let selectedCoords = [{"x":-498,"y":67,"z":-2000},{"x":-506,"y":62,"z":-2006}]
//     createParticleBox(player.dimension, selectedCoords.get(player)[0], selectedCoords.get(player)[1])
//     // createParticleBox(world.getDimension('overworld'), selectedCoords[0], selectedCoords[1])
// }, 20)

import * as GT from "@minecraft/server-gametest"
import { scriptEventHandler } from "./scriptevent"
import { blockInteractionHandler, explosionHandler, mimiLandRunner } from "./protection"
GT.registerAsync("mimibot", "spawn", spawnBot)
    .maxTicks(2147483647)
    .structureName("mimi:air")

// Command to spawn the bot
world.afterEvents.chatSend.subscribe((event) => {
    if (event.message.trim() === ";mimibot") {
        console.log("Spawning bot...")
        world.getDimension("overworld").runCommand("function mimibot")
    }
})

world.afterEvents.playerJoin.subscribe((event) => {
    const player = event.playerName

    console.log(`${player} joined the server.`)
})

system.runTimeout(async () => {
    // world.getDimension("overworld").runCommandAsync("function mimibot")
}, 5 * 20)

system.afterEvents.scriptEventReceive.subscribe(scriptEventHandler)