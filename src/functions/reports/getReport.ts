import { container, kSQL } from "@almostjohn/djs-framework";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { type Report, ReportStatus } from "./createReport.js";
import { type RawReport, transformReport } from "./transformReport.js";

export async function getReport(guildId: Snowflake, reportId: number) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [rawReport] = await sql<[RawReport?]>`
          select *
          from reports
          where guild_id = ${guildId}
               and report_id = ${reportId}
     `;

	if (!rawReport) {
		return null;
	}

	return transformReport(rawReport);
}

export async function getPendingReportByTarget(guildId: Snowflake, targetId: Snowflake): Promise<Report | null> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [rawReport] = await sql<[RawReport]>`
          select *
          from reports
          where guild_id = ${guildId}
               and target_id = ${targetId}
               and status = ${ReportStatus.Pending}
          order by created_at desc
          limit 1
     `;

	if (!rawReport) {
		return null;
	}

	return transformReport(rawReport);
}
