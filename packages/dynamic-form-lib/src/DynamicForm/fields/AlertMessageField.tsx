import type { FieldBase } from "@/types";
import {
	ErrorAlert,
	InfoAlert,
	SuccessAlert,
	WarningAlert,
} from "@/components/ui/alerts";

type AlertVariant =
	| "error"
	| "danger"
	| "success"
	| "warning"
	| "warn"
	| "info"
	| "information";

export type AlertField = FieldBase & {
	variant?: AlertVariant | string;
	message?: string;
	content?: string;
};

type Props = {
	field: AlertField;
};

export default function AlertMessageField({ field }: Props) {
	const variant = String(field.variant ?? "info").toLowerCase();
	const alertMessage = field.message ?? field.content ?? "";

	switch (variant) {
		case "error":
		case "danger":
			return <ErrorAlert message={alertMessage} />;

		case "success":
			return <SuccessAlert message={alertMessage} />;

		case "warning":
		case "warn":
			return <WarningAlert message={alertMessage} />;

		case "info":
		case "information":
		default:
			return <InfoAlert message={alertMessage} />;
	}
}
