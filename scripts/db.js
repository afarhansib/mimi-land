import { world } from "@minecraft/server"
import { toIsoStringWTZ } from "./utils";

export class MimiLandData {
    static setData(key, data, isInternal = false) {
        // if (!isInternal) {
        //     const oldData = this.getData(key);
        //     this.storeDataHistory(key, oldData);
        // }
        this.clearCache()

        const chunks = this.chunkData(JSON.stringify(data));
        for (let i = 0; i < chunks.length; i++) {
            world.setDynamicProperty(`${key}_chunk_${i}`, chunks[i]);
        }
        world.setDynamicProperty(`${key}_chunks`, chunks.length);

    }

    static cache = new Map()
    static cacheTimestamps = new Map()
    static CACHE_DURATION = 10000 // 10 seconds
    static getData(key) {
        const now = Date.now()
        const cachedData = this.cache.get(key)
        const cacheTime = this.cacheTimestamps.get(key)
        
        // Return cache if valid
        if (cachedData && cacheTime && now - cacheTime < this.CACHE_DURATION) {
            return cachedData
        }
        
        //console.log('cache expired, refreshing mimi land data...')
        
        const chunkCount = world.getDynamicProperty(`${key}_chunks`)
        if (!chunkCount) return null;
        let data = ''
        for (let i = 0; i < chunkCount; i++) {
            data += world.getDynamicProperty(`${key}_chunk_${i}`) || '';
        }
        const parsedData = this.safeJSONParse(data)
        
        // Update cache
        this.cache.set(key, parsedData)
        this.cacheTimestamps.set(key, now)
        
        return parsedData
    }

    static addData(key, newEntry) {
        let existingData = this.getData(key) || [];
        existingData.push(newEntry);
        this.setData(key, existingData);
    }

    static deleteDataById(key, id) {
        let data = this.getData(key) || [];
        data = data.filter(item => item.id !== id);
        this.setData(key, data);
    }

    static updateDataById(key, id, updatedData) {
        let data = this.getData(key) || [];
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedData };
            this.setData(key, data);
        }
    }

    static clearData(key) {
        this.createDataCheckpoint(key)
        this.setData(key, null)
        // const chunkCount = world.getDynamicProperty(`${key}_chunks`)
        // for (let i = 0; i < chunkCount; i++) {
        //     world.setDynamicProperty(`${key}_chunk_${i}`, undefined)
        // }
        // world.setDynamicProperty(`${key}_chunks`, 0)
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

    static storeDataHistory(key, oldData) {
        const history = this.getData(`${key}_history`) || [];
        history.push({ timestamp: toIsoStringWTZ(new Date()), oldData });
        this.setData(`${key}_history`, history, true);
    }

    static createDataCheckpoint(key) {
        const data = this.getData(key);
        const checkpoints = this.getData(`${key}_checkpoints`) || [];
        checkpoints.push({ timestamp: toIsoStringWTZ(new Date()), data });
        this.setData(`${key}_checkpoints`, checkpoints, true);
    }

    static getOwner() {
        const data = this.getData("mimi_land") || []
        const ownerMap = new Map()
    
        data.forEach(area => {
            if (ownerMap.has(area.owner)) {
                ownerMap.set(area.owner, ownerMap.get(area.owner) + 1)
            } else {
                ownerMap.set(area.owner, 1)
            }
        })
    
        return Array.from(ownerMap, ([owner, count]) => ({ owner, count }))
    }    

    static clearCache() {
        this.cache.clear()
        this.cacheTimestamps.clear()
    }
}
