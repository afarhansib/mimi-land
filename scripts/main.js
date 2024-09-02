console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { MimiLandData } from "./db"
import { generateFantasyName, isMimiItem, readableCoords, sleep } from "./utils"
import { config } from "./config"
import { MimiLandGUI } from "./gui"
import { spawnBot } from "./bot"

world.afterEvents.itemUse.subscribe(event => {
    const { itemStack, source } = event

    if (isMimiItem(itemStack) && !source.isSneaking) {
        // source.sendMessage(generateFantasyName()) 
        MimiLandGUI.openMenu(source, selectedCoords)
    }
})

let lastInteractionTime = 0
const cooldown = 1000
const selectedCoords = new Map()

// apparently playerInteractWithBlock is spamy, so we need to add a cooldown
world.beforeEvents.playerInteractWithBlock.subscribe(event => {
    const currentTime = Date.now()
    if (currentTime - lastInteractionTime < cooldown) {
        event.cancel = true
        return
    }
    const { block, player, itemStack } = event
    const { x, y, z } = block.location

    if (isMimiItem(itemStack) && player.isSneaking) {
        if (selectedCoords.has(player)) {
            if (selectedCoords.get(player).length >= 2) {
                console.log(`${player.name} has selected block ${JSON.stringify(selectedCoords.get(player))}`)
                player.sendMessage(`${config["chat-prefix"]} §lOpen Menu§r to Create Land or Cancel Selection.`)
            } else {
                selectedCoords.get(player)[1] = { x, y, z }
                player.sendMessage(`${config["chat-prefix"]} §lSecond§r position set to (§e${readableCoords(block.location)}§r).`)
            }
        } else {
            selectedCoords.set(player, [{ x, y, z }])
            player.sendMessage(`${config["chat-prefix"]} §lFirst§r position set to (§e${readableCoords(block.location)}§r).`)
        }
    }

    lastInteractionTime = currentTime
})

import * as GT from "@minecraft/server-gametest"
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
    world.getDimension("overworld").runCommandAsync("function mimibot")
}, 5 * 20)