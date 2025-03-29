console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { MimiLandData } from "./db"
import { createParticleBox, findAreaByLocation, isMimiItem, isOverlapping, readableCoords } from "./utils"
import { config } from "./config"
import { MimiLandGUI } from "./gui"
import { blockInteractionHandler, explosionHandler, mimiLandRunner } from "./protection"

// @dev-start
import { spawnBot } from "./bot"
// @dev-end

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
    lastInteractionTime = currentTime
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

                const firstCoord = selectedCoords.get(player)[0]
                const existingAreas = MimiLandData.getData("mimi_land") || []
                const newY2 = config["defaultY2"]
                const newArea = [
                    { x: Math.min(firstCoord.x, x), y: Math.min(firstCoord.y, newY2), z: Math.min(firstCoord.z, z) },
                    { x: Math.max(firstCoord.x, x), y: Math.max(firstCoord.y, newY2), z: Math.max(firstCoord.z, z) }
                ]

                // console.log(JSON.stringify([newArea, player.dimension.id, existingAreas]))
                // console.log(JSON.stringify(isOverlapping(newArea, player.dimension.id, existingAreas)))
                if (isOverlapping(newArea, player.dimension.id, existingAreas)) {
                    player.sendMessage(`${config["chat-prefix"]} §eThis selection overlaps with existing land!`)
                    // player.playSound("random.break")
                    return
                }

                selectedCoords.get(player)[1] = { x, y: newY2, z }

                player.sendMessage(`${config["chat-prefix"]} §lSecond§r position set to (§e${readableCoords(selectedCoords.get(player)[1])}§r).`)
                system.run(() => {
                    // createParticleBox(player.dimension, selectedCoords.get(player)[0], selectedCoords.get(player)[1])
                    player.playSound("random.pop2")
                    // system.clearRun(ParticleRunner)
                    // const particleDimension = player.dimension
                    // ParticleRunner = system.runInterval(() => {
                    //     createParticleBox(particleDimension, selectedCoords.get(player)[0], selectedCoords.get(player)[1])
                    // }, 20 * 1)
                })
            }
        } else {
            const existingAreas = MimiLandData.getData("mimi_land") || []
            const overlappingArea = findAreaByLocation(block.location, player.dimension.id, existingAreas)
            // console.log(JSON.stringify([block.location, player.dimension.id, existingAreas]))
            // console.log(JSON.stringify(overlappingArea))
            const newY1 = config["defaultY1"]
            const newY2 = config["defaultY2"]

            if (overlappingArea) {
                player.sendMessage(`${config["chat-prefix"]} §eThis block is inside an existing land!`)
                return
                // player.playSound("random.break")
            }

            selectedCoords.set(player, [{ x, y: newY1, z }])
            // @dev-start
            // console.log(JSON.stringify(selectedCoords.get(player)))
            // console.log(JSON.stringify(selectedCoords))
            // console.log(JSON.stringify(block.location))
            // @dev-end
            player.sendMessage(`${config["chat-prefix"]} §lFirst§r position set to (§e${readableCoords(selectedCoords.get(player)[0])}§r).`)
            system.run(() => {
                // createParticleAroundBlock(player.dimension, 'minecraft:villager_happy', { x, y, z })
                // createParticleBox(player.dimension, {x, y: newY1, z}, {x, y: newY2, z})
                player.playSound("random.pop2")
                // const particleDimension = player.dimension
                // ParticleRunner = system.runInterval(() => {
                //     createParticleBox(particleDimension, {x, y: newY1, z}, {x, y: newY2, z})
                // }, 20 * 1)
            })
        }
    }


})

system.runInterval(() => {
    mimiLandRunner()
}, 1 * 20)

world.beforeEvents.playerPlaceBlock.subscribe(event => blockInteractionHandler(event))
world.beforeEvents.playerBreakBlock.subscribe(event => blockInteractionHandler(event))
world.beforeEvents.itemUse.subscribe(event => blockInteractionHandler(event))
world.beforeEvents.playerInteractWithBlock.subscribe(event => blockInteractionHandler(event, null, true))
world.beforeEvents.explosion.subscribe(event => explosionHandler(event))
// world.beforeEvents.playerInteractWithBlock.subscribe(event => blockInteractionHandler(event, !event.isFirstEvent, true))
// world.beforeEvents.playerInteractWithEntity.subscribe(event => blockInteractionHandler(event, null, true))
// system.runInterval(() => {
//     // let selectedCoords = [{"x":-498,"y":67,"z":-2000},{"x":-506,"y":62,"z":-2006}]
//     createParticleBox(player.dimension, selectedCoords.get(player)[0], selectedCoords.get(player)[1])
//     // createParticleBox(world.getDimension('overworld'), selectedCoords[0], selectedCoords[1])
// }, 20)
system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "mimi:land-gui") {
        try {
            MimiLandGUI.openMenu(event?.sourceEntity, selectedCoords, ParticleRunner)
        } catch (err) {

        }
        //console.log(event.id)
        //console.log(event?.sourceBlock)
        //console.log(event?.initiator)
        //console.log(event?.message)
        //console.log(event?.sourceEntity?.name)
        //console.log(event?.sourceType)
    }
})

// @dev-start
import * as GT from "@minecraft/server-gametest"
import { scriptEventHandler } from "./scriptevent"

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
// @dev-end