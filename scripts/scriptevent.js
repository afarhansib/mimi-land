// import { world } from "@minecraft/server";
// import { MimiLandData } from "./db";
// import { MimiLandAPI } from "./net";
// import { mimiLandRunner } from "./protection";

// export const scriptEventHandler = async e => {
//     switch (e.id) {
//         case "mimi:land-print":
//             const mimiData = MimiLandData.getData('mimi_land')
//             console.log(`Mimi Land Data Length: ${JSON.stringify(mimiData).length}`)
//             console.log(JSON.stringify(mimiData, null, 2))
//             const result = await MimiLandAPI.sendData("data", mimiData);
//             console.log(JSON.stringify(result))
//             break;
//         case "mimi:land-clear":
//             MimiLandData.clearData('mimi_land')
//             break;
//         case "mimi:land-size":
//             console.log(world.getDynamicPropertyTotalByteCount())
//             break;
//         case "mimi:land-zeroed":
//             console.log(world.getDynamicPropertyIds())
//             world.getDynamicPropertyIds().forEach((id) => {
//                 const value = world.getDynamicProperty(id)
//                 // console.log(`Dynamic property ${id} has value ${value}`)
//                 world.setDynamicProperty(id, undefined)
//             })
//             break;
//         case "mimi:land-print-all":
//             const dynamicProperties = {};
//             world.getDynamicPropertyIds().forEach((id) => {
//                 const value = world.getDynamicProperty(id);
//                 dynamicProperties[id] = JSON.parse(value);
//             });
//             // console.log(JSON.stringify(dynamicProperties, null, 2));
//             console.log('Mimi Land Data Length: ' + JSON.stringify(dynamicProperties).length)
//             MimiLandAPI.sendData("data", dynamicProperties);
//             break;
//         case "mimi:md":
//             world.getDimension('overworld').runCommandAsync(`inputpermission set yotbu movement disabled`)
//             break;
//         case "mimi:me":
//             world.getDimension('overworld').runCommandAsync(`inputpermission set yotbu movement enabled`)
//             break;
//         default:
//             break;
//     }
// }