/*
use custom command, with a prefix of `.ml`
*/

world.beforeEvents.chatSend.subscribe((ev) => {
    const msg = ev.message;
    const sender = ev.sender;
    if (msg.startsWith(`.`)) {
        if (msg.startsWith(`.ml`)) {
            sender.sendMessage(`Hello, Mimi!`)
            system.run(() => {
                sender.runCommand(`damage ${sender.name} 1`)
                form.show(sender)
            })
        }
    }
    ev.cancel = true
})

// gui example
import { ModalFormData } from "@minecraft/server-ui"

let form = new ModalFormData()
let effectList = [`Regeneration`, `Protection`, `Poison`, `Wither`]

form.title(`Effect Generator`);
form.textField(`Target`, `Target of Effect`)
form.dropdown(`Effect Type`, effectList)
form.slider(`Effect Level`, 0, 255, 1)
form.toggle(`Hide Effect Particle`, true)

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


world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === `minecraft:diamond` && event.itemStack.nameTag === `Mimi Land Print`) {
        const mimiData = MimiLandData.getData('mimi_land')
        console.log(`Mimi Land Data Length: ${JSON.stringify(mimiData).length}`)
        console.log(`Mimi Land Data: ${JSON.stringify(mimiData)}`)
        // world.sendMessage(`Mimi Land Data: ${JSON.stringify(mimiData)}`)
    }
})

// 'api' example, using script event
system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "mimi-land:clear") {
        MimiLandData.clearData(`mimi_land`)
        console.log(`Mimi Land data cleared.`)
    }
})