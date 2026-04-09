import * as Select from "@radix-ui/react-select";
import { ChevronDown, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
// get arrow down icon from icon hero icon

function SelectField({ field, formValues, handleChange, handleBlur, error, apiClient }) {
	const value = formValues[field.name] || "";
	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: field.disabled;

	const [options, setOptions] = useState(field.options || []);
	const [isLoading, setIsLoading] = useState(false);
	const refreshTrigger = typeof field.refresh === "function"
		? field.refresh(formValues)
		: field.refresh;

	useEffect(() => {
		const loadOptions = async () => {
			if (!field.optionsUrl || !apiClient) {
				if (field.options) setOptions(field.options);
				return;
			}

			setIsLoading(true);
			try {
				let finalUrl = field.optionsUrl;
				let config = {};

				if (field.queryParams) {
					const params = typeof field.queryParams === "function"
						? field.queryParams(formValues)
						: field.queryParams;

					if (typeof params === "string") {
						// e.g. "?EntitlementUUID=..."
						finalUrl += params.startsWith("?") ? params : `?${params}`;
					} else {
						// e.g. { param1: "value" }
						config = { params };
					}
				}

				const response = await apiClient(finalUrl, config);
				const data = response.data || response;
				const results = Array.isArray(data) ? data : [];

				const mappedResults = results.map(item => ({
					value: item[field.valueId || "key"] || item.key,
					label: item[field.labelId || "value"] || item.value
				}));

				setOptions(mappedResults);

				if (field.name + "_count" in formValues) {
					handleChange(field.name + "_count", mappedResults.length);
				}


			} catch (err) {
				console.error("Failed to load options for SelectField:", err);
				setOptions(field.options || []);
			} finally {
				setIsLoading(false);
			}
		};

		loadOptions();
	}, [
		field.optionsUrl,
		field.options,
		apiClient,
		field.valueId,
		field.labelId,
		JSON.stringify(refreshTrigger),
		// Instead of depending directly on field.queryParams (which triggers nothing when formValues change),
		// stringify the evaluated params so it refetches ONLY when the inputs of the API call change.
		JSON.stringify(typeof field.queryParams === "function" ? field.queryParams(formValues) : field.queryParams)
	]);

	return (
		<>
			<Select.Root
				value={value}
				onValueChange={(val) => handleChange(field.name, val)}
				disabled={isDisabled}
			>
				{/* --- Trigger --- */}
				<Select.Trigger
					id={field.name}
					onBlur={() => handleBlur(field.name)}
					className={`inline-flex items-center justify-between w-full h-10 rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background transition-all
          ${error
							? "border-red-500 focus-visible:ring-red-500"
							: "border-input focus-visible:ring-blue-500"
						}
          ${isDisabled ? "cursor-not-allowed opacity-50" : ""}
        `}
				>
					<Select.Value
						placeholder={
							isLoading ? "Loading..." : field.placeholder || `Select ${field.label?.toLowerCase() || ""}`
						}
					/>
					<Select.Icon className="ml-2 text-gray-500 flex items-center">
						{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
					</Select.Icon>
				</Select.Trigger>

				{/* --- Dropdown --- */}
				<Select.Portal>
					<Select.Content
						className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[var(--radix-select-trigger-width)]"
						position="popper"
						sideOffset={5}
					>
						{/* Scroll Up */}
						<Select.ScrollUpButton className="flex items-center justify-center h-6 text-gray-500 bg-gray-50">
							<Select.Arrow className="fill-white stroke-gray-200" />
						</Select.ScrollUpButton>

						<Select.Viewport className="p-1">
							{/* Optional grouped items */}
							{field.groupLabel && (
								<Select.Group>
									<Select.Label className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wide">
										{field.groupLabel}
									</Select.Label>
								</Select.Group>
							)}

							{/* List of options */}
							{options.map((option) => (
								<Select.Item
									key={option.value}
									value={option.value}
									className={`relative flex items-center px-3 py-2 text-sm rounded cursor-pointer select-none
                  data-[state=checked]:bg-blue-50
                  data-[state=checked]:text-blue-600
                `}
								>
									<Select.ItemText>{option.label}</Select.ItemText>
								</Select.Item>
							))}

							{/* Optional separator */}
							{field.separator && (
								<Select.Separator className="my-1 h-px bg-gray-200" />
							)}
						</Select.Viewport>

						{/* Scroll Down */}

						{/* Optional arrow */}
						<Select.Arrow className="fill-white stroke-gray-200" />
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</>
	);
}

export default SelectField;
