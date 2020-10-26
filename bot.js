const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const getLocationInfo = require("./modules/getLocationInfo");
const getWeather = require("./modules/getWeather");

client.on("error", e => {
  console.error(e);
  return;
});

client.on("ready", () => {
  client
    .generateInvite([
      "SEND_MESSAGES",
      "READ_MESSAGES",
      "EMBED_LINKS",
      "ATTACH_FILES"
    ])
    .then(link => {
      console.log(link);
    });
  console.log(
    `APRS Bot firing up with ${client.users.size} users, in ${
      client.channels.size
    } channels of ${client.guilds.size} guilds.`
  );
  //return client.user.setActivity("", { type: "Watching" });
});

client.on("message", message => {
  if (message.author.bot) return;
  //if (message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content
    //.slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  //const command = args.shift();
  /*if (command === "loc") {
    let callsign = args.join("").toLowerCase();
    getLocationInfo(callsign, message);
    return;
  }*/
  const command = args.shift();
  if (command === "weather" || command === "wx") {
    let callsign = args.join("").toLowerCase();
    getWeather(callsign, message);
    return;
  } else if (command === "hilfe" || command === "help") {
    message.channel.send(
      //"**Currently available commands**:\n`?loc callsign` to retrieve location information.\n`?wx callsign` to retrieve weather data."
      "**Usage:**\n`help` to print this help\n`aprs_callsign` to retrieve info about *aprs_callsign*"
    );
    return;
  } else if (command === "info") {
    message.channel.send(
    "Hello, my name is Ron. I show the _last heard station information_ about the station that you type into the channel. Just send the callsign that you want the information about and I will see what I can do for you. If you want more information about a weather station type `wx` or `weather` before the callsign.\n\n_For example_\n**`wx OE7XEI-13`** will show the latest weather information from `OE7XEI-13`, which is a weather station from OE7AAI.\nType **`help`** or **`hilfe`** to get more information about the used commands…"
    );
  } else {
    //let callsign = args.join("").toLowerCase();
    let callsign = command.toLowerCase();
    getLocationInfo(callsign, message);
    return;
  }
});
client.login(config.token);
