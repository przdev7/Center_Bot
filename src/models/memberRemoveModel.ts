import { model, Schema } from "mongoose";

export interface MemberRemove {
  guild_id: string;
  channel_id: string;
}

const memberRemoveSchema = new Schema<MemberRemove>(
  {
    guild_id: { type: String, required: [true, "guild_id is required"] },
    channel_id: { type: String, required: [true, "channel_id is required"] },
  },
  { collection: "memberRemove" },
);

export default model("removeSchema", memberRemoveSchema);
