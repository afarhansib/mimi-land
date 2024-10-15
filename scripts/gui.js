import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { config } from "./config";
import { cleanNames, formatDimensionName, generateFantasyName, getSelectedNames, nanoid, readableCoords, sortOwners, toIsoStringWTZ } from "./utils";
import { system, world } from "@minecraft/server";
import { MimiLandData } from "./db";

export class MimiLandGUI {
    static openMenu(player, selectedCoords, ParticleRunner) {
        const mimiMenu = new ActionFormData()

        mimiMenu.title("§lMimi Land§r Menu")
        mimiMenu.body(`\nManage your ${config["chat-prefix"]} here.\n `)

        const buttonOptions = [
            // ["§lBase§r\n§o§8Owned Land", "textures/ui/icon_recipe_nature.png"],
            // ["§lY's Base§r§4 (yotbu)\n§o§8Shared Land", "textures/ui/multiplayer_glyph_color.png"],
            ["§lABOUT", null, () => this.handleAbout(player, selectedCoords)]
        ]

        const allAreas = MimiLandData.getData("mimi_land") || []
        const userAreas = []
        const sharedAreas = []

        allAreas.forEach(item => {
            if (item.owner === player.name) {
                userAreas.push(item)
            } else if (item.whitelisted?.includes(player.name)) {
                sharedAreas.push(item)
            }
        })
        // console.log(userAreas)

        sharedAreas.forEach((item, index) => {
            buttonOptions.unshift([`§l${item.name}§r§4 (${item.owner})§r\n§o§8Shared Land`, "textures/ui/multiplayer_glyph_color.png", () => this.handleLandDetails(player, item, selectedCoords, true)])
        })

        userAreas.forEach((item, index) => {
            buttonOptions.unshift([`§l${item.name}§r\n§o§8Owned Land`, "textures/ui/icon_recipe_nature.png", () => this.handleLandDetails(player, item, selectedCoords)])
        })

        if (selectedCoords.has(player)) {
            buttonOptions.unshift(["§l§4CANCEL SELECTION", null, () => this.handleCancelSelection(player, selectedCoords, ParticleRunner)])
            if (selectedCoords.get(player).length >= 2) {
                buttonOptions.unshift(["§l§2CREATE LAND", null, () => this.handleCreateLand(player, selectedCoords, ParticleRunner)])
            }
        }
        if (player.hasTag(config["admin-tag"])) {
            buttonOptions.push(["§l§4ADMIN PANEL", null, () => this.handleAdminPanel(player, selectedCoords)])
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

    static handleCancelSelection(player, selectedCoords, ParticleRunner) {
        const confirmModal = new MessageFormData()
            .title("Confirm Cancellation")
            .body("Are you sure you want to cancel the current land selection?")
            .button2("Yes, Cancel")
            .button1("No, Keep Selection")

        confirmModal.show(player).then(({ selection }) => {
            if (selection === 1) {
                selectedCoords.delete(player)
                system.clearRun(ParticleRunner)
                player.sendMessage(`${config["chat-prefix"]} §lSelection cancelled.`)
            } else {
                this.openMenu(player, selectedCoords)
            }
        })
    }

    static handleCreateLand(player, selectedCoords, ParticleRunner) {
        const createLandModal = new ModalFormData()
            .title("Create Land")
            .textField("Land Name", "Enter a name for your land", generateFantasyName())
            .dropdown("First Position §l§4(not editable)", [readableCoords(selectedCoords.get(player)[0])])
            .dropdown("Second Position §l§4(not editable)", [readableCoords(selectedCoords.get(player)[1])])
            .dropdown("Dimension §l§4(not editable)", [formatDimensionName(player.dimension.id)])
            .submitButton("§lCREATE")

        createLandModal.show(player).then(({ canceled, formValues }) => {
            if (canceled) return
            // console.log(formValues)
            const landName = formValues[0]
            MimiLandData.addData(`mimi_land`, {
                name: landName,
                id: nanoid(),
                owner: player.name,
                from: selectedCoords.get(player)[0],
                to: selectedCoords.get(player)[1],
                dimension: player.dimension.id,
                created: toIsoStringWTZ(new Date())
            })
            player.sendMessage(`${config["chat-prefix"]} §lLand §r§a"${landName}"§r§l created!`)
            system.clearRun(ParticleRunner)
            selectedCoords.delete(player)
        })
    }

    static handleAdminPanel(player, selectedCoords) {
        const allLands = MimiLandData.getData(`mimi_land`)
        const allOwners = MimiLandData.getOwner()

        // console.log(JSON.stringify(allOwners))

        const stats = [
            `\n${config["chat-prefix"]} Statistics:\n `,
            `§lTotal Lands: §r§a${allLands.length}§r`,
            `§lTotal Owner: §r§a${allOwners.length}§r`,
            `\n`
        ]

        const adminPanel = new ActionFormData()
        adminPanel.title("§lMimi Land§r Admin")
        adminPanel.body(stats.join("\n"))

        const buttonActions = [
            {
                text: "§lBACK",
                action: () => this.openMenu(player, selectedCoords)
            }
        ]

        if (allOwners.length > 0) {
            buttonActions.unshift({
                text: "§lALL OWNERS\n§r§o§8by total",
                action: () => this.handleAllOwners(player, selectedCoords, allOwners, allLands, 'by total')
            })
            buttonActions.unshift({
                text: "§lALL OWNERS\n§r§o§8by alphabet",
                action: () => this.handleAllOwners(player, selectedCoords, allOwners, allLands, 'by alphabet')
            })
        }

        if (allLands.length > 0) {
            buttonActions.unshift({
                text: "§lALL LANDS\n§r§o§8by created",
                action: () => this.handleAllLands(player, selectedCoords, allLands, 'by created')
            })
            buttonActions.unshift({
                text: "§lALL LANDS\n§r§o§8by alphabet",
                action: () => this.handleAllLands(player, selectedCoords, allLands, 'by alphabet')
            })
        }

        buttonActions.forEach(({ text, action }) => {
            adminPanel.button(text)
        })

        adminPanel.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            buttonActions[selection].action()
        })

    }

    static handleLandDetails(player, area, selectedCoords, asShared = false) {
        const landDetailsModal = new ActionFormData()

        landDetailsModal.title(`${area.name}'s Details`)
        const landDetails = [
            `§lLand Name: §r§a${area.name}§r`,
            `§lOwner: §r§a${area.owner}§r`,
            `§lCreated: §r§a${area.created}§r`,
            `§lFrom: §r§a${readableCoords(area.from)}§r`,
            `§lTo: §r§a${readableCoords(area.to)}§r`,
            `§lDimension: §r§a${formatDimensionName(area.dimension)}§r`
        ]

        if (area.whitelisted?.length > 0) {
            landDetails.push(`§lWhitelisted: §r§a${area.whitelisted.join(", ")}§r`)
        }

        landDetailsModal.body(`\n${landDetails.join("\n")}\n\n`)

        const buttonActions = [
            {
                text: "§lBACK",
                action: () => this.openMenu(player, selectedCoords)
            }
        ]

        if (asShared) {
            buttonActions.unshift({
                text: "§l§4REMOVE YOURSELF",
                action: () => this.handleRemoveYourself(player, area, selectedCoords)
            })
        } else {
            buttonActions.unshift({
                text: "§lMODIFY LAND",
                action: () => this.handleModifyLand(player, area, selectedCoords)
            },
                {
                    text: "§l§4DELETE LAND",
                    action: () => this.handleDeleteLand(player, area, selectedCoords)
                })
        }

        buttonActions.forEach(({ text, action }) => {
            landDetailsModal.button(text)
        })

        landDetailsModal.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            buttonActions[selection].action()
        })
    }

    static handleDeleteLand(player, area, selectedCoords) {
        const confirmModal = new MessageFormData()
            .title(`Delete ${area.name}?`)
            .body("This cannot be undone. Are you sure you want to delete this land?")
            .button2("Yes, Delete")
            .button1("No, Keep Land")

        confirmModal.show(player).then(({ selection }) => {
            if (selection === 1) {
                MimiLandData.deleteDataById(`mimi_land`, area.id)
                player.sendMessage(`${config["chat-prefix"]} §lLand §r§a"${area.name}"§r§l deleted!`)
            } else {
                this.openMenu(player, selectedCoords)
            }
        })
    }

    static handleRemoveYourself(player, area, selectedCoords) {
        const confirmModal = new MessageFormData()
            .title(`Remove Yourself from ${area.name}?`)
            .body("This cannot be undone. Are you sure you want to remove your access to this land?")
            .button2("Yes, Remove")
            .button1("No, Keep Whitelist")

        confirmModal.show(player).then(({ selection }) => {
            if (selection === 1) {
                const newWhitelist = area.whitelisted.filter(name => name !== player.name)
                MimiLandData.updateDataById(`mimi_land`, area.id, { whitelisted: newWhitelist })
                player.sendMessage(`${config["chat-prefix"]} You've been removed from §r§a"${area.name}"§r§l!`)
                this.openMenu(player, selectedCoords)
            } else {
                this.openMenu(player, selectedCoords)
            }
        })
    }

    static handleModifyLand(player, area, selectedCoords) {
        let allPlayersNoOwner = world.getAllPlayers().map(player => player.name).filter(name => name !== area.owner)
        if (area.whitelisted?.length ?? 0 > 0) {
            allPlayersNoOwner.unshift(...area.whitelisted)
            allPlayersNoOwner = [...new Set(allPlayersNoOwner)]
        }

        const createLandModal = new ModalFormData()
            .title(`Modify ${area.name}`)
            .textField("New Land Name", "Enter a name for your land", area.name)
            .textField("New Land Owner", "Enter a name for your land's owner", area.owner)
            .dropdown("Or Select New Land Owner", ['§o-select-', ...allPlayersNoOwner])
            .textField("Add Player to Whitelist - §o§7or add from online players below", "Add multiple Name with , (comma)")

        allPlayersNoOwner.forEach(player => {
            createLandModal.toggle(player, area.whitelisted?.includes(player))
        })

        createLandModal.submitButton("§lSAVE")
        createLandModal.show(player).then(({ canceled, formValues }) => {
            if (canceled) return
            const newLandDetails = {
                name: formValues[0]
            }

            newLandDetails.whitelisted = cleanNames(formValues[3])
            newLandDetails.whitelisted = [...new Set([...newLandDetails.whitelisted, ...getSelectedNames(allPlayersNoOwner, formValues)])]

            if (formValues[2] !== 0) {
                newLandDetails.owner = allPlayersNoOwner[formValues[2] - 1]
            } else {
                newLandDetails.owner = formValues[1]
            }

            MimiLandData.updateDataById(`mimi_land`, area.id, newLandDetails)
            player.sendMessage(`${config["chat-prefix"]} §lLand §r§a"${area.name}"§r§l modified!`)

            // console.log(JSON.stringify(allPlayersNoOwner))
            // console.log(JSON.stringify(formValues))
            // console.log(JSON.stringify(newLandDetails))
        })
    }

    static handleAllOwners(player, selectedCoords, owners, lands, sortedBy) {
        const allOwnersPanel = new ActionFormData()
        allOwnersPanel.title(`All §lMimi Land§r Owners`)
        allOwnersPanel.body('\nSorted ' + sortedBy + '\n\n')

        // console.log(JSON.stringify(owners))
        const sortedOwners = sortOwners(owners, sortedBy)

        const buttonActions = []

        sortedOwners.forEach(({ owner, count }) => {
            buttonActions.push({
                text: `${owner} §e[§8§l${count}§e]`,
                action: () => {
                    this.handleAllOwnersLand(player, selectedCoords, owner, lands, count)
                }
            })
        })

        buttonActions.forEach(({ text, action }) => {
            allOwnersPanel.button(text)
        })

        allOwnersPanel.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            buttonActions[selection].action()
        })
    }

    static handleAllOwnersLand(player, selectedCoords, owner, lands, count) {
        const allOwnersLandPanel = new ActionFormData()
        const ownedLands = lands.filter(land => land.owner === owner)

        allOwnersLandPanel.title(`All ${owner}'s Lands`)
        allOwnersLandPanel.body(`\n§l${owner} §r§7has §l${count}§r§7 lands.\n\n`)

        const buttonActions = []

        const sortedLands = ownedLands.sort((a, b) => a.name.localeCompare(b.name))

        sortedLands.forEach(land => {
            buttonActions.push({
                text: `${land.name}`,
                action: () => {
                    this.handleLandDetails(player, land, selectedCoords)
                }
            })
        })

        buttonActions.forEach(({ text, action }) => {
            allOwnersLandPanel.button(text)
        })

        allOwnersLandPanel.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            buttonActions[selection].action()
        })
    }

    static handleAllLands(player, selectedCoords, lands, sortedBy) {
        const allLandsPanel = new ActionFormData()

        allLandsPanel.title(`All §lMimi Land§rs`)
        allLandsPanel.body('\nSorted ' + sortedBy + '\n\n')

        const buttonActions = []
        let sortedLands = lands
        if (sortedBy === 'by alphabet') {
            sortedLands = lands.sort((a, b) => a.name.localeCompare(b.name))
        }

        sortedLands.forEach(land => {
            buttonActions.push({
                text: `${land.name}`,
                action: () => {
                    this.handleLandDetails(player, land, selectedCoords)
                }
            })
        })

        buttonActions.forEach(({ text, action }) => {
            allLandsPanel.button(text)
        })

        allLandsPanel.show(player).then(({ canceled, selection }) => {
            if (canceled) return
            buttonActions[selection].action()
        })
    }
}