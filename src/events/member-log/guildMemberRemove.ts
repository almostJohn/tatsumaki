import { on } from "node:events";
import { Client, Events, type GuildMember, type Webhook } from "discord.js";
import type { Event } from "../../Event.js";
import { inject, injectable } from "tsyringe";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import { generateMemberLog } from "../../util/generateMemberLog.js";
import { kWebhooks } from "../../tokens.js";
import { logger } from "../../logger.js";

@injectable()
export default class implements Event {
	public name = "Member log remove";

	public event = Events.GuildMemberRemove as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				const memberLogWebhookId = await getGuildSetting(guildMember.guild.id, SettingsKeys.MemberLogWebhookId);

				if (!memberLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(memberLogWebhookId);

				if (!webhook) {
					continue;
				}

				const locale = await getGuildSetting(guildMember.guild.id, SettingsKeys.Locale);

				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					`Member ${guildMember.id} left`,
				);

				await webhook.send({
					embeds: [generateMemberLog(guildMember, locale, false)],
					username: this.client.user.username,
					avatarURL: this.client.user.displayAvatarURL(),
				});
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}