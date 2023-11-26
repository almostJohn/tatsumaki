import i18next from "i18next";
import { createButton } from "@almostjohn/djs-framework";
import { type Message, ButtonStyle } from "discord.js";

export function createMessageLinkButton(message: Message<true>, locale: string) {
	return createButton({
		style: ButtonStyle.Link,
		url: message.url,
		label: i18next.t("command.common.buttons.message_reference", { lng: locale }),
	});
}
