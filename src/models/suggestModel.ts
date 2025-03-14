import { model, Schema } from "mongoose";

export enum suggestionStatus {
  pending = "pending",
  declined = "declined",
  accepted = "accepted",
}
export interface Suggest {
  guild_id: string;
  channel_id: string;
  suggestions: SuggestArray[];
}

export interface SuggestArray {
  message_id: string;
  upvotes: string[];
  downvotes: string[];
  status: suggestionStatus;
}

const suggestSchema = new Schema<Suggest>(
  {
    guild_id: { type: String, required: [true, "guild_id is required"] },
    channel_id: { type: String, required: [true, "channel_id is required"] },
    suggestions: [
      {
        message_id: { type: String, required: [true, "message_id is required"] },
        upvotes: { type: [String], default: [] },
        downvotes: { type: [String], default: [] },
        status: { type: String, enum: suggestionStatus, default: suggestionStatus.pending },
      },
    ],
  },
  { collection: "suggestions" },
);

export default model("suggestions", suggestSchema);
