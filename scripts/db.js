import { world } from "@minecraft/server"

export class MimiLandData {
    static setData(key, data) {
        const chunks = this.chunkData(JSON.stringify(data))
        for (let i = 0; i < chunks.length; i++) {
            world.setDynamicProperty(`${key}_chunk_${i}`, chunks[i])
        }
        world.setDynamicProperty(`${key}_chunks`, chunks.length)
    }

    static getData(key) {
        const chunkCount = world.getDynamicProperty(`${key}_chunks`)
        if (!chunkCount) return null;
        let data = ''
        for (let i = 0; i < chunkCount; i++) {
            data += world.getDynamicProperty(`${key}_chunk_${i}`) || '';
        }
        return this.safeJSONParse(data);
    }    

    static addData(key, newEntry) {
        let existingData = this.getData(key) || [];
        existingData.push(newEntry);
        this.setData(key, existingData);
    }

    static clearData(key) {
        const chunkCount = world.getDynamicProperty(`${key}_chunks`)
        for (let i = 0; i < chunkCount; i++) {
            world.setDynamicProperty(`${key}_chunk_${i}`, undefined)
        }
        world.setDynamicProperty(`${key}_chunks`, 0)
    }

    static chunkData(str, size = 30000) {
        return str.match(new RegExp(`.{1,${size}}`, 'g')) || []
    }

    static safeJSONParse(data) {
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (error) {
            console.warn(`Failed to parse JSON: ${error.message}`);
            return null;
        }
    }
    
}
