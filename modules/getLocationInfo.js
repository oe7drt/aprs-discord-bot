const request = require("request");
const config = require("../config.json");
const Discord = require("discord.js");

let dateOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: config.timezone
};

function titleCase(title) {
  if (title.length > 0) {
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  return;
}

function getLocationInfo(callsign, message) {
  request.get(
    `https://api.aprs.fi/api/get?name=${callsign}&what=loc&apikey=${
      config.aprs_token
    }&format=json`,
    function(error, res, body) {
      if (error) {
        console.log(error);
        return;
      }
      let data = JSON.parse(body);
      if (data.found === 0) {
        message.channel.send(
          "Sorry, I couldn't find that. Please check the call sign and try again."
        );
        return;
      } else {
        let lat = data.entries[0].lat;
        let lng = data.entries[0].lng;
        let altitude = data.entries[0].altitude
          /*? `${data.entries[0].altitude}m (${Math.round(
              data.entries[0].altitude * 3.28084
            )}ft)`
          : "Not available";*/
          ? `${data.entries[0].altitude}m`
          : "0.00m";
        let speed = data.entries[0].speed
          ? `${data.entries[0].speed} km/h`
          : "0";
        let course = data.entries[0].course
          ? `${data.entries[0].course}`
          : "0";
        let comment = data.entries[0].comment
          ? `${data.entries[0].comment}`
          : "No comment";
        let status = data.entries[0].status
          ? `${data.entries[0].status}`
          : "No status";
        let path = data.entries[0].path
          ? `${data.entries[0].path}`
          : "No path";
        if (data.entries[0].status_lasttime) {
          let status_last = new Date(parseInt(data.entries[0].status_lasttime, 10) * 1000);
          var laststat = status_last.toLocaleString("en-US", dateOptions);
          //status += `\nSent on: ${laststat}`;
        }
        let coords = `${lat},${lng}`;
        let timeUpdated = new Date(data.entries[0].time * 1000);
        let miniMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&zoom=17&size=600x300&maptype=terrain&markers=color:red|${coords}&key=${config.gmaps_token}`;
        let title = `APRS Information for ${callsign.toUpperCase()}`;
        let locationEmbed = new Discord.RichEmbed()
          .setColor(config.embed_color)
          .setTitle(title)
          .setAuthor("APRS Bot")
          //.setThumbnail("https://cdn.discordapp.com/avatars/449250687868469258/1709ab4f567c56eaa731518ff621747c.png?size=2048")
          .addField("Coordinates", coords.replace(",", ", "))
          .addField("Last seen", timeUpdated.toLocaleString("en-US", dateOptions));
        if (speed != "0") {
          locationEmbed.addField("Speed", speed);
        }
        if (course !== "0") {
          let cc = parseInt (course, 10);
          let dir = "parse error";

          switch(true) {
            case (cc === 0):
            case (cc === 365):
              dir = "Heading north";
              break;
            case (cc === 90):
              dir = "Heading east";
              break;
            case (cc === 180):
              dir = "Heading south";
              break;
            case (cc === 270):
              dir = "Heading west";
              break;
            case (cc < 90):
              dir = "Heading north-east";
              break;
            case (cc < 180):
              dir = "Heading south-east";
              break;
            case (cc < 270):
              dir = "Heading south-west";
              break;
            case (cc < 365):
              dir = "Heading north-west";
              break;
            default:
              dir = "parse error";
          }

          dir += ` (${cc} °)`;


          locationEmbed.addField("Direction", dir);
        }
        if (altitude !== "0.00m") {
          locationEmbed.addField("Altitude", altitude);
        }
        if (comment !== "No comment") {
          locationEmbed.addField("Comment", comment);
        }
        if (status !== "No status") {
          locationEmbed.addField(`Status (${laststat})`, status);
        }
        if (path !== "No path") {
          locationEmbed.addField("Path", path);
        }
        /*locationEmbed.addField(
            "Google Maps",
            `https://www.google.com/maps/search/?api=1&query=${coords}`
          )*/
          locationEmbed.addField(
            "APRS.fi",
            `https://aprs.fi/#!mt=roadmap&z=11&call=a%2F${callsign.toUpperCase()}&timerange=3600&tail=3600`
          )
          .setImage(miniMapUrl)
          //.addField("Path", 
          .setTimestamp()
          .setFooter("Data sourced from https://aprs.fi/");
        message.channel.send({ embed: locationEmbed });
        return;
      }
    }
  );
}

module.exports = getLocationInfo;
