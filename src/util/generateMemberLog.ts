import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { time, TimestampStyles, type GuildMember } from "discord.js";
import i18next from "i18next";
import { addFields, truncateEmbed } from "./embed.js";
import { MAX_TRUST_ACCOUNT_AGE, Color } from "../Constants.js";

dayjs.extend(relativeTime);

function colorFromDuration(duration: number) {
	const percent = Math.min(duration / (MAX_TRUST_ACCOUNT_AGE / 100), 100);
	let red;
	let green;
	let blue = 0;

	if (percent < 50) {
		red = 255;
		green = Math.round(5.1 * percent);
	} else {
		green = 255;
		red = Math.round(510 - 5.1 * percent);
	}

	const tintFactor = 0.3;

	red += (255 - red) * tintFactor;
	green += (255 - green) * tintFactor;
	blue += (255 - blue) * tintFactor;

	return (red << 16) + (green << 8) + blue;
}

export function generateMemberLog(member: GuildMember, locale: string, join = true) {
	const sinceCreationFormatted = time(dayjs(member.user.createdTimestamp).unix(), TimestampStyles.RelativeTime);
	const creationFormatted = time(dayjs(member.user.createdTimestamp).unix(), TimestampStyles.ShortDateTime);

	let description = i18next.t("log.member_log.description", {
		user_mention: member.user.toString(),
		user_tag: member.user.tag,
		user_id: member.user.id,
		created_at: creationFormatted,
		created_at_since: sinceCreationFormatted,
		created_at_timestamp: member.user.createdTimestamp,
		lng: locale,
	});

	if (member.joinedTimestamp) {
		const sinceJoinedFormatted = time(dayjs(member.joinedTimestamp).unix(), TimestampStyles.RelativeTime);
		const joinedFormatted = time(dayjs(member.joinedTimestamp).unix(), TimestampStyles.ShortDateTime);

		description += i18next.t("log.member_log.joined_at", {
			joined_at: joinedFormatted,
			joined_at_since: sinceJoinedFormatted,
			joined_at_timestamp: member.joinedTimestamp,
			lng: locale,
		});
	}

	if (!join) {
		const sinceLeaveFormatted = time(dayjs().unix(), TimestampStyles.RelativeTime);
		const leaveFormatted = time(dayjs().unix(), TimestampStyles.ShortDateTime);

		description += i18next.t("log.member_log.left_at", {
			left_at: leaveFormatted,
			left_at_since: sinceLeaveFormatted,
			lng: locale,
		});
	}

	const embed = addFields({
		author: {
			name: `${member.user.tag} (${member.user.id})`,
			icon_url: member.user.displayAvatarURL(),
		},
		color: join ? colorFromDuration(Date.now() - member.user.createdTimestamp) : Color.DiscordEmbedBackground,
		description,
		footer: {
			text: i18next.t(join ? "log.member_log.footer.joined" : "log.member_log.footer.left", { lng: locale }),
		},
		timestamp: new Date().toISOString(),
	});

	return truncateEmbed(embed);
}
