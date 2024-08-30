import { config } from "./config"

const isMimiItem = itemStack => {
    return itemStack.typeId === config["mimi-item"] && itemStack.nameTag === config["mimi-item-nametag"]
}

export { isMimiItem }