import { container, kSQL, type PartialAndUndefinedOnNull } from "@almostjohn/djs-framework";
import type { Message, Snowflake } from "discord.js";
import type { Sql } from "postgres";
import type { CamelCasedProperties } from "type-fest";
import { type RawReport, transformReport } from "./transformReport.js";

export enum ReportType {
	Message,
	User,
}

export enum ReportStatus {
	Pending,
	Approved,
	Rejected,
	Spam,
}

export type Report = PartialAndUndefinedOnNull<CamelCasedProperties<RawReport>> & {
	status: ReportStatus;
	type: ReportType;
};

export type CreateReport = Omit<Report, "channelId" | "contextMessageIds" | "createdAt" | "reportId" | "status"> & {
	channelId?: Snowflake | null | undefined;
	contextMessageIds?: Snowflake[] | null | undefined;
	createdAt?: Date | null | undefined;
	message?: Message | null | undefined;
	reportId?: number | null | undefined;
	status?: ReportStatus | null | undefined;
};

export async function createReport(report: CreateReport): Promise<Report> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [rawReport] = await sql<[RawReport]>`
          insert into reports (
               report_id,
               guild_id,
               type,
               status,
               message_id,
               channel_id,
               target_id,
               target_tag,
               author_id,
               author_tag,
               reason,
               attachment_url,
               log_post_id,
               ref_id,
               context_message_ids
          ) values (
               next_report(${report.guildId}),
               ${report.guildId},
               ${report.type},
               ${report.status ?? ReportStatus.Pending},
               ${report.message?.id ?? report.messageId ?? null},
               ${report.message?.channelId ?? report.channelId ?? null},
               ${report.targetId},
               ${report.targetTag},
               ${report.authorId},
               ${report.authorTag},
               ${report.reason},
               ${report.attachmentUrl ?? null},
               ${report.logPostId ?? null},
               ${report.refId ?? null},
               ${report.contextMessageIds ?? []}
          ) returning *
     `;

	return transformReport(rawReport);
}
