import { system } from "@minecraft/server"
import { config } from "./config"

const isMimiItem = itemStack => {
    return itemStack.typeId === config["mimi-item"] && itemStack.nameTag === config["mimi-item-nametag"]
}

const syllables = ["ae", "bri", "cal", "dor", "el", "fae", "glo", "hav", "il", "jor", "kae", "lum", "mor", "nyx", "or", "pyr", "qua", "ril", "syl", "tor", "um", "vel", "wyr", "xan", "yth", "zar"]

function generateFantasyName(short = false) {
    const generateWord = () => {
        const syllableCount = Math.random() < 0.5 ? 2 : 3
        let word = ""
        for (let i = 0; i < syllableCount; i++) {
            word += syllables[Math.floor(Math.random() * syllables.length)]
        }
        return word.charAt(0).toUpperCase() + word.slice(1)
    }

    return short ? generateWord() : `${generateWord()} ${generateWord()}`
}

const readableCoords = ({x, y, z}) => `X: ${x}, Y: ${y}, Z: ${z}`;

function formatDimensionName(dimensionId) {
    const name = dimensionId.split(':')[1].replace(/_/g, ' ')
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function sleep(ticks) {
    return new Promise(resolve => {
        system.runTimeout(() => {
            resolve()
        }, ticks)
    })
}


export { isMimiItem, generateFantasyName, readableCoords, formatDimensionName, sleep }