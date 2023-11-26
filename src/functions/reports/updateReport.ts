import { container, kSQL, removeUndefinedKeys } from "@almostjohn/djs-framework";
import type { User } from "discord.js";
import type { Sql } from "postgres";
import type { CreateReport } from "./createReport.js";
import { type RawReport, transformReport } from "./transformReport.js";

export type PatchReport = Pick<
	Partial<CreateReport>,
	"attachmentUrl" | "contextMessageIds" | "guildId" | "message" | "reason" | "refId" | "reportId" | "status"
>;

export async function updateReport(report: PatchReport, moderator?: User) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const updates: Partial<Record<keyof RawReport, unknown>> = {
		status: report.status,
		attachment_url: report.attachmentUrl,
		reason: report.reason,
		message_id: report.message?.id,
		channel_id: report.message?.channel.id,
		ref_id: report.refId,
		mod_id: moderator?.id,
		mod_tag: moderator?.tag,
		context_message_ids: report.contextMessageIds,
	};

	const queries = removeUndefinedKeys(updates);

	const [updatedReport] = await sql<[RawReport]>`
          update reports set ${sql(queries as Record<string, unknown>, ...Object.keys(queries))}
          where guild_id = ${report.guildId}
               and report_id = ${report.reportId!}
          returning *
     `;

	return transformReport(updatedReport);
}
