import { container, kSQL, logger } from "@almostjohn/djs-framework";
import type { Guild, User, Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { upsertReportLog } from "../logging/upsertReportLog.js";
import { ReportStatus } from "./createReport.js";
import type { RawReport } from "./transformReport.js";
import { updateReport } from "./updateReport.js";

export async function resolvePendingReports(guild: Guild, targetId: Snowflake, caseId: number, moderator: User) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const pendingReports = await sql<RawReport[]>`
          select *
          from reports
          where guild_id = ${guild.id}
               and status = ${ReportStatus.Pending}
               and target_id = ${targetId}
          order by created_at asc
     `;

	for (const report of pendingReports) {
		try {
			const updatedReport = await updateReport(
				{
					guildId: guild.id,
					reportId: report.report_id,
					refId: caseId,
					status: ReportStatus.Approved,
				},
				moderator,
			);

			await upsertReportLog(guild, updatedReport);
		} catch (error_) {
			const error = error_ as Error;
			logger.error(error, "Failed to automatically resolve report");
		}
	}

	return pendingReports;
}
