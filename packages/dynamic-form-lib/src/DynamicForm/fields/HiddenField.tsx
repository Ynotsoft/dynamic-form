import type { FieldBase } from "@/types";

export type HiddenFieldType = FieldBase & {
	name: string;
	value?: unknown;
};

type Props = {
	field: HiddenFieldType;
};

// Renders a hidden input to include static or computed values in form submissions
function HiddenField({ field }: Props) {
	return (
		<input
			type="hidden"
			name={field.name}
			value={field.value != null ? String(field.value) : ""}
		/>
	);
}

export default HiddenField;

