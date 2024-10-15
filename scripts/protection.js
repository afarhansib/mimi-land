import { EquipmentSlot, world } from "@minecraft/server"
import { MimiLandData } from "./db";
import { createParticleBox, findAreaByLocation, formatDimensionName, isAllowed, isMimiItem, readableCoords, showLandInfo } from "./utils";
import { config } from "./config";

const playerLastAreas = new Map()

export const mimiLandRunner = () => {
    const allArea = MimiLandData.getData('mimi_land')

    for (const player of world.getPlayers()) {
        try {
            const dimension = world.getDimension(player.dimension.id)
            const withers = dimension.getEntities({ type: "minecraft:wither" });
            for (const wither of withers) {
                const witherBlock = dimension.getBlock(wither.location);
                const witherArea = findAreaByLocation(witherBlock, dimension.id, allArea);
                if (witherArea) {
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
                // console.error(' nu uh ' + error)
                continue
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
                if (!isAllowed(player, playerArea)) {
                    player.addEffect("weakness", 20 * 2, { amplifier: 255, showParticles: false })
                }
                if (player.isSneaking || isMimiItem(slot)) {
                    // console.log(`Player ${player.name} is in area ${playerArea.name}`)
                    showLandInfo(player, playerArea)
                }

            } else {
                // console.log(`Player ${player.name} is not in any area`)
            }
        } catch (error) {
            console.log(error)

        }
    }

}

export const blockInteractionHandler = (event, hold, isInteract) => {
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