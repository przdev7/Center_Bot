import { model, Schema } from "mongoose";

export interface MemberWelcome {
  guild_id: string;
  channel_id: string;
  role_id?: string;
}

const welcomeSchema = new Schema<MemberWelcome>(
  {
    guild_id: { type: String, required: [true, "guild_id is required"] },
    channel_id: { type: String, required: [true, "channel_id is required"] },
    role_id: { type: String, required: [false] },
  },
  { collection: "welcome" },
);

export default model("welcome", welcomeSchema);
