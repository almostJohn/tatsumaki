import { container } from "tsyringe";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { kSQL } from "../../tokens.js";

export enum SettingsKeys {
	AutomodIgnoreRoles = "automod_ignore_roles",
	ForceLocale = "force_locale",
	GuildLogWebhookId = "guild_log_webhook_id",
	Locale = "locale",
	LogIgnoreChannels = "log_ignore_channels",
	MemberLogWebhookId = "member_log_webhook_id",
	ModLogChannelId = "mod_log_channel_id",
	ModRoleId = "mod_role_id",
	ReportChannelId = "report_channel_id",
	ReportStatusTags = "report_status_tags",
	ReportTypeTags = "report_type_tags",
}

export type ReportStatusTagTuple = [string, string, string, string, string];
export type ReportTypeTagTuple = [string, string];

export async function getGuildSetting<T = string>(guildId: Snowflake, prop: SettingsKeys, table = "guild_settings") {
	const sql = container.resolve<Sql<{}>>(kSQL);

	const [data] = await sql.unsafe<[{ value: ReportStatusTagTuple | ReportTypeTagTuple | boolean | string | null }?]>(
		`select ${prop} as value
          from ${table}
          where guild_id = $1`,
		[guildId],
	);

	return (data?.value ?? null) as T;
}
