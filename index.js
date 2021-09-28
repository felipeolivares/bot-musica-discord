const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client();

// COLOCAR TOKEN DO BOT
const TOKEN = '';

const prefix = '!'

const servers = {
    'server': {
        connection: null,
        dispatcher: null
    }
}

client.on("ready", () => {
    console.log("estou online!")
});

client.on("message", async (msg) => {

    // filtro
    if (!msg.guild) return;

    if (!msg.content.startsWith(prefix)) return;

    if (!msg.member.voice.channel){
        msg.channel.send('Entra em um canal de voz!');
        return;
    };


    // comandos
    //bot de música
    if (msg.content.startsWith(prefix + 'play')) { // !play <link>
        try {
            servers.server.connection = await msg.member.voice.channel.join();
            let linkToPlay = msg.content.slice(6);
            if (ytdl.validateURL(linkToPlay)) {
              servers.server.dispatcher = servers.server.connection.play(ytdl(linkToPlay, {filter: 'audioonly'}))
            }
         else {
           msg.channel.send('Link inválido!');
       }
        } catch (error) {
            console.log("erro ao entrar no canal ", error);
        }
       
    }

    if (msg.content === prefix + 'stop') { // !join
        msg.member.voice.channel.leave();
        servers.server.connection = null;
        servers.server.dispatcher = null;
    }

    if (msg.content === prefix + 'pause') { // !pause
        servers.server.dispatcher.pause();
    }
    if (msg.content === prefix + 'resume') { // !resume
        servers.server.dispatcher.resume();
    }
});

client.login(TOKEN);