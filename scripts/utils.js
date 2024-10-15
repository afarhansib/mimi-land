import { system } from "@minecraft/server"
import { config } from "./config"

export const isMimiItem = itemStack => {
    try {
        return itemStack?.typeId === config["mimi-item"] && itemStack?.nameTag === config["mimi-item-nametag"]
    } catch (error) {
        return false
    }
}

const syllables = ["ae", "bri", "cal", "dor", "el", "fae", "glo", "hav", "il", "jor", "kae", "lum", "mor", "nyx", "or", "pyr", "qua", "ril", "syl", "tor", "um", "vel", "wyr", "xan", "yth", "zar"]

export function generateFantasyName(short = false) {
    const generateWord = () => {
        const syllableCount = Math.random() < 0.5 ? 2 : 3
        let word = ""
        for (let i = 0; i < syllableCount; i++) {
            word += syllables[Math.floor(Math.random() * syllables.length)]
        }
        return word.charAt(0).toUpperCase() + word.slice(1)
    }

    return short ? (generateWord()).toLowerCase() : `${generateWord()} ${generateWord()}`
}

export const readableCoords = ({ x, y, z }) => `X: ${x}, Y: ${y}, Z: ${z}`;

export function formatDimensionName(dimensionId) {
    const name = dimensionId.split(':')[1].replace(/_/g, ' ')
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function sleep(ticks) {
    return new Promise(resolve => {
        system.runTimeout(() => {
            resolve()
        }, ticks)
    })
}

export function createParticleBox(dimension, pos1, pos2) {
    const minX = Math.min(pos1.x, pos2.x);
    const minY = Math.min(pos1.y, pos2.y);
    const minZ = Math.min(pos1.z, pos2.z);
    const maxX = Math.max(pos1.x, pos2.x) + 1;
    const maxY = Math.max(pos1.y, pos2.y) + 1;
    const maxZ = Math.max(pos1.z, pos2.z) + 1;
    // const particleType = "minecraft:endrod";
    // const particleType = "minecraft:villager_happy";
    const particleType = "minecraft:balloon_gas_particle";

    // Create the edges of the box
    for (let x = minX; x <= maxX; x++) {
        trySpawnParticle(dimension, particleType, { x, y: minY, z: minZ });
        trySpawnParticle(dimension, particleType, { x, y: minY, z: maxZ });
        trySpawnParticle(dimension, particleType, { x, y: maxY, z: minZ });
        trySpawnParticle(dimension, particleType, { x, y: maxY, z: maxZ });
    }

    for (let y = minY; y <= maxY; y++) {
        trySpawnParticle(dimension, particleType, { x: minX, y, z: minZ });
        trySpawnParticle(dimension, particleType, { x: minX, y, z: maxZ });
        trySpawnParticle(dimension, particleType, { x: maxX, y, z: minZ });
        trySpawnParticle(dimension, particleType, { x: maxX, y, z: maxZ });
    }

    for (let z = minZ; z <= maxZ; z++) {
        trySpawnParticle(dimension, particleType, { x: minX, y: minY, z });
        trySpawnParticle(dimension, particleType, { x: minX, y: maxY, z });
        trySpawnParticle(dimension, particleType, { x: maxX, y: minY, z });
        trySpawnParticle(dimension, particleType, { x: maxX, y: maxY, z });
    }
}

function trySpawnParticle(dimension, particleType, location) {
    try {
        dimension.spawnParticle(particleType, location);
    } catch (error) {
        // Ignore the error and continue
    }
}

export function createParticleAroundBlock(dimension, particleType, blockLocation) {
    const { x, y, z } = blockLocation;

    for (let dx = 0; dx <= 1; dx++) {
        for (let dy = 0; dy <= 1; dy++) {
            for (let dz = 0; dz <= 1; dz++) {
                trySpawnParticle(dimension, particleType, { x: x + dx, y: y + dy, z: z + dz });
            }
        }
    }
}

export function toIsoStringWTZ(date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            return (num < 10 ? '0' : '') + num;
        };

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}

const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

export function nanoid(size = 21) {
    let id = ''
    let i = size
    while (i--) {
        id += urlAlphabet[(Math.random() * 64) | 0]
    }
    return id
}

export function isInsideArea(location, dimension, area) {
    const minX = Math.min(area.from.x, area.to.x);
    const maxX = Math.max(area.from.x, area.to.x);
    const minY = Math.min(area.from.y, area.to.y);
    const maxY = Math.max(area.from.y, area.to.y);
    const minZ = Math.min(area.from.z, area.to.z);
    const maxZ = Math.max(area.from.z, area.to.z);

    return dimension === area.dimension &&
        location.x >= minX && location.x <= maxX &&
        location.y >= minY && location.y <= maxY &&
        location.z >= minZ && location.z <= maxZ;
}

export function findAreaByLocation(location, dimension, areas) {
    return areas?.find(area => isInsideArea(location, dimension, area));
}

export const isOwner = (player, area) => player.name === area.owner;

export const isAllowed = (player, area) => {
    return isOwner(player, area) ||
        (area.whitelisted && area.whitelisted.includes(player.name));
};

export function cleanNames(nameString) {
    return nameString.split(',')
        .map(name => name.trim())
        .filter(name => name !== '')
}

export function getSelectedNames(names, formResult) {
    const booleans = formResult.slice(-names.length)
    return names.filter((name, index) => booleans[index])
}

export const showLandInfo = (player, playerArea) => {
    createParticleBox(player.dimension, playerArea.from, playerArea.to)
    const landDetails = [
        `${config["chat-prefix"]}\n`,
        `§lName: §r§a${playerArea.name}§r`,
        `§lOwner: §r§a${playerArea.owner}§r`
    ]
    player.onScreenDisplay.setActionBar(landDetails.join("\n"))
}

export function isOverlapping(newArea, newAreaDimension, existingAreas) {
    // console.log(JSON.stringify(arguments))
    const [newA, newB] = newArea
    const newMin = {
        x: Math.min(newA.x, newB.x),
        y: Math.min(newA.y, newB.y),
        z: Math.min(newA.z, newB.z)
    }
    const newMax = {
        x: Math.max(newA.x, newB.x),
        y: Math.max(newA.y, newB.y),
        z: Math.max(newA.z, newB.z)
    }

    return existingAreas.some(area => {
        const existingMin = {
            x: Math.min(area.from.x, area.to.x),
            y: Math.min(area.from.y, area.to.y),
            z: Math.min(area.from.z, area.to.z)
        }
        const existingMax = {
            x: Math.max(area.from.x, area.to.x),
            y: Math.max(area.from.y, area.to.y),
            z: Math.max(area.from.z, area.to.z)
        }

        return (
            newMin.x <= existingMax.x && newMax.x >= existingMin.x &&
            newMin.y <= existingMax.y && newMax.y >= existingMin.y &&
            newMin.z <= existingMax.z && newMax.z >= existingMin.z &&
            newAreaDimension === area.dimension
        )
    })
}

export function sortOwners(owners, sortedBy) {
    if (sortedBy === 'by alphabet') {
        return owners.sort((a, b) => a.owner.localeCompare(b.owner))
    } else if (sortedBy === 'by total') {
        return owners.sort((a, b) => b.count - a.count)
    }
    return owners // Default case if sortedBy doesn't match
}