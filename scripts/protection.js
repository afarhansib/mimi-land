import { EquipmentSlot, world } from "@minecraft/server"
import { MimiLandData } from "./db";
import { createParticleBox, findAreaByLocation, formatDimensionName, isAllowed, isMimiItem, readableCoords, showLandInfo } from "./utils";
import { config } from "./config";

const playerLastAreas = new Map()

export const mimiLandRunner = () => {
    const allArea = MimiLandData.getData('mimi_land')

    const players = world.getPlayers(); // Capture once
    // Debug line: Show total players and names in one line
    // console.log(`Debug: ${players.length} player${players.length !== 1 ? 's' : ''} online - ${players.map(p => p.name).join(', ')}`);
    // console.log(JSON.stringify(players, null, 2));
    // console.log(JSON.stringify(Array.from(players)))
    // players.forEach(player => {
    //     console.log(player.name)
    // })
    // for (const player of players) { // Use the same snapshot
    const villagers = world.getDimension("overworld").getEntities({ type: "minecraft:villager_v2" });
    // Handle Villagers in [iv] Lands
    // console.log(JSON.stringify(villagers))
    // console.log('checking for ' + player.name)
    villagers.forEach(villager => {
        // if (player.name !== "yotbu") return
        try {
            // Check if the villager object and its location are valid
            if (!villager || !villager.location || typeof villager.location.x === 'undefined') {
                console.warn(`Invalid villager object or location for player. Skipping this villager.`);
                return; // Skip this villager
            }

            // Convert floating-point coordinates to integer block coordinates
            const blockX = Math.floor(villager.location.x);
            const blockY = Math.floor(villager.location.y);
            const blockZ = Math.floor(villager.location.z);

            // Get the villager's block location
            const villagerBlock = villager.dimension.getBlock({ x: blockX, y: blockY, z: blockZ });
            if (!villagerBlock) {
                // console.warn(`Failed to get block for villager at location ${JSON.stringify({ x: blockX, y: blockY, z: blockZ })}. Skipping this villager.`);
                return; // Skip this villager
            }

            // Find the area for the villager's location
            const villagerArea = findAreaByLocation(villager.location, villager.dimension.id, allArea);

            // console.log(`detected villager at ${JSON.stringify({ x: blockX, y: blockY, z: blockZ })}.`)
            // if (villagerArea) console.log('and villager is inside an area')
            if (villagerArea && villagerArea.name.includes('[iv]')) {
                // Apply multiple buffs to make the villager invincible
                villager.addEffect("resistance", 20 * 20, { amplifier: 4, showParticles: true }); // 100% damage reduction
                villager.addEffect("regeneration", 20 * 20, { amplifier: 255, showParticles: true }); // Max regeneration
                villager.addEffect("absorption", 20 * 20, { amplifier: 255, showParticles: true }); // Max absorption hearts
                villager.addEffect("fire_resistance", 20 * 20, { amplifier: 0, showParticles: true }); // Fire immunity
                villager.addEffect("instant_health", 1, { amplifier: 255, showParticles: true }); // Instant full health
                villager.addEffect("strength", 20 * 20, { amplifier: 255, showParticles: true }); // Max attack damage
                villager.addEffect("slow_falling", 20 * 20, { amplifier: 0, showParticles: true }); // No fall damage
                villager.addEffect("water_breathing", 20 * 20, { amplifier: 0, showParticles: true }); // No drowning
            }
        } catch (error) {
            console.error(`Error processing villager for player :`, error);
        }
    });
    players.forEach(player => {
        // console.log(player.name);
        try {
            const dimension = world.getDimension(player.dimension.id)
            const withers = dimension.getEntities({ type: "minecraft:wither" });
            for (const wither of withers) {
                const witherBlock = dimension.getBlock(wither.location);
                const witherArea = findAreaByLocation(witherBlock, dimension.id, allArea);
                if (witherArea && witherArea.name !== 'Wither Wiper') {
                    wither.remove();
                }
            }

            const equippable = player.getComponent("equippable");
            const slot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand)

            // player.sendMessage(`${JSON.stringify(player.location)}`)
            let playerBlock = null
            try {
                playerBlock = player.dimension.getBlock(player.location)
            } catch (error) {
                return
                // continue
            }
            const playerArea = findAreaByLocation(playerBlock, player.dimension.id, allArea)

            const lastArea = playerLastAreas.get(player.name)

            const areaChanged = playerArea?.id !== lastArea?.id

            if (areaChanged) {
                if (playerArea) {
                    player.sendMessage(`${config["chat-prefix"]} §bYou've entered §r§a"${playerArea.name}"§b land!`)
                    showLandInfo(player, playerArea)
                } else if (lastArea) {
                    player.sendMessage(`${config["chat-prefix"]} §eYou've left §r§a"${lastArea.name}"§e land.`)
                }
                playerLastAreas.set(player.name, playerArea)
            }
            // player.onScreenDisplay.setActionBar(`§l${JSON.stringify(playerBlock)}`)

            if (playerArea) {
                if (player.isSneaking || isMimiItem(slot)) {
                    // console.log(`Player ${player.name} is in area ${playerArea.name}`)
                    showLandInfo(player, playerArea)
                }

                if (!isAllowed(player, playerArea)) {
                    if ((playerArea.name).includes('Public')) return
                    player.addEffect("weakness", 20 * 20, { amplifier: 200, showParticles: true })
                }

            } else {
                // console.log(`Player ${player.name} is not in any area`)
            }
        } catch (error) {
            console.log(error)

        }
    })

}

export const blockInteractionHandler = (event, hold, isInteract, isUse) => {
    // if (hold) {
    //     return
    // }
    // let playerBlock = null
    // try {
    //     playerBlock = player.dimension.getBlock(player.location)
    // } catch (error) {
    //     // console.error(' nu uh ' + error)
    //     continue
    // }
    try {

        let altEventLocation

        try {
            altEventLocation = event?.source?.dimension.getBlock(event?.source?.location)
        } catch (error) {
            const suspect = event?.source?.name || event?.player?.name
            console.warn(suspect + ' causing error :< ' + error)
            return
        }

        const eventLocation = event?.block || altEventLocation
        const eventDimension = event?.player?.dimension.id || event?.source?.dimension.id
        const eventSource = event?.source || event?.player

        const whitelistedBlocks = ["minecraft:ender_chest"]

        const area = findAreaByLocation(eventLocation, eventDimension, MimiLandData.getData('mimi_land'))
        if (area) {
            if (isAllowed(eventSource, area)) {
                // console.log(`Player ${event.player.name} is allowed to interact with block ${event.block.location}`)
            } else {
                // console.log(event.block.typeId)
                if (isInteract) {
                    if (whitelistedBlocks.includes(event.block.typeId)) {
                        return
                    }
                }
                
                if (isUse && (area.name).includes('Public')) {
                    //console.log('use use use :>')
                    return
                }

                eventSource.sendMessage(`${config["chat-prefix"]} §c§lAccess denied!§r Spamming may result in penalties.`)
                event.cancel = true
            }
        } else {
            // console.log(`Player ${event.player.name} is not in any area`)
        }
        // console.log(JSON.stringify(area))
    } catch (error) {
        console.error(error)
    }
}

export const explosionHandler = event => {
    const impactedBlocks = event.getImpactedBlocks();
    const allAreas = MimiLandData.getData('mimi_land') || [];

    for (const block of impactedBlocks) {
        if (findAreaByLocation(block, event.dimension.id, allAreas)) {
            event.cancel = true;
            break;
        }
    }
}