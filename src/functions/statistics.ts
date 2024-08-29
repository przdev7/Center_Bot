import ms from "ms";
import BotClient from "../client";
import statsSchema from "../models/statsModel";
function statistics(): void {
  setInterval(async () => {
    try {
      const client = BotClient.getInstance();
      const data = await statsSchema.find();
      if (data.length > 0) {
        data.forEach((doc: { channel_id: string; guild_id: string }) => {
          const { channel_id, guild_id } = doc;
          const guild = client.guilds.cache.get(guild_id);
          const channel = guild?.channels.cache.get(channel_id);
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
  }, ms("5m")); // TODO: finish statistics
}

export default statistics;
