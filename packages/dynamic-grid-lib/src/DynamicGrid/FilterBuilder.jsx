import React, { Children, useState } from "react";

// Filter.Field component - only used for configuration
const Field = ({ name, type, size, fieldClass, label, operator, placeholder, includeTime, dateRange }) => null;

const Filter = ({
    children,
    searchForm,
    containerStyle,
    setFilter,
}) => {
    const [localFilterValues, setLocalFilterValues] = useState({});
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Extract <Filter.Field /> config
    const fieldConfigs = [];
    Children.forEach(children, (child) => {
        if (child?.type === Field) {
            fieldConfigs.push(child.props);
        }
    });

    const handlePanelApplyFilters = () => {
        const newFilters = { ...searchForm };
        Object.entries(localFilterValues).forEach(([header, item]) => {
            const type = searchForm[header]?.type;
            const { value, startDate, endDate, operator, startTime, endTime } = item || {};

            // Build the filter entry depending on type
            newFilters[header] = {
                type,
                title: searchForm[header].title,
                field: searchForm[header].field,
                source: searchForm[header].source,
                operator: operator ? operator : type === "Date" ? "between" :
                    type === "Checkbox" ? "in" :
                        operator ?? "contains",
                value:
                    type === "Date" && (startDate || endDate)
                        ? (startDate && endDate) ? `${startDate} ${startTime || ''} and ${endDate} ${endTime || ''}` : startDate ? `${startDate} ${startTime || ''} ` : endDate ? `${endDate} ${endTime || ''}` : ''
                        : type === "Checkbox"
                            ? item
                            : value,

                displayValue:
                    type === "Date" && (startDate && endDate)
                        ? `${startDate} ${startTime || ''} to ${endDate} ${endTime || ''}` :
                        type === "Date" && (startDate || endDate) ?
                            `${startDate} ${startTime || ''} ${endDate} ${endTime || ''}`
                            : type === "Checkbox"
                                ? item.map((val) => searchForm[header].source?.[val]).join(', ')
                                : value
            };
        });

        setFilter(newFilters);
    };

    // If no <Filter.Field /> defined, use searchForm fully
    const fieldsToRender =
        fieldConfigs.length > 0
            ? fieldConfigs
            : Object.keys(searchForm || {}).map((key) => ({
                name: key,
                type: searchForm[key]?.type,
            }));

    const renderField = (fieldConfig) => {
        const {
            name,
            type: configType,
            size,
            fieldClass,
            label,
            operator: defaultOperator,
            placeholder,
            includeTime,
            dateRange,
        } = fieldConfig;

        const filterField = searchForm?.[name];
        if (!filterField) return null;

        const fieldType = configType || filterField.type;
        const fieldLabel = label || filterField.title || name;
        const fieldOperator = filterField.operator

        if (fieldType === "Date") {
            const currentValue = localFilterValues[name] || {};

            return (
                <div key={name} className={`space-y-2 ${fieldClass || "md:col-span-3"}`}>
                    <label className="block text-sm font-medium text-gray-700">{fieldLabel}</label>

                    <div className={`grid grid-cols-2 gap-2`}>
                        <input
                            type="date"
                            value={currentValue.startDate || ""}
                            onChange={(e) => {
                                const updated = {
                                    type: fieldType,
                                    startDate: e.target.value,
                                    endDate: currentValue.endDate || "",
                                    operator: fieldOperator || "between",

                                };

                                setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
                            }}
                            placeholder={placeholder || "From"}
                            className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                        {includeTime && (
                            <input
                                type="time"
                                value={currentValue.startTime || ""}
                                onChange={(e) => {
                                    const updated = {
                                        type: fieldType,
                                        startDate: currentValue.startDate || "",
                                        startTime: e.target.value,
                                        endDate: currentValue.endDate || "",
                                        endTime: currentValue.endTime || "",
                                        operator: currentValue.operator || "between",
                                    };

                                    setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
                                }}
                                placeholder="From Time"
                                className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                            />
                        )}
                        {dateRange !== false && (
                            <>
                                <input
                                    type="date"
                                    value={currentValue.endDate || ""}
                                    onChange={(e) => {
                                        const updated = {
                                            type: fieldType,
                                            startDate: currentValue.startDate || "",
                                            endDate: e.target.value,
                                            operator: currentValue.operator || "between",
                                        };

                                        setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
                                    }}
                                    placeholder="To"
                                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                />

                                {includeTime && (
                                    <input
                                        type="time"
                                        value={currentValue.endTime || ""}
                                        onChange={(e) => {
                                            const updated = {
                                                type: fieldType,
                                                startDate: currentValue.startDate || "",
                                                startTime: currentValue.startTime || "",
                                                endDate: currentValue.endDate || "",
                                                endTime: e.target.value,
                                                operator: currentValue.operator || "between",
                                            };
                                            setLocalFilterValues((prev) => ({ ...prev, [name]: updated }));
                                        }}
                                        placeholder="To Time"
                                        className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        if (fieldType === "Checkbox") {
            const selectedValues = Array.isArray(localFilterValues[name])
                ? localFilterValues[name]
                : [];

            const isOpen = openDropdowns[name] || false;
            const toggleValue = (value) => {
                const current = Array.isArray(localFilterValues[name])
                    ? localFilterValues[name]
                    : [];

                const updated = current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value];

                setLocalFilterValues((prev) => ({
                    ...prev,
                    [name]: updated,
                }));


            };

            const removeValue = (value, e) => {
                e.stopPropagation();
                const updated = selectedValues.filter((v) => v !== value);

                setLocalFilterValues((prev) => ({
                    ...prev,
                    [name]: updated,
                }));

            };

            return (
                <div key={name} className={`space-y-2 ${fieldClass || "md:col-span-3"}`}>
                    <label className="block text-sm font-medium text-gray-700">{fieldLabel}</label>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setOpenDropdowns((prev) => ({ ...prev, [name]: !isOpen }))
                            }
                            className="w-full min-h-[42px] bg-white border border-gray-300 rounded-md p-2 text-sm text-left hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="flex flex-wrap gap-1.5 items-center">
                                {selectedValues.length > 0 ? (
                                    selectedValues.map((value) => (
                                        <span
                                            key={value}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                        >
                                            {filterField.source?.[value]}

                                            <button
                                                onClick={(e) => removeValue(value, e)}
                                                className="hover:text-blue-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">
                                        Select {fieldLabel.toLowerCase()}…
                                    </span>
                                )}

                                <svg
                                    className="ml-auto w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </button>

                        {isOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() =>
                                        setOpenDropdowns((prev) => ({ ...prev, [name]: false }))
                                    }
                                />

                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    <div className="p-2">
                                        {filterField.source &&
                                            Object.entries(filterField.source).map(([value, label]) => {
                                                const isSelected = selectedValues.includes(value);

                                                return (
                                                    <label
                                                        key={value}
                                                        className={`flex items-center px-3 py-2 cursor-pointer rounded hover:bg-gray-100 ${isSelected ? "bg-blue-50" : ""
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleValue(value)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span
                                                            className={`ml-2 text-sm ${isSelected
                                                                ? "text-blue-700 font-medium"
                                                                : "text-gray-700"
                                                                }`}
                                                        >
                                                            {label}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div key={name} className={`space-y-2 ${fieldClass || "md:col-span-3"}`}>
                <label className="block text-sm font-medium text-gray-700">{fieldLabel}</label>

                <input
                    type="text"
                    value={localFilterValues[name]?.value || ""}
                    onChange={(e) => {
                        const value = e.target.value;

                        const updated = {
                            type: fieldType,
                            value,
                            operator: "contains",
                        };

                        setLocalFilterValues((prev) => ({
                            ...prev,
                            [name]: updated,
                        }));

                    }}
                    placeholder={placeholder || `Enter ${fieldLabel.toLowerCase()}…`}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                />
            </div>
        );
    };

    return (
        <div className={`w-full ${containerStyle || ""}`}>
            <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-12">
                {fieldsToRender.map((fieldConfig) => renderField(fieldConfig))}
            </div>

            <div className="flex gap-2 pt-3">
                <button onClick={handlePanelApplyFilters} className="btn primary">
                    Apply Filters
                </button>
                <button onClick={() => {
                    setLocalFilterValues({});
                    setFilter({});
                }} className="btn outline">
                    Clear Filters
                </button>
            </div>
        </div>
    );
};

Filter.Field = Field;

export default Filter;
