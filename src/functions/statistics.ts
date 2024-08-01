import BotClient from "../client";
import statsSchema from "../models/statsModel";
function statistics(): void {
  setInterval(async () => {
    try {
      const client = BotClient.getInstance();
      const data = await statsSchema.find();
      if (data.length > 0) {
        data.forEach((doc: { channel_id: string; guild_id: string }) => {
          const channelId = doc.channel_id;
          const guildId = doc.guild_id;
          const guild = client.guilds.cache.get(guildId);
          const channel = guild?.channels.cache.get(channelId);
          try {
            channel?.setName(`Members on server: ${guild?.memberCount}`);
          } catch (error) {
            console.error(error);
          }
        });
      } else {
        console.log("no data");
      }
    } catch (error) {
      console.error(error);
    }
  }, 10000); // TODO: finish statistics
}

export default statistics;
