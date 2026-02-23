import { useState } from "react";
import { toast } from "react-hot-toast";
import { UploadCloud } from "lucide-react";

import type { FieldRuntime, FormValues, InputProps } from "@/types";

type UploadStatus = "uploading" | "done" | "error";

type UploadState = {
	status: UploadStatus;
	progress: number;
};

type FileUploads = Record<string, Record<string, UploadState>>;

type UploadedFile = {
	url?: string;
	original_name?: string;
	name?: string;
	size?: number;
	// allow extra metadata without fighting TS
	[key: string]: unknown;
};

type FileFieldType = FieldRuntime<InputProps> & {
	type: "file" | "multifile" | string;

	accept?: string;
	maxSize?: number; // bytes
	maxFiles?: number;
	uploadEndpoint?: string;

	// UI
	fieldClass?: string;
};

type Props = {
	field: FileFieldType;
	formValues: FormValues;
	error?: string | null;

	fileUploads?: FileUploads;
	fileInputRefs: React.RefObject<Record<string, HTMLInputElement | null>>;

	handleChange: (name: string, value: unknown) => void;
	onFieldsChange: (values: FormValues) => void;

	api_URL?: string;
	disabled?: boolean;
};

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"] as const;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export default function FileField({
	field,
	formValues,
	error,
	fileUploads,
	fileInputRefs,
	handleChange,
	onFieldsChange,
	api_URL,
	disabled,
}: Props) {
	const isDisabled = !!disabled;
	const isMultiple = field.type === "multifile";

	const uploads = fileUploads?.[field.name] ?? {};
	const currentValues = formValues[field.name];

	const values: UploadedFile[] = isMultiple
		? ((currentValues as UploadedFile[] | undefined) ?? [])
		: ([currentValues].filter(Boolean) as UploadedFile[]);

	const [isDragging, setIsDragging] = useState(false);

	const uploadUrl = api_URL ? `${api_URL}uploads` : null;

	if (!uploadUrl && field.uploadEndpoint) {
		console.error(
			`api_URL prop is required when using FileField with upload functionality for field "${field.name}"`,
		);
	}

	const uploadFile = async (file: File): Promise<unknown> => {
		if (!uploadUrl) {
			toast.error("Upload URL is missing");
			throw new Error("Upload URL is missing");
		}

		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(`${uploadUrl}`, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			toast.error("Upload failed");
			throw new Error("Upload failed");
		}

		const data = (await response.json()) as unknown;
		return data;
	};

	const handleSingleFileUpload = async (file: File) => {
		if (!file) return;

		if (field.maxSize && file.size > field.maxSize) {
			throw new Error(
				`File size must not exceed ${formatFileSize(field.maxSize)}`,
			);
		}

		const uploadedData = await uploadFile(file);

		const newValues: FormValues = { ...formValues, [field.name]: uploadedData };
		handleChange(field.name, uploadedData);
		onFieldsChange(newValues);
	};

	const handleMultiFileUpload = async (files: File[]) => {
		const currentUrls = (formValues[field.name] as unknown[]) ?? [];

		if (field.maxFiles && currentUrls.length + files.length > field.maxFiles) {
			throw new Error(`Maximum ${field.maxFiles} files allowed`);
		}

		files.forEach((file) => {
			if (field.maxSize && file.size > field.maxSize) {
				throw new Error(
					`Each file must not exceed ${formatFileSize(field.maxSize)}`,
				);
			}
		});

		const uploadedUrls = await Promise.all(
			files.map((file) => uploadFile(file)),
		);

		const newUrls = [...currentUrls, ...uploadedUrls];
		handleChange(field.name, newUrls);
		onFieldsChange({ ...formValues, [field.name]: newUrls });
	};

	const handleFileChange = async (files: FileList | null) => {
		if (isDisabled) return;
		if (!files || files.length === 0) return;

		const fileList = Array.from(files);

		try {
			if (isMultiple) {
				await handleMultiFileUpload(fileList);
			} else {
				await handleSingleFileUpload(fileList[0]);
			}

			const input = fileInputRefs.current?.[field.name];
			if (input) input.value = "";
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Upload failed: ${message}`);
		}
	};

	const removeFile = (urlToRemove: UploadedFile) => {
		if (isDisabled) return;

		let newValue: unknown;

		if (!isMultiple) {
			newValue = "";
		} else {
			const urls = (formValues[field.name] as UploadedFile[]) ?? [];
			newValue = urls.filter((file) => file !== urlToRemove);
		}

		handleChange(field.name, newValue);
		onFieldsChange({ ...formValues, [field.name]: newValue });

		const input = fileInputRefs.current?.[field.name];
		if (input) input.value = "";
	};

	// Drag and drop
	const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!isDisabled) setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!isDisabled) setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsDragging(false);

		if (isDisabled) return;

		const dropped = e.dataTransfer.files;
		if (dropped && dropped.length > 0) {
			void handleFileChange(dropped);
		}
	};

	const acceptText = field.accept
		? field.accept
				.split(",")
				.map((a) => a.split("/")[1] || a.split(".")[1] || a)
				.join(", ")
				.toUpperCase()
		: "PNG, JPG, PDF";

	const maxSizeText = field.maxSize
		? `, up to ${formatFileSize(field.maxSize)}`
		: "";

	const dragDropClasses = `
		w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all duration-200 
		focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
		${
			isDisabled
				? "bg-gray-50 border-gray-300 text-secondary cursor-not-allowed opacity-70"
				: isDragging
					? "bg-blue-50 border-blue-500 text-blue-600"
					: "bg-background border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
		}
	`;

	return (
		<div
			key={field.name}
			className={`mb-4 ${field.fieldClass || "col-span-full"}`}
		>
			<div className="space-y-3">
				{/* Drag and drop zone */}
				<button
					type="button"
					className={`group ${dragDropClasses}`}
					onClick={() => {
						if (!isDisabled) {
							fileInputRefs.current?.[field.name]?.click();
						}
					}}
					onDragOver={handleDragOver}
					onDragEnter={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					disabled={isDisabled}
				>
					<div className="border-gray-400 border p-1 mb-3 rounded-md bg-primary shadow-md">
						<UploadCloud size={24} className="m-1 text-primary-foreground" />
					</div>

					<p className=" text-sm font-normal">
						<span
							className={
								isDisabled
									? "text-primary"
									: "text-primary group-hover:text-primary underline"
							}
						>
							Upload {isMultiple ? "Files" : "a file"}
						</span>
						<span className="font-light text-secondary-foreground group-hover:text-secondary">
							{" "}
							or drag and drop
						</span>
					</p>

					<p className="text-xs mt-1 text-gray-500">
						{acceptText}
						{maxSizeText}
						{isMultiple && field.maxFiles && `, Max ${field.maxFiles} files`}
					</p>
				</button>

				{/* Hidden input */}
				<input
					ref={(el) => {
						fileInputRefs.current[field.name] = el;
					}}
					id={field.name}
					type="file"
					accept={field.accept}
					multiple={isMultiple}
					className="sr-only"
					onChange={(e) => void handleFileChange(e.target.files)}
					disabled={isDisabled}
				/>

				{/* Uploaded list */}
				{values.length > 0 && (
					<div className="space-y-2 pt-2 border-t border-gray-200">
						{values.map((file, index) => {
							const fileName = file.original_name || file.name || "File";
							const fileSize = file.size ?? null;

							return (
								<div
									key={(file.url as string) || file.original_name || index}
									className="flex items-center justify-between p-2 bg-gray-50 rounded"
								>
									<div className="flex items-center space-x-2 min-w-0">
										<span className="text-sm truncate">{fileName}</span>
										{fileSize ? (
											<span className="text-xs text-gray-500 flex-shrink-0">
												({formatFileSize(fileSize)})
											</span>
										) : null}
									</div>

									<button
										type="button"
										onClick={() => removeFile(file)}
										className={`text-red-500 hover:text-red-700 ml-3 flex-shrink-0 ${
											isDisabled ? "cursor-not-allowed opacity-50" : ""
										}`}
										disabled={isDisabled}
									>
										Remove
									</button>
								</div>
							);
						})}
					</div>
				)}

				{/* Upload progress */}
				{Object.entries(uploads).map(([fileName, upload]) => {
					if (upload.status === "uploading") {
						return (
							<div key={fileName} className="relative pt-1">
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold inline-block text-primary">
										Uploading {fileName}
									</span>
									<span className="text-xs font-semibold inline-block text-primary">
										{upload.progress}%
									</span>
								</div>
								<div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-blue-200">
									<div
										className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
										style={{ width: `${upload.progress}%` }}
									/>
								</div>
							</div>
						);
					}
					return null;
				})}
			</div>
		</div>
	);
}
