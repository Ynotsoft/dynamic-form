import React, { useState } from "react"; // Added useState for drag state
import { toast } from "react-hot-toast";
import { UploadCloud } from "lucide-react"; // Added icon for visual appeal

function FileField({
	field,
	formValues,
	error,
	fileUploads,
	// setFileUploads removed as it is unused
	fileInputRefs, // Now correctly initialized in the parent
	handleChange,
	onFieldsChange,
	api_URL,
	disabled,
}) {
	// Use the 'disabled' prop passed from DynamicForm
	const isDisabled = disabled;

	const isMultiple = field.type === "multifile";
	// Add optional chaining for safer access
	const uploads = fileUploads?.[field.name] || {};
	const currentValues = formValues[field.name];
	const values = isMultiple
		? currentValues || []
		: [currentValues].filter(Boolean);

	// State for drag-and-drop visualization
	const [isDragging, setIsDragging] = useState(false);

	// Check if api_URL is provided when file uploads are needed
	const uploadUrl = api_URL ? `${api_URL}uploads` : null;

	if (!uploadUrl && field.uploadEndpoint) {
		console.error(
			`api_URL prop is required when using FileField with upload functionality for field "${field.name}"`,
		);
	}

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		// Using ** operator and template literals for clean code
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	// Removed fieldName parameter as it was unused in the function body
	const uploadFile = async (file) => {
		const formData = new FormData();
		formData.append("file", file);

		// Mock API call for upload progress (adjust as needed if using actual API progress tracking)
		// For now, this is a standard fetch, progress updates would typically be handled separately.
		const response = await fetch(`${uploadUrl}`, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			toast.error("Upload failed");
			throw new Error("Upload failed");
		}

		const data = await response.json();
		return data;
	};

	const handleSingleFileUpload = async (field, file) => {
		if (!file) return;

		// Validate file size
		if (field.maxSize && file.size > field.maxSize) {
			throw new Error(
				`File size must not exceed ${formatFileSize(field.maxSize)}`,
			);
		}

		// Upload the file
		const uploadedData = await uploadFile(file); // Updated call

		// Update form values with the uploaded URL
		const newValues = { ...formValues, [field.name]: uploadedData };
		handleChange(field.name, uploadedData);
		onFieldsChange(newValues);
	};

	const handleMultiFileUpload = async (field, files) => {
		const currentUrls = formValues[field.name] || [];
		// Ensure field.maxFiles exists before checking limit
		if (field.maxFiles && currentUrls.length + files.length > field.maxFiles) {
			throw new Error(`Maximum ${field.maxFiles} files allowed`);
		}

		// Validate each file size
		files.forEach((file) => {
			if (field.maxSize && file.size > field.maxSize) {
				throw new Error(
					`Each file must not exceed ${formatFileSize(field.maxSize)}`,
				);
			}
		});

		// Upload all files
		const uploadedUrls = await Promise.all(
			files.map((file) => uploadFile(file)), // Updated call
		);

		// Update form values with the new URLs
		const newUrls = [...currentUrls, ...uploadedUrls];
		handleChange(field.name, newUrls);
		onFieldsChange({ ...formValues, [field.name]: newUrls });
	};

	const handleFileChange = async (fieldName, files) => {
		// GUARD CLAUSE: Prevent file change if disabled
		if (isDisabled) return;

		const fileList = Array.from(files);

		try {
			if (field.type === "multifile") {
				await handleMultiFileUpload(field, fileList);
			} else {
				await handleSingleFileUpload(field, fileList[0]);
			}

			// Clear file input after processing
			if (fileInputRefs.current?.[fieldName]) {
				fileInputRefs.current[fieldName].value = ""; // This resets the file input field
			}
		} catch (error) {
			toast.error(`Upload failed: ${error.message}`);
		}
	};

	const removeFile = async (fieldName, urlToRemove) => {
		// GUARD CLAUSE: Prevent removal if disabled
		if (isDisabled) return;

		let newValue;

		if (field.type === "file") {
			newValue = "";
		} else {
			const urls = formValues[fieldName] || [];
			// Assuming urlToRemove is the data object containing the file URL/metadata
			newValue = urls.filter((file) => file !== urlToRemove);
		}

		handleChange(fieldName, newValue);
		onFieldsChange({ ...formValues, [fieldName]: newValue });

		// Reset the file input field after removing the file
		if (fileInputRefs.current?.[fieldName]) {
			fileInputRefs.current[fieldName].value = ""; // Reset file input after removing
		}
	};

	// --- Drag and Drop Handlers ---
	const handleDragOver = (e) => {
		e.preventDefault();
		if (!isDisabled) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		if (!isDisabled) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);

		if (isDisabled) return;

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFileChange(field.name, e.dataTransfer.files);
		}
	};

	// Helper text for file types and size
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

	// Class for the drag-and-drop zone
	const dragDropClasses = `
    w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all duration-200 
    // Ensure focus styling is handled correctly for the button element
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    ${
			isDisabled
				? "bg-gray-50 border-gray-300 text-gray-400 cursor-not-allowed opacity-70"
				: isDragging
					? "bg-blue-50 border-blue-500 text-blue-600"
					: "bg-white border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
		}
  `;

	return (
		<div
			key={field.name}
			className={`mb-4 ${field.fieldClass || "col-span-full"}`}
		>
			<div className="space-y-3">
				{/* --- Drag and Drop Zone (Now a semantic <button>) --- */}
				<button
					type="button" // Important to prevent accidental form submission
					className={dragDropClasses}
					onClick={() => {
						if (!isDisabled) {
							fileInputRefs?.current?.[field.name]?.click();
						}
					}}
					onDragOver={handleDragOver}
					onDragEnter={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					disabled={isDisabled} // Use native disabled attribute
				>
					<div className="border-gray-400 border p-1 mb-3 rounded-md bg-gray-100 shadow-md ">
						<UploadCloud size={24} className="m-1" />
					</div>
					<p className="text-sm font-normal">
						<span
							className={
								isDisabled
									? "text-gray-400"
									: "text-blue-600 hover:text-blue-700 underline"
							}
						>
							Upload {isMultiple ? "Files" : "a file"}
						</span>
						<span className="font-light"> or drag and drop</span>
					</p>
					<p className="text-xs mt-1 text-gray-500">
						{acceptText}
						{maxSizeText}
						{isMultiple && field.maxFiles && `, Max ${field.maxFiles} files`}
					</p>
				</button>

				{/* --- Hidden File Input --- */}
				<input
					// Store the ref safely
					ref={(el) => {
						if (el && fileInputRefs && fileInputRefs.current) {
							fileInputRefs.current[field.name] = el;
						}
					}}
					id={field.name}
					type="file"
					accept={field.accept}
					multiple={isMultiple}
					// Use sr-only for visual hiding while retaining functionality
					className="sr-only"
					onChange={(e) => handleFileChange(field.name, e.target.files)}
					disabled={isDisabled} // Apply disabled state to the input
				/>

				{/* --- Uploaded Files List --- */}
				{values.length > 0 && (
					<div className="space-y-2 pt-2 border-t border-gray-200">
						{values.map((file, index) => {
							// Assuming file contains the uploaded data object
							const fileName = file.original_name || file.name || "File";
							const fileSize = file.size || null;

							return (
								<div
									key={file.url || file.original_name || index}
									className="flex items-center justify-between p-2 bg-gray-50 rounded"
								>
									<div className="flex items-center space-x-2 min-w-0">
										{/* Ellipsis for long file names */}
										<span className="text-sm truncate">{fileName}</span>
										{fileSize && (
											<span className="text-xs text-gray-500 flex-shrink-0">
												({formatFileSize(fileSize)})
											</span>
										)}
									</div>
									<button
										type="button"
										onClick={() => removeFile(field.name, file)}
										// Apply disabled state and classes to remove button
										className={`text-red-500 hover:text-red-700 ml-3 flex-shrink-0 ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
										disabled={isDisabled}
									>
										Remove
									</button>
								</div>
							);
						})}
					</div>
				)}

				{/* Upload Progress */}
				{Object.entries(uploads).map(([fileName, upload]) => {
					if (upload.status === "uploading") {
						return (
							<div key={fileName} className="relative pt-1">
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold inline-block text-blue-600">
										Uploading {fileName}
									</span>
									<span className="text-xs font-semibold inline-block text-blue-600">
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

export default FileField;
