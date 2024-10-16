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

// Subscribe to the `projectileHitEntity` event, which is triggered when a projectile hits an entity
world.afterEvents.projectileHitEntity.subscribe((eventData) => {
    // Destructure the eventData to get the source entity (the one that shot the projectile)
    const { source } = eventData;
    const hittedEntity = eventData.getEntityHit()
    console.log(JSON.stringify(eventData.getEntityHit()))

    // Get the entity that was hit by the projectile
    const hitEntity = eventData.getEntityHit()?.entity;

    if (hitEntity) {
        const { x, y, z } = hitEntity.location;
        const coordinates = `${x}, ${y}, ${z}`;
        const message = `${source.name} hit the entity at location ${coordinates}`;
        world.sendMessage(message);

        // Check if the hit entity is a villager
        if (hitEntity.typeId === "minecraft:villager_v2") {
            console.log('entity is ' + hitEntity.typeId)
            const healthComponent = hitEntity.getComponent("health");
            console.log(JSON.stringify(healthComponent))
            if (healthComponent) {
                // Restore the villager's health to its maximum value
                console.log(healthComponent.effectiveMax)
                console.log(healthComponent.currentValue)
                healthComponent.setCurrentValue(healthComponent.effectiveMax);
            }
        }
    }
});

world.afterEvents.entityHurt.subscribe((event) => {
    if (event.damageSource.damagingEntity instanceof Player) {
        const player = event.damageSource.damagingEntity
        const hurtEntity = event.hurtEntity
        const location = event.hurtEntity.location
        const damage = event.damage

        const currentHealth = hurtEntity.getComponent("health").currentValue
        const maxHealth = hurtEntity.getComponent("health").effectiveMax
        console.log(JSON.stringify(event.damage))
        hurtEntity.getComponent("health").setCurrentValue(maxHealth)
        player.sendMessage("Yamete kudasai! No hurting entities in claimed areas! (╥_╥)")
    }
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

// {
//     "module_name": "@minecraft/server-net",
//     "version": "1.0.0-beta"
// },
// add those to manifest.json