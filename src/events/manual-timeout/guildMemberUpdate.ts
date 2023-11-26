import { on } from "node:events";
import { setTimeout as pSetTimeout } from "node:timers/promises";
import { type Event, inject, injectable, kRedis, logger } from "@almostjohn/djs-framework";
import { Client, Events, type GuildMember, AuditLogEvent } from "discord.js";
import type { Redis } from "ioredis";
import { AUDIT_LOG_WAIT_SECONDS } from "../../Constants.js";
import { createCase, CaseAction } from "../../functions/cases/createCase.js";
import { deleteCase } from "../../functions/cases/deleteCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Manual timeout handling";

	public event = Events.GuildMemberUpdate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kRedis) public readonly redis: Redis,
	) {}

	public async execute(): Promise<void> {
		for await (const [oldMember, newMember] of on(this.client, this.event) as AsyncIterableIterator<
			[GuildMember, GuildMember]
		>) {
			try {
				const modLogChannel = checkLogChannel(
					oldMember.guild,
					await getGuildSetting(oldMember.guild.id, SettingsKeys.ModLogChannelId),
				);

				if (
					!modLogChannel ||
					oldMember.communicationDisabledUntilTimestamp === newMember.communicationDisabledUntilTimestamp ||
					(newMember.communicationDisabledUntilTimestamp ?? Number.POSITIVE_INFINITY) < Date.now()
				) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${oldMember.guild.id}:user:${oldMember.id}:timeout`);

				if (deleted) {
					logger.info(`Member ${oldMember.id} timeout`);

					continue;
				}

				await pSetTimeout(AUDIT_LOG_WAIT_SECONDS * 1_000);

				const autoMod = await this.redis.del(`guild:${oldMember.guild.id}:user:${oldMember.id}:auto_mod_timeout`);

				if (autoMod) {
					continue;
				}

				const auditLogs = await oldMember.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberUpdate });
				const logs = auditLogs.entries.find(
					(log) =>
						log.target!.id === oldMember.user.id &&
						log.changes.some((change) => change.key === "communication_disabled_until"),
				);

				if (!logs?.changes) {
					continue;
				}

				const timeoutChange = logs.changes.find((change) => change.key === "communication_disabled_until");

				if (!timeoutChange) {
					continue;
				}

				const timeoutEnded = Boolean(timeoutChange.old && !timeoutChange.new);
				logger.info(`Fetched logs for timeout ${timeoutEnded ? "end" : ""} ${oldMember.id}`);

				const case_ = await (timeoutEnded
					? deleteCase({
							guild: oldMember.guild,
							user: logs.executor,
							target: oldMember.user,
							manual: true,
							skipAction: true,
							reason: logs.reason!,
							action: CaseAction.Timeout,
					  })
					: await createCase(
							oldMember.guild,
							generateCasePayload({
								guildId: oldMember.guild.id,
								user: logs.executor,
								args: { user: { user: oldMember.user }, reason: logs.reason! },
								action: CaseAction.Timeout,
								duration: (newMember.communicationDisabledUntilTimestamp ?? Date.now()) - Date.now(),
							}),
							true,
					  ));

				await upsertCaseLog(oldMember.guild, logs.executor, case_);
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error.message);
			}
		}
	}
}
