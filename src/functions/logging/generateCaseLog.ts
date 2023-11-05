import { type Snowflake, hyperlink, time, TimestampStyles, messageLink, channelLink } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import { type Case, CaseAction } from "../cases/createCase.js";
import { caseActionLabel } from "../../util/actionKeys.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { kSQL } from "../../tokens.js";

export async function generateCaseLog(case_: Case, logChannelId: Snowflake, locale: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	let action = caseActionLabel(case_.action, locale);

	let msg = i18next.t("log.mod_log.case_log.description", {
		target_tag: case_.targetTag,
		target_id: case_.targetId,
		action,
		lng: locale,
	});

	if (case_.actionExpiration) {
		msg += i18next.t("log.mod_log.case_log.expiration", {
			time: time(new Date(case_.actionExpiration), TimestampStyles.RelativeTime),
			lng: locale,
		});
	}

	if (case_.contextMessageId) {
		const [contextMessage] = await sql<[{ channel_id: Snowflake | null }?]>`
               select channel_id
               from messages
               where id = ${case_.contextMessageId}
          `;

		if (Reflect.has(contextMessage ?? {}, "channel_id")) {
			msg += i18next.t("log.mod_log.case_log.context", {
				link: hyperlink(
					i18next.t("log.mod_log.case_log.context_sub", { lng: locale }),
					messageLink(contextMessage!.channel_id!, case_.contextMessageId, case_.guildId),
				),
				lng: locale,
			});
		}
	}

	if (case_.reason) {
		msg += i18next.t("log.mod_log.case_log.reason", { reason: case_.reason, lng: locale });
	} else {
		msg += i18next.t("log.mod_log.case_log.reason_fallback", { case_id: case_.caseId, lng: locale });
	}

	if (case_.refId) {
		const [reference] = await sql<[{ action: CaseAction; log_message_id: Snowflake | null }?]>`
               select action, log_message_id
               from cases
               where guild_id = ${case_.guildId}
                    and case_id = ${case_.refId}
          `;

		if (Reflect.has(reference ?? {}, "action") && Reflect.has(reference ?? {}, "log_message_id")) {
			msg += i18next.t("log.mod_log.case_log.case_reference", {
				ref: hyperlink(`#${case_.refId}`, messageLink(logChannelId, reference!.log_message_id!, case_.guildId)),
				action: caseActionLabel(reference!.action, locale),
				lng: locale,
			});
		}
	}

	if (case_.reportRefId) {
		const reportChannelId = await getGuildSetting(case_.guildId, SettingsKeys.ReportChannelId);

		const [reference] = await sql<[{ log_post_id: Snowflake | null }?]>`
               select log_post_id
               from reports
               where guild_id = ${case_.guildId}
                    and report_id = ${case_.reportRefId}
          `;

		if (reportChannelId && Reflect.has(reference ?? {}, "log_post_id")) {
			msg += i18next.t("log.mod_log.case_log.report_reference", {
				report_ref: hyperlink(`#${case_.reportRefId}`, channelLink(reference!.log_post_id!, case_.guildId)),
				lng: locale,
			});
		}
	}

	return msg;
}
