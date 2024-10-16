// import { http, HttpRequest, HttpHeader, HttpRequestMethod } from "@minecraft/server-net"

// export class MimiLandAPI {
//     static async sendData(endpoint, data) {
//         const serverUrl = "http://localhost:3000/api/"
//         const url = serverUrl + endpoint

//         // console.log(`Sending data to ${url}`)
//         // console.log(`Data: ${JSON.stringify(data)}`)

//         const request = new HttpRequest(url)
//         request.method = HttpRequestMethod.Post
//         request.body = JSON.stringify(data)
//         request.headers = [
//             new HttpHeader("Content-Type", "application/json"),
//             new HttpHeader("User-Agent", "MimiLand-Minecraft")
//         ]

//         try {
//             const response = await http.request(request)
//             return JSON.parse(response.body)
//         } catch (error) {
//             console.warn(`Failed to send data: ${error.message}`)
//             return null
//         }
//     }
// }
