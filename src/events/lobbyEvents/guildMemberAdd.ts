import Canvas, { loadImage } from "canvas";
import { AttachmentBuilder, ClientEvents, Colors, EmbedBuilder, Guild, GuildMember, TextChannel } from "discord.js";

import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import welcomeSchema from "../../models/welcomeModel";
import { BOT_VERSION } from "../../utils/constants";
class GuildMemberAdd implements IEvent {
  name: keyof ClientEvents = "guildMemberAdd";
  once = false;

  async execute(member: GuildMember): Promise<void> {
    const guild = member.guild as Guild;
    const guildId: string = guild?.id;
    try {
      const data = await welcomeSchema.findOne({ guild_id: guildId });
      if (!data || !data.channel_id) {
        return;
      }
      const client = BotClient.getInstance();
      const channel = client.channels.cache.get(data?.channel_id);
      const role = data.role_id;

      if (!channel) {
        return;
      }
      const canvas = Canvas.createCanvas(700, 250);
      const context = canvas.getContext("2d");

      const background = await loadImage("https://imgur.com/quToDFm.png");
      context.drawImage(background, 0, 0, canvas.width, canvas.height);

      context.strokeStyle = "#000000";
      context.strokeRect(0, 0, canvas.width, canvas.height);

      context.font = "28px sans-serif";
      context.fillStyle = "#ffffff";
      context.fillText("WELCOME!", canvas.width / 2.5, canvas.height / 3.5);

      context.font = "22px sans-serif";
      context.fillStyle = "#ffffff";
      context.fillText(member.user.username, canvas.width / 2.5, canvas.height / 1.8);

      context.font = "16px sans-serif";
      context.fillStyle = "#ffffff";
      context.fillText(`Welcome to ${member.guild.name}`, canvas.width / 2.5, canvas.height / 1.2);

      context.font = "16px sans-serif";
      context.fillStyle = "#ffffff";
      context.fillText(`– ${member.guild.memberCount}th member!`, canvas.width / 2.5, canvas.height / 1.1);

      context.beginPath();
      context.arc(125, 125, 100, 0, Math.PI * 2, true);
      context.closePath();
      context.clip();

      const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "jpg" }));
      context.drawImage(avatar, 25, 25, 200, 200);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

      const embed = new EmbedBuilder()
        .setTitle("👋 A new user has joined the server!")
        .setColor(Colors.Green)
        .setImage("attachment://welcome-image.png")
        .setTimestamp()
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      if (channel instanceof TextChannel) {
        await channel.send({ embeds: [embed], files: [attachment] }).then(() => {
          if (role) {
            member.roles.add(role);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export default GuildMemberAdd;
