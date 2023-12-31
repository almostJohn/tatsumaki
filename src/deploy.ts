import process from "node:process";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import {
	// Moderation
	BanCommand,
	CaseLookupCommand,
	ClearCommand,
	DurationCommand,
	HistoryCommand,
	KickCommand,
	LockdownCommand,
	ReasonCommand,
	ReferenceCommand,
	ReportUtilsCommand,
	SoftbanCommand,
	TimeoutCommand,
	UnbanCommand,
	WarnCommand,

	// Utility
	PingCommand,
	ReportCommand,
	RepostCommand,

	// Context Menu
	ReportMessageContextCommand,
	ReportUserContextCommand,
	ClearMessageContextCommand,
	HistoryUserContextCommand,
	RepostMessageContextCommand,
} from "./interactions/index.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log("Started refreshing interaction (/) commands");

	await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
		body: [
			// Moderation
			BanCommand,
			CaseLookupCommand,
			ClearCommand,
			DurationCommand,
			HistoryCommand,
			KickCommand,
			LockdownCommand,
			ReasonCommand,
			ReferenceCommand,
			ReportUtilsCommand,
			SoftbanCommand,
			TimeoutCommand,
			UnbanCommand,
			WarnCommand,

			// Utility
			PingCommand,
			ReportCommand,
			RepostCommand,

			// Context Menu
			ReportMessageContextCommand,
			ReportUserContextCommand,
			ClearMessageContextCommand,
			HistoryUserContextCommand,
			RepostMessageContextCommand,
		],
	});

	console.log("Successfully registered interaction (/) commands");
} catch (error) {
	console.error(error);
}
