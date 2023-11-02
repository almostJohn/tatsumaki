import { basename, extname } from "node:path";
import { logger } from "./logger.js";
import type { CommandPayload } from "./interactions/ArgumentsOf.js";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod, Commands } from "./interactions/Interaction.js";

export abstract class Command<C extends CommandPayload> implements Commands<C> {
	public constructor(public readonly name?: C["name"][]) {}

	public chatInput(
		interaction: InteractionParam<CommandMethod.ChatInput>,
		_args: ArgsParam<C, CommandMethod.ChatInput>,
		_locale: LocaleParam<CommandMethod.ChatInput>,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received chat input for ${interaction.commandName}, but the command does not handle chat input`,
		);
	}

	public autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		_args: ArgsParam<C, CommandMethod.Autocomplete>,
		_locale: LocaleParam<CommandMethod.Autocomplete>,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received autocomplete for ${interaction.commandName}, but the command does not handle autocomplete`,
		);
	}

	public messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		_args: ArgsParam<C, CommandMethod.MessageContext>,
		_locale: LocaleParam<CommandMethod.MessageContext>,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received message context for ${interaction.commandName}, but the command does not handle message context`,
		);
	}

	public userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		_args: ArgsParam<C, CommandMethod.UserContext>,
		_locale: LocaleParam<CommandMethod.UserContext>,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received user context for ${interaction.commandName}, but the command does not handle user context`,
		);
	}
}

type CommandInfo = {
	name: string;
};

export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== ".js") {
		return null;
	}

	return { name: basename(path, ".js") } as const;
}
