import { model, Schema } from "mongoose";

const statsSchema = new Schema(
  {
    guild_id: { type: String, required: [true, "guild_id is required"] },
    channel_id: { type: String, required: [true, "channel_id is required"] },
  },
  { collection: "stats" },
);

export default model("statisticsModel", statsSchema);
