import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "./config";
import { formatDimensionName, generateFantasyName, readableCoords } from "./utils";

export class MimiLandGUI {
    static openMenu(player, selectedCoords) {
        const mimiMenu = new ActionFormData()

        mimiMenu.title("§lMimi Land§r Menu")
        mimiMenu.body(`\nManage your ${config["chat-prefix"]} here.\n `)

        const buttonOptions = [
            ["§lBase§r\n§o§8Owned Land", "textures/ui/icon_recipe_nature.png"],
            ["§lY's Base§r§4 (yotbu)\n§o§8Shared Land", "textures/ui/multiplayer_glyph_color.png"],
            ["§lABOUT", null, () => this.handleAbout(player, selectedCoords)]
        ]

        if (selectedCoords.has(player)) {
            buttonOptions.unshift(["§l§4CANCEL SELECTION", null, () => this.handleCancelSelection(player, selectedCoords)])
            if (selectedCoords.get(player).length >= 2) {
                buttonOptions.unshift(["§l§2CREATE LAND", null, () => this.handleCreateLand(player, selectedCoords)])
            }
        }
        if (player.hasTag("mimi")) {
            buttonOptions.push(["§l§4ADMIN PANEL"])
        }

        buttonOptions.forEach(([text, icon]) => {
            mimiMenu.button(text, icon)
        })

        mimiMenu.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            const selectedOption = buttonOptions[selection]
            if (selectedOption && typeof selectedOption[2] === "function") {
                selectedOption[2]()
            }
        })
    }

    static handleAbout(player, selectedCoords) {
        const aboutMenu = new ActionFormData()

        aboutMenu.title("About §lMimi Land")
        const aboutText = [
            `Protect your land with ${config["chat-prefix"]}!`,
            `This addon draws inspiration from "§l§4Land Claim§r", an addon created by §o§a=> shadowgamer100k <=§r`,
            `Open Source Minecraft Bedrock Edition addon for protecting land against griefing.`,
            `Download and contribute at: \ngithub.com/afarhansib/mimi-land`,
            `made with  by §l§6yotbu§r.`,
        ]
        aboutMenu.body(aboutText.join("\n\n") + "\n\n")
        aboutMenu.button("§lBACK")

        aboutMenu.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            this.openMenu(player, selectedCoords)
        })
    }

    static handleCancelSelection(player, selectedCoords) {
        const confirmModal = new MessageFormData()
            .title("Confirm Cancellation")
            .body("Are you sure you want to cancel the current land selection?")
            .button2("Yes, Cancel")
            .button1("No, Keep Selection")

        confirmModal.show(player).then(({ selection }) => {
            if (selection === 1) {
                selectedCoords.delete(player)
                player.sendMessage(`${config["chat-prefix"]} §lSelection cancelled.`)
            } else {
                this.openMenu(player, selectedCoords)
            }
        })
    }

    static handleCreateLand(player, selectedCoords) {
        const createLandModal = new ModalFormData()
            .title("Create Land")
            .textField("Land Name", "Enter a name for your land", generateFantasyName())
            .dropdown("First Position §l§4(not editable)", [readableCoords(selectedCoords.get(player)[0])])
            .dropdown("Second Position §l§4(not editable)", [readableCoords(selectedCoords.get(player)[1])])
            .dropdown("Dimension §l§4(not editable)", [formatDimensionName(player.dimension.id)])
            .submitButton("§lCREATE")

        createLandModal.show(player).then(({ canceled, formValues }) => {
            if (canceled) return
            const landName = formValues[0]
            const landDescription = formValues[1]
            const landPrice = formValues[2]
        })
    }
}