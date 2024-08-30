console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { MimiLandData } from "./db"
import { isMimiItem } from "./utils"
import { config } from "./config"

world.afterEvents.itemUse.subscribe(({itemStack, source}) => {
    if (isMimiItem(itemStack) && !source.isSneaking) {
        source.sendMessage("Hi, I'm Mimi!")        
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
                player.sendMessage(`${config["chat-prefix"]} §lSecond§r position set to (§e${x}, ${y}, ${z}§r).`)
            }
        } else {
            selectedCoords.set(player, [{ x, y, z }])
            player.sendMessage(`${config["chat-prefix"]} §lFirst§r position set to (§e${x}, ${y}, ${z}§r).`)
        }
    }

    lastInteractionTime = currentTime
})