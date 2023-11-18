import { on } from "node:events";
import { Client, Events, AutoModerationActionType } from "discord.js";
import type { AutoModerationActionExecution } from "discord.js";
import { injectable } from "tsyringe";
import type { Event } from "../../Event.js";
import { handleAntiSpam } from "../../functions/anti-spam/handler.js";
import { logger } from "../../logger.js";

@injectable()
export default class implements Event {
	public name = "AutoMod spam handler";

	public event = Events.AutoModerationActionExecution as const;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const [autoModAction] of on(this.client, this.event) as AsyncIterableIterator<
			[AutoModerationActionExecution]
		>) {
			try {
				if (autoModAction.action.type !== AutoModerationActionType.BlockMessage) {
					continue;
				}

				if (!autoModAction.content.length) {
					continue;
				}

				await handleAntiSpam(autoModAction.guild.id, autoModAction.userId, autoModAction.content, {
					event: this.event,
					name: this.name,
				});
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
