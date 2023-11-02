import {
	ApplicationCommandOptionType,
	type CommandInteractionOption,
	type Message,
	type Attachment,
	type GuildMember,
	type User,
	type Role,
	type GuildBasedChannel,
} from "discord.js";
import type { ArgumentsOf, CommandPayload } from "./ArgumentsOf.js";

export function transformApplicationInteraction<C extends CommandPayload = CommandPayload>(
	options: readonly CommandInteractionOption<"cached">[],
): ArgumentsOf<C> {
	const opts: Record<
		string,
		| ArgumentsOf<C>
		| Attachment
		| GuildBasedChannel
		| Message<true>
		| Role
		| boolean
		| number
		| string
		| {
				member?: GuildMember | undefined;
				user?: User | undefined;
		  }
		| undefined
	> = {};

	for (const top of options) {
		switch (top.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				opts[top.name] = transformApplicationInteraction<C>(top.options ? [...top.options] : []);
				break;
			case ApplicationCommandOptionType.User:
				opts[top.name] = { user: top.user, member: top.member };
				break;
			case ApplicationCommandOptionType.Channel:
				opts[top.name] = top.channel;
				break;
			case ApplicationCommandOptionType.Role:
				opts[top.name] = top.role;
				break;
			case ApplicationCommandOptionType.Mentionable:
				opts[top.name] = top.user ? { user: top.user, member: top.member } : top.role;
				break;
			case ApplicationCommandOptionType.Number:
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.String:
			case ApplicationCommandOptionType.Boolean:
				opts[top.name] = top.value;
				break;
			case ApplicationCommandOptionType.Attachment:
				opts[top.name] = top.attachment;
				break;
			// @ts-expect-error: This is actually a string
			case "_MESSAGE":
				opts[top.name] = top.message;
				break;
			default:
				break;
		}
	}

	return opts as ArgumentsOf<C>;
}
