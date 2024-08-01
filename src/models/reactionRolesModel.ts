import { model, Schema } from "mongoose";

export interface ReactionRoles {
  role_id: string;
  emoji: string;
}

export interface EmbedReactionRoles {
  title: string;
  description: string;
}

const rolesSchema = new Schema<ReactionRoles>({
  role_id: { type: String, required: true },
  emoji: { type: String, required: true },
});

const customEmbedSchema = new Schema<EmbedReactionRoles>({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const reactionRolesSchema = new Schema(
  {
    guild_id: { type: String, required: true },
    channel_id: { type: String, required: true },
    message_id: { type: String, required: true },
    embed: { type: customEmbedSchema, required: true },
    roles: { type: [rolesSchema], required: true, default: [] },
  },
  { collection: "reactionRoles" },
);

export default model("reactionRoles", reactionRolesSchema);
