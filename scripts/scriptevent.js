import { system, world } from "@minecraft/server";
import { MimiLandData } from "./db";
import { MimiLandAPI } from "./net";
import { mimiLandRunner } from "./protection";
import { generateFantasyName, nanoid, toIsoStringWTZ } from "./utils";

export const scriptEventHandler = async e => {
    switch (e.id) {
        case "mimi:land-print":
            const mimiData = MimiLandData.getData('mimi_land')
            console.log(`Mimi Land Data Length: ${JSON.stringify(mimiData).length}`)
            console.log(JSON.stringify(mimiData, null, 2))
            // const result = await MimiLandAPI.sendData("data", mimiData);
            // console.log(JSON.stringify(result))
            break;
        case "mimi:land-clear":
            MimiLandData.clearData('mimi_land')
            break;
        case "mimi:land-size":
            console.log(world.getDynamicPropertyTotalByteCount())
            break;
        case "mimi:land-zeroed":
            console.log(world.getDynamicPropertyIds())
            world.getDynamicPropertyIds().forEach((id) => {
                const value = world.getDynamicProperty(id)
                // console.log(`Dynamic property ${id} has value ${value}`)
                world.setDynamicProperty(id, undefined)
            })
            break;
        case "mimi:land-print-all":
            const dynamicProperties = {};
            world.getDynamicPropertyIds().forEach((id) => {
                const value = world.getDynamicProperty(id)
                console.log(`Dynamic property ${id} has value `);
                dynamicProperties[id] = JSON.parse(value);
            });
            // console.log(JSON.stringify(dynamicProperties, null, 2));
            // console.log('Mimi Land Data Length: ' + JSON.stringify(dynamicProperties).length)
            // MimiLandAPI.sendData("data", dynamicProperties);
            break;
        case "mimi:md":
            world.getDimension('overworld').runCommandAsync(`inputpermission set yotbu movement disabled`)
            break;
        case "mimi:me":
            world.getDimension('overworld').runCommandAsync(`inputpermission set yotbu movement enabled`)
            break;
        case "mimi:landge":
            let startX = 470
            let Y = [64, 72]
            let Z = [325, 335]
            let i = 0

            system.runInterval(() => {
                if (i < 100) {
                    const landName = generateFantasyName()
                    MimiLandData.addData(`mimi_land`, {
                        name: landName,
                        id: nanoid(),
                        owner: generateFantasyName(true),
                        from: { "x": startX - i, "y": Y[0], "z": Z[0] },
                        to: { "x": startX - i, "y": Y[1], "z": Z[1] },
                        dimension: "minecraft:overworld",
                        created: toIsoStringWTZ(new Date())
                    })
                    world.getDimension('overworld').runCommandAsync(`say creating ${landName}`)
                    i++
                }
            }, 10)

            break;
        default:
            break;
    }
}