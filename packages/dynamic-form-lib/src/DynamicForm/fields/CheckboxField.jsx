/**
 * CheckboxField Component
 *
 * A flexible checkbox field for DynamicForm that supports both single checkbox and checkbox groups
 *
 * @example
 * // Single checkbox
 * {
 *   type: 'checkbox',
 *   name: 'agree',
 *   label: 'I agree to the terms and conditions',
 *   required: true
 * }
 *
 * @example
 * // Checkbox group (stacked/vertical layout - default)
 * {
 *   type: 'checkbox',
 *   name: 'interests',
 *   label: 'Select your interests',
 *   required: true,
 *   options: [
 *     { value: 'sports', label: 'Sports', description: 'Athletic activities and games' },
 *     { value: 'music', label: 'Music', description: 'Playing or listening to music' },
 *     { value: 'art', label: 'Art', description: 'Creative visual arts' }
 *   ]
 * }
 *
 * @example
 * // Checkbox group (inline/horizontal layout)
 * {
 *   type: 'checkbox',
 *   name: 'days',
 *   label: 'Available Days',
 *   inline: true, // or layout: 'inline'
 *   options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
 * }
 *
 * @example
 * // With disabled state
 * {
 *   type: 'checkbox',
 *   name: 'notifications',
 *   label: 'Notification Preferences',
 *   disabled: (formValues) => !formValues.hasAccount,
 *   options: [
 *     { value: 'email', label: 'Email Notifications' },
 *     { value: 'sms', label: 'SMS Notifications' },
 *     { value: 'push', label: 'Push Notifications' }
 *   ]
 * }
 */

function CheckboxField({ field, formValues, handleChange, handleBlur, error }) {
	const isDisabled =
		typeof field.disabled === "function"
			? field.disabled(formValues)
			: field.disabled;
	const options = field.options || [];

	// Support both 'inline' and 'layout' props for flexibility
	const isInline = field.inline || field.layout === "inline";

	// If options exist, render as checkbox group
	if (options.length > 0) {
		const selectedValues = Array.isArray(formValues[field.name])
			? formValues[field.name]
			: [];

		const handleCheckboxGroupChange = (optionValue, isChecked) => {
			let newValues;
			if (isChecked) {
				newValues = [...selectedValues, optionValue];
			} else {
				newValues = selectedValues.filter((v) => v !== optionValue);
			}
			handleChange(field.name, newValues);
		};

		// Only show error if field is required and no options are selected
		const showError = error && field.required && selectedValues.length === 0;

		return (
			<>
				<div
					className={
						isInline ? "grid grid-cols-4 gap-3 mt-3" : "space-y-3 mt-3"
					}
				>
					{options.map((option) => {
						const optionValue =
							typeof option === "object" ? option.value : option;
						const optionLabel =
							typeof option === "object" ? option.label : option;
						const optionDescription =
							typeof option === "object" ? option.description : null;
						const itemId = `${field.name}-${optionValue}`;
						const isChecked = selectedValues.includes(optionValue);

						return (
							<div key={optionValue} className="relative flex items-start">
								<div className="flex h-6 items-center">
									<input
										{...field.props}
										type="checkbox"
										id={itemId}
										checked={isChecked}
										onChange={(e) =>
											handleCheckboxGroupChange(optionValue, e.target.checked)
										}
										onBlur={() => handleBlur(field.name)}
										disabled={isDisabled}
										className={`
                      size-4 rounded border-gray-300 text-blue-600 transition-all
                      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${
												isDisabled
													? "opacity-50 cursor-not-allowed bg-gray-100"
													: "cursor-pointer hover:border-blue-400"
											}
                      ${showError ? "border-red-500" : ""}
                    `}
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor={itemId}
										className={`font-medium ${isDisabled ? "text-gray-500" : "text-gray-900 cursor-pointer"}`}
									>
										{optionLabel}
										{field.required && selectedValues.length === 0 && (
											<span className="text-red-500 ml-1"></span>
										)}
									</label>
									{optionDescription && !isInline && (
										<p
											className={`text-sm ${isDisabled ? "text-gray-400" : "text-gray-500"}`}
										>
											{optionDescription}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
				{/* {showError && <p className="mt-1 text-sm text-red-500">{error}</p>} */}
			</>
		);
	}

	// Single checkbox (original behavior)
	return (
		<div className="mt-1">
			<div className="space-x-2">
				<input
					{...field.props}
					id={"id_" + field.name}
					type="checkbox"
					checked={formValues[field.name] || false}
					onChange={(e) => handleChange(field.name, e.target.checked)}
					onBlur={() => handleBlur(field.name)}
					disabled={isDisabled}
					className={`rounded border-gray-300 ${
						isDisabled ? "opacity-50 cursor-not-allowed" : ""
					} ${error ? "border-red-500" : ""}`}
				/>
				<label className="" htmlFor={"id_" + field.name}>
					{field.label}
					{field.required && <span className="text-red-500">*</span>}
				</label>
			</div>
			{/* {error && <p className="mt-1 text-sm text-red-500">{error}</p>} */}
		</div>
	);
}

export default CheckboxField;
