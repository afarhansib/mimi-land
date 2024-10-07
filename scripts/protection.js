import { EquipmentSlot, world } from "@minecraft/server"
import { MimiLandData } from "./db";
import { createParticleBox, findAreaByLocation, formatDimensionName, isAllowed, isMimiItem, readableCoords } from "./utils";
import { config } from "./config";

export const mimiLandRunner = () => {
    const allArea = MimiLandData.getData('mimi_land')

    for (const player of world.getPlayers()) {
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
        if (!player.isSneaking && !isMimiItem(slot)) {
            continue;
        }
        
        try {
            // player.sendMessage(`${JSON.stringify(player.location)}`)
            const playerBlock = player.dimension.getBlock(player.location)
            const playerArea = findAreaByLocation(playerBlock, player.dimension.id, allArea)

            // player.onScreenDisplay.setActionBar(`§l${JSON.stringify(playerBlock)}`)

            if (playerArea) {
                // console.log(`Player ${player.name} is in area ${playerArea.name}`)
                createParticleBox(player.dimension, playerArea.from, playerArea.to)
                const landDetails = [
                    `${config["chat-prefix"]}\n`,
                    `§lName: §r§a${playerArea.name}§r`,
                    `§lOwner: §r§a${playerArea.owner}§r`,
                    // `§lFrom: §r§a${readableCoords(playerArea.from)}§r`,
                    // `§lTo: §r§a${readableCoords(playerArea.to)}§r`
                ]
                player.onScreenDisplay.setActionBar(landDetails.join("\n"))
                
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

    const whitelistedBlocks = ["minecraft:ender_chest"]
    
    try {
        const area = findAreaByLocation(event.block, event.player.dimension.id, MimiLandData.getData('mimi_land'))
        if (area) {
            if (isAllowed(event.player, area)) {
                // console.log(`Player ${event.player.name} is allowed to interact with block ${event.block.location}`)
            } else {
                // console.log(event.block.typeId)
                if (isInteract) {
                    if (whitelistedBlocks.includes(event.block.typeId)) {
                        return
                    }
                }
                event.player.sendMessage(`${config["chat-prefix"]} §c§lAccess denied!§r Spamming may result in penalties.`)
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