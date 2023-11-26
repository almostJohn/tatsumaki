import { on } from "node:events";
import { setTimeout as pSetTimeout } from "node:timers/promises";
import { type Event, inject, injectable, kRedis, logger } from "@almostjohn/djs-framework";
import { Client, Events, type GuildBan, AuditLogEvent } from "discord.js";
import type { Redis } from "ioredis";
import { AUDIT_LOG_WAIT_SECONDS } from "../../Constants.js";
import { deleteCase } from "../../functions/cases/deleteCase.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Manual unban handling";

	public event = Events.GuildBanRemove as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kRedis) public readonly redis: Redis,
	) {}

	public async execute(): Promise<void> {
		for await (const [guildBan] of on(this.client, this.event) as AsyncIterableIterator<[GuildBan]>) {
			try {
				const modLogChannel = checkLogChannel(
					guildBan.guild,
					await getGuildSetting(guildBan.guild.id, SettingsKeys.ModLogChannelId),
				);

				if (!modLogChannel) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${guildBan.guild.id}:user:${guildBan.user.id}:unban`);

				if (deleted) {
					logger.info(`Member ${guildBan.user.id} unbanned (manual: false)`);

					continue;
				}

				logger.info(`Member ${guildBan.user.id} unbanned (manual: true)`);

				await pSetTimeout(AUDIT_LOG_WAIT_SECONDS * 1_000);
				const auditLogs = await guildBan.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberBanRemove });
				const logs = auditLogs.entries.find((log) => log.target!.id === guildBan.user.id);

				logger.info(`Fetched ${logs} for unban ${guildBan.user.id} (manual: true)`);

				const case_ = await deleteCase({
					guild: guildBan.guild,
					user: logs?.executor,
					target: guildBan.user,
					manual: true,
					skipAction: true,
					reason: logs?.reason!,
				});
				await upsertCaseLog(guildBan.guild, logs?.executor, case_);
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
