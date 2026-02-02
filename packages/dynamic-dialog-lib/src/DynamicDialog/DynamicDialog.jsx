import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DynamicDialog Component
 * 
 * A flexible, reusable dialog component built on Radix UI Dialog
 * 
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onOpenChange - Callback when open state changes
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {React.ReactNode} props.children - Dialog content
 * @param {React.ReactNode} props.footer - Dialog footer content
 * @param {string} props.className - Additional classes for dialog content
 * @param {boolean} props.showCloseButton - Show/hide close button (default: true)
 */
const DynamicDialog = ({
	open,
	onOpenChange,
	title,
	description,
	children,
	footer,
	className,
	showCloseButton = true,
}) => {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className={cn(
						"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
						className,
					)}
				>
					{title && (
						<div className="flex flex-col space-y-1.5 text-center sm:text-left">
							<Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
								{title}
							</Dialog.Title>
							{description && (
								<Dialog.Description className="text-sm text-muted-foreground">
									{description}
								</Dialog.Description>
							)}
						</div>
					)}

					<div className="flex-1">{children}</div>

					{footer && <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{footer}</div>}

					{showCloseButton && (
						<Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</Dialog.Close>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default DynamicDialog;
