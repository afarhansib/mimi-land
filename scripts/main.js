console.log(`Mimi Land loaded.`)

import { world, system } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"
import { MimiLandData } from "./db"

let form = new ModalFormData()
let effectList = [`Regeneration`, `Protection`, `Poison`, `Wither`]

form.title(`Effect Generator`);
form.textField(`Target`, `Target of Effect`)
form.dropdown(`Effect Type`, effectList)
form.slider(`Effect Level`, 0, 255, 1)
form.toggle(`Hide Effect Particle`, true)

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "mimi-land:clear") {
        MimiLandData.clearData(`mimi_land`)
        console.log(`Mimi Land data cleared.`)
    }
})

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === `minecraft:diamond` && event.itemStack.nameTag === `Mimi Land`) {
        // form.show(event.source).then(r => {
        //     if (r.canceled) return

        //     console.log(JSON.stringify(r))
        // }).catch(e => {
        //     console.error(e, e.stack)
        // })
        MimiLandData.addData(`mimi_land`, {
            name: `Mimi Land`,
            description: `Mimi Land is a Minecraft world created by Mimi.`,
            version: `1.0.0`,
            author: `Mimi`,
            date: new Date().toLocaleString()
        })
    }
})

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === `minecraft:diamond` && event.itemStack.nameTag === `Mimi Land Print`) {
        const mimiData = MimiLandData.getData('mimi_land')
        console.log(`Mimi Land Data Length: ${JSON.stringify(mimiData).length}`)
        console.log(`Mimi Land Data: ${JSON.stringify(mimiData)}`)
        // world.sendMessage(`Mimi Land Data: ${JSON.stringify(mimiData)}`)
    }
})