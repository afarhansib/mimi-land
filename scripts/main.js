console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { MimiLandData } from "./db"
import { isMimiItem } from "./utils"

world.afterEvents.itemUse.subscribe(event => {
    if (isMimiItem(event.itemStack)) {
        // event.source.sendMessage("Hi, I'm Mimi!")        
    }
})

let lastInteractionTime = 0
const cooldown = 1000

// apparently playerInteractWithBlock is spamy, so we need to add a cooldown
world.beforeEvents.playerInteractWithBlock.subscribe(event => {
    const currentTime = Date.now()
    if (currentTime - lastInteractionTime < cooldown) {
        event.cancel = true
        return
    }
    const {block, player, itemStack} = event

    if (isMimiItem(itemStack)) {
        event.player.sendMessage("Selecting a block...")
    }

    lastInteractionTime = currentTime
})