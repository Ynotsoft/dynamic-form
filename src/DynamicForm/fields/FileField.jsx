import React from 'react'
import { toast } from "react-hot-toast";
import { config } from "../../config.jsx";

function FileField({
  field,
  formValues,
  touched,
  errors,
  fileUploads,
  setFileUploads,
  fileInputRefs,
  handleChange,
  onFieldsChange
}) {
  const error = touched[field.name] && errors[field.name];
  const isMultiple = field.type === "multifile";
  const uploads = fileUploads[field.name] || {};
  const currentValues = formValues[field.name];
  const values = isMultiple
    ? currentValues || []
    : [currentValues].filter(Boolean);
  const isDisabled = field.disabled && field.disabled(formValues);
  const disablebtnClasses = `px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 ${isDisabled ? "cursor-not-allowed" : ""
    }`;

  const uploadUrl = `${config.REACT_API_URL}uploads`;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadFile = async (file, fieldName) => {
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

    const data = await response.json();
    return data;
  };

  const handleSingleFileUpload = async (field, file) => {
    if (!file) return;

    // Validate file size
    if (field.maxSize && file.size > field.maxSize) {
      throw new Error(
        `File size must not exceed ${formatFileSize(field.maxSize)}`
      );
    }

    // Upload the file
    const uploadedData = await uploadFile(file, field.name);

    // Update form values with the uploaded URL
    const newValues = { ...formValues, [field.name]: uploadedData };
    handleChange(field.name, uploadedData);
    onFieldsChange(newValues);
  };

  const handleMultiFileUpload = async (field, files) => {
    const currentUrls = formValues[field.name] || [];
    if (currentUrls.length + files.length > field.maxFiles) {
      throw new Error(`Maximum ${field.maxFiles} files allowed`);
    }

    // Validate each file size
    files.forEach((file) => {
      if (field.maxSize && file.size > field.maxSize) {
        throw new Error(
          `Each file must not exceed ${formatFileSize(field.maxSize)}`
        );
      }
    });

    // Upload all files
    const uploadedUrls = await Promise.all(
      files.map((file) => uploadFile(file, field.name))
    );

    // Update form values with the new URLs
    const newUrls = [...currentUrls, ...uploadedUrls];
    handleChange(field.name, newUrls);
    onFieldsChange({ ...formValues, [field.name]: newUrls });
  };

  const handleFileChange = async (fieldName, files) => {
    const fileList = Array.from(files);

    try {
      if (field.type === "file") {
        await handleSingleFileUpload(field, fileList[0]);
      } else if (field.type === "multifile") {
        await handleMultiFileUpload(field, fileList);
      }

      // Clear file input after processing
      if (fileInputRefs.current[fieldName]) {
        fileInputRefs.current[fieldName].value = ""; // This resets the file input field
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const removeFile = async (fieldName, urlToRemove) => {
    let newValue;

    if (field.type === "file") {
      newValue = "";
    } else {
      const urls = formValues[fieldName] || [];
      newValue = urls.filter((url) => url !== urlToRemove);
    }

    handleChange(fieldName, newValue);
    onFieldsChange({ ...formValues, [fieldName]: newValue });

    // Reset the file input field after removing the file
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = ""; // Reset file input after removing
    }
  };

  return (
    <div key={field.name} className={`mb-4 ${field.fieldClass || 'col-span-full'}`}>
      <label className="block font-medium mb-1">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-2">
        <div className="items-center space-x-2">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => fileInputRefs.current[field.name].click()}
            className={disablebtnClasses}
          >
            Choose {isMultiple ? "Files" : "File"}
          </button>
          {isMultiple && values.length > 0 && (
            <span className="text-sm text-gray-600">
              {values.length} of {field.maxFiles} files uploaded
            </span>
          )}
        </div>

        <input
          ref={(el) => (fileInputRefs.current[field.name] = el)}
          type="file"
          accept={field.accept}
          multiple={isMultiple}
          className="hidden"
          onChange={(e) => handleFileChange(field.name, e.target.files)}
        />

        {/* Uploaded Files List */}
        <div className="space-y-2">
          {values.map((file, index) => {
            const upload = Object.values(uploads).find(
              (u) => u.file === file
            );
            return (
              <div
                key={file}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-2">
                  {upload && (
                    <>
                      <span className="text-sm">{upload.fileName}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(upload.fileSize)})
                      </span>
                    </>
                  )}
                  {!upload && (
                    <span className="text-sm">{file.original_name}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(field.name, file)}
                  className="text-red-500 hover:text-red-700 ml-3"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

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

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FileField;