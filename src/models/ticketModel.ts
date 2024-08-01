import { Embed } from "discord.js";
import { model, Schema } from "mongoose";

export interface Ticket {
  guild_id: string;
  embed: Embed;
  category_id: string;
  channel_id: string;
  message_id: string;
  role_id?: string;
  categories: TicketCategory[];
}
export interface TicketCategory {
  name: string;
  description: string;
}

const ticketSchema = new Schema<Ticket>(
  {
    guild_id: { type: String, required: [true, "guild_id is required"] },
    embed: {
      title: { type: String, required: [true, "title is required"] },
      description: { type: String, required: [true, "description is required"] },
      color: { type: String, required: [true, "color is required"] },
    },
    category_id: { type: String, required: [true, "category_id is required"] },
    channel_id: { type: String, required: [true, "channel_id is required"] },
    message_id: { type: String, required: [true, "message_id is required"] },
    role_id: { type: String, required: [false] },
    categories: [
      {
        name: { type: String, required: [true, "name is required"] },
        description: { type: String, required: [true, "description is required"] },
      },
    ],
  },
  { collection: "tickets" },
);

export default model("tickets", ticketSchema);
