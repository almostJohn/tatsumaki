import {
	AUTOCOMPLETE_CASE_FOCUSED_FIELD_NAMES,
	AUTOCOMPLETE_REPORT_FOCUSED_FIELD_NAMES,
	AUTOCOMPLETE_REASON_FOCUSED_FIELD_NAME,
} from "../../Constants.js";

export enum AutocompleteType {
	Case,
	Report,
	Reason,
}

export function findAutocompleteType(fieldName: string): AutocompleteType | null {
	if (AUTOCOMPLETE_CASE_FOCUSED_FIELD_NAMES.includes(fieldName)) {
		return AutocompleteType.Case;
	}

	if (AUTOCOMPLETE_REPORT_FOCUSED_FIELD_NAMES.includes(fieldName)) {
		return AutocompleteType.Report;
	}

	if (AUTOCOMPLETE_REASON_FOCUSED_FIELD_NAME.includes(fieldName)) {
		return AutocompleteType.Reason;
	}

	return null;
}
