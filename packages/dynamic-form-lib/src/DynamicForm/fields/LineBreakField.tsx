import { Separator } from "@/components/ui/separator";
import type { FieldBase } from "@/types";

export type LineBreakFieldType = FieldBase & {
	label?: string;
};

type Props = {
	field: LineBreakFieldType;
};

function LineBreakField({ field }: Props) {
	if (!field.label) {
		return <Separator className="my-4 h-px bg-gray-300" />;
	}

	return (
		<div className="relative flex items-center py-4">
			<Separator className="flex-1 h-px bg-gray-300" />
			<span className="px-3 font-medium text-gray-600 bg-white">
				{field.label}
			</span>
			<Separator className="flex-1 h-px bg-gray-300" />
		</div>
	);
}

export default LineBreakField;
