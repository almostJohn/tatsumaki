import { ApplicationCommandType, Client, Events } from "discord.js";
import { inject, injectable } from "tsyringe";
import type { Command } from "../Command.js";
import type { CommandPayload } from "../interactions/ArgumentsOf.js";
import { transformApplicationInteraction } from "../interactions/InteractionOptions.js";
import type { Event } from "../Event.js";
import { getGuildSetting, SettingsKeys } from "../functions/settings/getGuildSetting.js";
import { kCommands } from "../tokens.js";
import { logger } from "../logger.js";

@injectable()
export default class implements Event {
	public name = "Interaction handling";

	public event = Events.InteractionCreate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Map<string, Command<CommandPayload>>,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (
				!interaction.isCommand() &&
				!interaction.isUserContextMenuCommand() &&
				!interaction.isMessageContextMenuCommand() &&
				!interaction.isAutocomplete()
			) {
				return;
			}

			if (!interaction.inCachedGuild()) {
				return;
			}

			const command = this.commands.get(interaction.commandName.toLowerCase());

			if (command) {
				try {
					const locale = await getGuildSetting(interaction.guildId, SettingsKeys.Locale);
					const forceLocale = await getGuildSetting<boolean>(interaction.guildId, SettingsKeys.ForceLocale);

					const effectiveLocale = forceLocale ? locale : interaction.locale;

					switch (interaction.commandType) {
						case ApplicationCommandType.ChatInput: {
							const isAutocomplete = interaction.isAutocomplete();

							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Executing ${isAutocomplete ? "autocomplete" : "chatInput command"} ${interaction.commandName}`,
							);

							if (isAutocomplete) {
								await command.autocomplete(
									interaction,
									transformApplicationInteraction(interaction.options.data),
									effectiveLocale,
								);
								break;
							} else {
								await command.chatInput(
									interaction,
									transformApplicationInteraction(interaction.options.data),
									effectiveLocale,
								);
								break;
							}
						}

						case ApplicationCommandType.Message: {
							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Executing message context command ${interaction.commandName}`,
							);

							await command.messageContext(
								interaction,
								transformApplicationInteraction(interaction.options.data),
								effectiveLocale,
							);
							break;
						}

						case ApplicationCommandType.User: {
							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Executing user context command ${interaction.commandName}`,
							);

							await command.userContext(
								interaction,
								transformApplicationInteraction(interaction.options.data),
								effectiveLocale,
							);
							break;
						}

						default:
							break;
					}
				} catch (error_) {
					const error = error_ as Error;
					logger.error(error, error.message);

					try {
						if (interaction.isAutocomplete()) {
							return;
						}

						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								"Command interaction has not been deferred before throwing",
							);
							await interaction.deferReply({ ephemeral: true });
						}

						await interaction.editReply({ content: error.message, components: [] });
					} catch (error__) {
						const subError = error__ as Error;
						logger.error(subError, subError.message);
					}
				}
			}
		});
	}
}