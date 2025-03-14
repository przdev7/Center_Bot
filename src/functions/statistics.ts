import ms from "ms";
import BotClient from "../client";
import { ChannelType } from "discord.js";
import statsSchema from "../models/statsModel";

function statistics(): void {
  setInterval(async () => {
    try {
      const client = BotClient.getInstance();
      const data = await statsSchema.find();

      if (data.length > 0) {
        for (const doc of data) {
          const { channel_id, guild_id, format } = doc;

          const guild = client.guilds.cache.get(guild_id);
          if (!guild) {
            console.log(`Guild not found: ${guild_id}`);
            continue;
          }

          const channel = guild.channels.cache.get(channel_id);
          if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildVoice)) {
            console.log(`Invalid channel: id: ${channel_id} in guild id: ${guild_id}`);
            continue;
          }

          const members = await guild.members.fetch();
          const memberCount = guild.memberCount || 0;
          const totalUsers = members.filter((member) => !member.user.bot).size;
          const totalBots = memberCount - totalUsers;

          const formattedName = format
            .replace("{members}", memberCount.toString())
            .replace("{totalUsers}", totalUsers.toString())
            .replace("{totalBots}", totalBots.toString());

          try {
            await channel.setName(formattedName);
          } catch (error) {
            console.error(`g id: ${guild_id}, ch id: ${channel_id}:`, error);
          }
        }
      } else {
        console.log("No data in db");
      }
    } catch (error) {
      console.error("Err", error);
    }
  }, ms("10m"));
}

export default statistics;
