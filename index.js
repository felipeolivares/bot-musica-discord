const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const configs = require("./config.json");
const google = require("googleapis");
const client = new Discord.Client();

const youtube = new google.youtube_v3.Youtube({
  version: "v3",
  auth: configs.GOOGLE_KEY,
});

const prefix = configs.PREFIX;

const servers = {
  server: {
    connection: null,
    dispatcher: null,
    queue: [],
    isplaying: false
  },
};

client.on("ready", () => {
  console.log("estou online!");
});

client.on("message", async (msg) => {
  // filtro
  if (!msg.guild) return;

  if (!msg.content.startsWith(prefix)) return;

  if (!msg.member.voice.channel) {
    msg.channel.send("Entra em um canal de voz!");
    return;
  }

  // comandos
  //bot de música
  if (msg.content.startsWith(prefix + "play")) {
    // !play <link>
    let linkToPlay = msg.content.slice(6);

    if (linkToPlay.length === 0) {
      msg.channel.send("Eu preciso de algo para tocar!");
      return;
    }

    if (servers.server.connection === null) {
      try {
        // entrar no servidor
        servers.server.connection = await msg.member.voice.channel.join();
      } catch (error) {
        console.log("erro ao entrar no canal ", error);
      }
    }
    // play com link
    if (ytdl.validateURL(linkToPlay)) {
        servers.server.queue.push(linkToPlay);
        playMusics();
    } else {
      youtube.search.list(
        {
          q: linkToPlay,
          part: "snippet",
          fields: "items(id(videoId),snippet(title))",
          type: "video",
        },
        function (err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            // play sem link, apenas com pesquisa do nome da música
            const id = result.data.items[0].id.videoId;
            linkToPlay = 'https://www.youtube.com/watch?v=' + id;
            servers.server.queue.push(linkToPlay);
            playMusics();
          }
        }
      );
    }
  }

  if (msg.content === prefix + "stop") {
    // !stop
    msg.member.voice.channel.leave();
    servers.server.connection = null;
    servers.server.dispatcher = null;
    servers.server.queue = [],
    servers.server.isplaying = false;
  }

  if (msg.content === prefix + "pause") {
    // !pause
    servers.server.dispatcher.pause();
  }
  if (msg.content === prefix + "resume") {
    // !resume
    servers.server.dispatcher.resume();
  }
});

const playMusics = () => {
    if (servers.server.isplaying === false) {
        const playing = servers.server.queue[0];
        servers.server.isplaying = true;
        servers.server.dispatcher = servers.server.connection.play(
            ytdl(playing, configs.YTDL));
    
        servers.server.dispatcher.on('finish', () => {
            servers.server.queue.shift();
            servers.server.isplaying = false;
            if (servers.server.queue.length > 0) {
                playMusics();
            } else {
                servers.server.dispatcher = null;
            }
        });

    }

}

client.login(configs.TOKEN_DISCORD);
