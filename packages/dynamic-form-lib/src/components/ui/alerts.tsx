import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

type Props = { message: string };

function BaseAlert({ message, className }: Props & { className: string }) {
	return (
		<div className={`rounded-md border p-3 text-sm ${className}`}>
			{message}
		</div>
	);
}

export function ErrorAlert({ message }: Props) {
	return (
		<BaseAlert
			message={message}
			className="border-red-300 bg-red-50 text-red-900"
		/>
	);
}

export function SuccessAlert({ message }: Props) {
	return (
		<BaseAlert
			message={message}
			className="border-green-300 bg-green-50 text-green-900"
		/>
	);
}

export function WarningAlert({ message }: Props) {
	return (
		<BaseAlert
			message={message}
			className="border-yellow-300 bg-yellow-50 text-yellow-900"
		/>
	);
}

export function InfoAlert({ message }: Props) {
	return (
		<BaseAlert
			message={message}
			className="border-blue-300 bg-blue-50 text-blue-900"
		/>
	);
}
