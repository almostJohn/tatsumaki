import { ApplicationCommandType } from "discord-api-types/v10";

export const ReportUserContextCommand = {
	name: "Report user",
	type: ApplicationCommandType.User,
} as const;
