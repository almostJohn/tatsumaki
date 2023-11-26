import { on } from "node:events";
import { setTimeout as pSetTimeout } from "node:timers/promises";
import { type Event, inject, injectable, kRedis, logger } from "@almostjohn/djs-framework";
import { Client, Events, type GuildBan, AuditLogEvent } from "discord.js";
import type { Redis } from "ioredis";
import { AUDIT_LOG_WAIT_SECONDS } from "../../Constants.js";
import { createCase, CaseAction } from "../../functions/cases/createCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Manual ban handling";

	public event = Events.GuildBanAdd as const;

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

				const deleted = await this.redis.del(`guild:${guildBan.guild.id}:user:${guildBan.user.id}:ban`);

				if (deleted) {
					logger.info(`Member ${guildBan.user.id} banned (manual: false)`);

					continue;
				}

				await pSetTimeout(AUDIT_LOG_WAIT_SECONDS * 1_000);
				const auditLogs = await guildBan.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberBanAdd });
				const logs = auditLogs.entries.find((log) => log.target!.id === guildBan.user.id);

				logger.info(`Member ${guildBan.user.id} banned (manual: true)`);
				logger.info(`Fetched ${logs} for ban ${guildBan.user.id}`);

				const case_ = await createCase(
					guildBan.guild,
					generateCasePayload({
						guildId: guildBan.guild.id,
						user: logs?.executor,
						args: { user: { user: guildBan.user }, reason: logs?.reason },
						action: CaseAction.Ban,
					}),
					true,
				);
				await upsertCaseLog(guildBan.guild, logs?.executor, case_);
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
