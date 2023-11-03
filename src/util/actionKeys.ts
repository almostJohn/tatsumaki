import i18next from "i18next";
import { CaseAction } from "../functions/cases/createCase.js";

export function caseActionLabel(key: CaseAction, locale: string): string {
	switch (key) {
		case CaseAction.Warn:
			return i18next.t("log.history.cases.action_label.warn", { lng: locale });
		case CaseAction.Kick:
			return i18next.t("log.history.cases.action_label.kick", { lng: locale });
		case CaseAction.Softban:
			return i18next.t("log.history.cases.action_label.softban", { lng: locale });
		case CaseAction.Ban:
			return i18next.t("log.history.cases.action_label.ban", { lng: locale });
		case CaseAction.Unban:
			return i18next.t("log.history.cases.action_label.unban", { lng: locale });
		case CaseAction.Timeout:
			return i18next.t("log.history.cases.action_label.timeout", { lng: locale });
		case CaseAction.TimeoutEnd:
			return i18next.t("log.history.cases.action_label.timeout_end", { lng: locale });
		default:
			return i18next.t("log.history.cases.action_label.unknown", { lng: locale });
	}
}
