import { Command } from "../../Command.js";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "../../interactions/Interaction.js";
import type { Message } from "discord.js";
import i18next from "i18next";
import { formatMessageToEmbed } from "../../functions/logging/formatMessageToEmbed.js";
import { createMessageActionRow } from "../../util/messageActionRow.js";
import type { RepostCommand, RepostMessageContextCommand } from "../../interactions/index.js";
import { createMessageLinkButton } from "../../util/createMessageLinkButton.js";
import { parseMessageLink, resolveMessage } from "../../util/resolveMessage.js";

export default class extends Command<typeof RepostCommand | typeof RepostMessageContextCommand> {
	private async handle(
		interaction: InteractionParam | InteractionParam<CommandMethod.MessageContext>,
		message: Message<true>,
		locale: string,
	): Promise<void> {
		await interaction.editReply({
			embeds: [formatMessageToEmbed(message, locale)],
			// @ts-expect-error: discord.js needs an update
			components: [createMessageActionRow([createMessageLinkButton(message, locale)])],
		});
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof RepostCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply();
		const parsedLink = parseMessageLink(args.message_link);

		if (!parsedLink) {
			throw new Error(
				i18next.t("command.common.errors.not_message_link", {
					val: args.message_link,
					arg: "message_link",
					lng: locale,
				}),
			);
		}

		const { guildId, channelId, messageId } = parsedLink;
		const message = await resolveMessage(interaction.channelId, guildId!, channelId!, messageId!, locale);

		await this.handle(interaction, message, locale);
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof RepostMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply();
		await this.handle(interaction, args.message, locale);
	}
}
