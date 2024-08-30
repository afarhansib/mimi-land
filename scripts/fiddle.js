/*
use custom command, with a prefix of `.ml`
*/

world.beforeEvents.chatSend.subscribe((ev) => {
    const msg = ev.message;
    const sender = ev.sender;
    if (msg.startsWith(`.`)) {
        if (msg.startsWith(`.ml`)) {
            sender.sendMessage(`Hello, Mimi!`)
            system.run(() => {
                sender.runCommand(`damage ${sender.name} 1`)
                form.show(sender)
            })
        }
    }
    ev.cancel = true
})