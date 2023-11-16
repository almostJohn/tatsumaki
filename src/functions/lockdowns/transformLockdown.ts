import type { PermissionOverwrites, Snowflake } from "discord.js";
import type { Lockdown } from "./createLockdown.js";

export type RawLockdown = {
	channel_id: Snowflake;
	expiration: string;
	guild_id: Snowflake;
	mod_id: Snowflake;
	mod_tag: string;
	overwrites: PermissionOverwrites[];
	reason: string | null | undefined;
};

export function transformLockdown(lockdown: RawLockdown): Lockdown {
	return {
		guildId: lockdown.guild_id,
		channelId: lockdown.channel_id,
		expiration: lockdown.expiration,
		reason: lockdown.reason,
		modId: lockdown.mod_id,
		modTag: lockdown.mod_tag,
		overwrites: lockdown.overwrites,
	} as const;
}
