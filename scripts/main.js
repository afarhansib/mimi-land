console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { MimiLandData } from "./db"
import { isMimiItem } from "./utils"

world.afterEvents.itemUse.subscribe(event => {
    if (isMimiItem(event.itemStack)) {
        event.source.sendMessage("Hi, I'm Mimi!")        
    }
})