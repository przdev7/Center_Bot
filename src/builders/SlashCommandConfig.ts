interface ICooldowns {
  global: number | undefined;
  guild: number | undefined;
  user: number | undefined;
}

export class SlashCommandConfig {
  public cooldowns: ICooldowns = {
    global: undefined,
    guild: undefined,
    user: undefined,
  };
  public dev = false;

  /**
   * Sets the user-specific cooldown for the command (in milliseconds).
   *
   * @param userCooldown - The duration in milliseconds.
   * @returns The current instance of SlashCommandConfig.
   * @throws Will throw an error if userCooldown is not a non-negative number.
   */
  public setUserCooldown(userCooldown: number): this {
    this.validateNonNegativeNumber(userCooldown, "User cooldown");
    this.cooldowns.user = userCooldown;
    return this;
  }

  /**
   * Sets the guild-specific cooldown for the command (in milliseconds).
   *
   * @param guildCooldown - The duration in milliseconds.
   * @returns The current instance of SlashCommandConfig.
   * @throws Will throw an error if guildCooldown is not a non-negative number.
   */
  public setGuildCooldown(guildCooldown: number): this {
    this.validateNonNegativeNumber(guildCooldown, "Guild cooldown");
    this.cooldowns.guild = guildCooldown;
    return this;
  }

  /**
   * Sets the global cooldown for the command (in milliseconds).
   *
   * @param globalCooldown - The duration in milliseconds.
   * @returns The current instance of SlashCommandConfig.
   * @throws Will throw an error if globalCooldown is not a non-negative number.
   */
  public setGlobalCooldown(globalCooldown: number): this {
    this.validateNonNegativeNumber(globalCooldown, "Global cooldown");
    this.cooldowns.global = globalCooldown;
    return this;
  }

  /**
   * Sets whether the command should only be available to developers.
   *
   * @param dev - Whether the command should be dev only.
   * @returns The current instance of SlashCommandConfig.
   * @throws Will throw an error if dev is not a boolean.
   */
  public setDevOnly(dev: boolean): this {
    if (typeof dev !== "boolean") {
      throw new Error("Dev flag must be a boolean.");
    }
    this.dev = dev;
    return this;
  }

  /**
   * Validates that a given number is non-negative.
   *
   * @param value - The number to validate.
   * @param name - The name of the value being validated.
   * @throws Will throw an error if the value is not a non-negative number.
   */
  private validateNonNegativeNumber(value: number, name: string): void {
    if (typeof value !== "number" || value < 0) {
      throw new Error(`${name} must be a non-negative number.`);
    }
  }
}
