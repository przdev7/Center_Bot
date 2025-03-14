import { model, Schema } from "mongoose";

export interface Verify {
  guild_id: string;
  role_id: string;
  message_id: string;
  channel_id: string;
}

const verifySchema = new Schema<Verify>(
  {
    guild_id: { type: String, required: [true, "guild_id is required"] },
    role_id: { type: String, required: [true, "role_id is required"] },
    message_id: { type: String, required: [true, "message_id is required"] },
    channel_id: { type: String, required: [true, "channel_id is required"] },
  },
  { collection: "verify" },
);

export default model("verify", verifySchema);
