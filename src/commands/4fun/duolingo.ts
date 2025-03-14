import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionEditReplyOptions,
} from "discord.js";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { getDuolingoUser } from "../../api/duolingoApi";

function getFlagForLanguage(language: string): string {
  const flags: Record<string, string> = {
    en: "🇬🇧", // English
    es: "🇪🇸", // Spanish
    fr: "🇫🇷", // French
    de: "🇩🇪", // German
    it: "🇮🇹", // Italian
    pt: "🇵🇹", // Portuguese
    ru: "🇷🇺", // Russian
    zh: "🇨🇳", // Chinese
    ja: "🇯🇵", // Japanese
    ar: "🇸🇦", // Arabic
    ko: "🇰🇷", // Korean
    nl: "🇳🇱", // Dutch
    sv: "🇸🇪", // Swedish
    tr: "🇹🇷", // Turkish
    el: "🇬🇷", // Greek
    he: "🇮🇱", // Hebrew
    hi: "🇮🇳", // Hindi
    id: "🇮🇩", // Indonesian
    no: "🇳🇴", // Norwegian
    pl: "🇵🇱", // Polish
    da: "🇩🇰", // Danish
    hu: "🇭🇺", // Hungarian
    vi: "🇻🇳", // Vietnamese
    uk: "🇺🇦", // Ukrainian
    cy: "🏴", // Welsh
    eo: "🌍", // Esperanto
    ga: "🇮🇪", // Irish
    cs: "🇨🇿", // Czech
    sw: "🇰🇪", // Swahili
    ta: "🇮🇳", // Tamil
    ne: "🇳🇵", // Nepali
    lv: "🇱🇻", // Latvian
    et: "🇪🇪", // Estonian
    lt: "🇱🇹", // Lithuanian
    ms: "🇲🇾", // Malay
    th: "🇹🇭", // Thai
    bn: "🇧🇩", // Bengali
    mn: "🇲🇳", // Mongolian
    tl: "🇵🇭", // Tagalog
    si: "🇱🇰", // Sinhala
    ps: "🇦🇫", // Pashto
    uz: "🇺🇿", // Uzbek
    kk: "🇰🇿", // Kazakh
    hy: "🇦🇲", // Armenian
    ka: "🇬🇪", // Georgian
    az: "🇦🇿", // Azerbaijani
    is: "🇮🇸", // Icelandic
    mg: "🇲🇬", // Malagasy
    yo: "🇳🇬", // Yoruba
    ha: "🇳🇬", // Hausa
    zu: "🇿🇦", // Zulu
    xh: "🇿🇦", // Xhosa
  };

  const formattedLanguage = language.toLowerCase().trim();
  return flags[formattedLanguage] || "❓";
}

class DuolingoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("duolingo")
      .setDescription("Check Duolingo user stats")
      .addStringOption((option) =>
        option.setName("username").setDescription("The Duolingo username to check").setRequired(true),
      ) as SlashCommandJSON;
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const username = interaction.options.getString("username", true);

    await interaction.deferReply();

    const user = await getDuolingoUser(username);
    if (!user) {
      await interaction.editReply({
        content: `❌ User **${username}** not found.`,
        ephemeral: true,
      } as InteractionEditReplyOptions);

      return;
    }

    const coursesList = user.courses
      .map((c) => {
        const flag = getFlagForLanguage(c.language);
        return `${flag} ${c.language.toUpperCase()} - **${c.xp} XP**`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`📚 Duolingo Stats for ${username}`)
      .setDescription("Here are the latest statistics from Duolingo.")
      .addFields(
        { name: "📅 Account Created", value: user.created, inline: true },
        { name: "🔥 Current Streak", value: `${user.streak} days`, inline: true },
        { name: "⚡ Total XP", value: `${user.totalXp}`, inline: true },
        { name: "📊 Weekly XP", value: `${user.weeklyXp}`, inline: true },
        { name: "📈 Streak Extended Today?", value: user.streakExtendedToday ? "Yes ✅" : "No ❌", inline: true },
        { name: "📝 Courses", value: coursesList || "No courses found", inline: false },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}

export default DuolingoCommand;
