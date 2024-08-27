import { createCanvas } from "canvas";
import Discord, {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ClientEvents,
  EmbedBuilder,
  GuildMember,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
} from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import verifySchema from "../../models/verifyModel";
import welcomeSchema from "../../models/welcomeModel";
class VerificationEvent implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;

  private codes: Map<string, string> = new Map();
  async execute(client: BotClient, interaction: Interaction): Promise<void> {
    if (interaction.isButton() && interaction.customId === "verify_modalOpen")
      this.handleModalVerification(interaction);

    if (interaction.isButton() && interaction.customId === "verify_button") this.handleBtnVerification(interaction);

    if (interaction.isModalSubmit() && interaction.customId === "verify_modal") this.verifyModalCode(interaction);

    return;
  }

  private async handleBtnVerification(interaction: ButtonInteraction): Promise<void> {
    const canvas = createCanvas(1000, 500);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 200px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const code = this.makeid(5);
    this.codes.set(interaction.user.id, code);
    ctx.fillText(code, canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(this.makeid(5), canvas.width / 3, canvas.height / 3);

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(100, 400);
    ctx.quadraticCurveTo(200, 200, 400, 300);
    ctx.quadraticCurveTo(600, 400, 800, 200);
    ctx.quadraticCurveTo(400, 500, 200, 150);
    ctx.quadraticCurveTo(100, 600, 800, 100);
    ctx.quadraticCurveTo(300, 300, 600, 100);
    ctx.stroke();

    ctx.fillStyle = "#666666";
    ctx.font = "bold 50px Arial";
    const noiseNumbers = ["6", "6", "7", "8", "6", "6", "7", "8", "3"];
    const positions = [
      [150, 350],
      [350, 250],
      [650, 350],
      [750, 150],
      [200, 350],
      [650, 250],
      [450, 350],
      [950, 177],
      [900, 200],
    ];
    for (let i = 0; i < noiseNumbers.length; i += 1) {
      ctx.fillText(noiseNumbers[i], positions[i][0], positions[i][1]);
    }

    const buffer = canvas.toBuffer();

    const attachment = {
      attachment: buffer,
      name: "image.png",
    };

    const captchaEmbed = new EmbedBuilder()
      .setTitle("Weryfikacja")
      .setColor(0x00ff00)
      .setDescription("Copy the text shown below to verify yourself.")
      .setImage("attachment://image.png");

    const btn = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_modalOpen")
        .setLabel("Napisz kod")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji("✍️"),
    );

    await interaction.reply({
      embeds: [captchaEmbed],
      files: [attachment],
      components: [btn],
      ephemeral: true,
    });
  }
  private async handleModalVerification(interaction: ButtonInteraction): Promise<void> {
    const modal = new ModalBuilder().setTitle("Kod").setCustomId("verify_modal");
    const textInputBuilder = new TextInputBuilder()
      .setCustomId("code")
      .setLabel("write code")
      .setPlaceholder("Napisz kod przedstawiony na zdjęciu aby się zweryfikować")
      .setMinLength(5)
      .setMaxLength(5)
      .setRequired(true)
      .setStyle(Discord.TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(textInputBuilder));

    await interaction.showModal(modal);
  }
  private async verifyModalCode(interaction: ModalSubmitInteraction): Promise<void> {
    const user = interaction.member as GuildMember;
    const verify = await verifySchema.findOne({ guild_id: interaction.guildId });
    const code = interaction.fields.getTextInputValue("code");
    const usrCode = this.codes.get(interaction.user.id);

    if (!verify?.role_id) return;

    if (usrCode !== code) {
      const invalidCode = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Invalid code")
        .setColor("Red")
        .setFooter({ text: "Center Bot" });
      await interaction.reply({ embeds: [invalidCode], ephemeral: true });
      return;
    }

    const role = interaction.guild?.roles.cache.get(verify.role_id) as Discord.Role;
    user.roles.add(role);
    const succesModel = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Added Role ${role}`)
      .setColor("Green")
      .setFooter({ text: "Center Bot" });
    await interaction.reply({ embeds: [succesModel], ephemeral: true });
    const guildId = interaction.guild?.id;
    const dataWelcome = await welcomeSchema.findOne({ guild_id: guildId });
    if (!dataWelcome || !dataWelcome.channel_id) {
      return;
    }
    if (dataWelcome.role_id) {
      const roleNotVerify = dataWelcome.role_id;
      user.roles.remove(roleNotVerify);
      return;
    }
    return;
  }
  private makeid(length: number): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
}
export default VerificationEvent;
