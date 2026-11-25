
const allowedFieldTypes = [
  "text",
  "email",
  "number",
  "phone",
  "textarea",
  "date",
  "select",
  "radio",
  "checkbox",
];

const validateForm = (formData) => {
  const errors = [];

  // 1. Validate form data
  if (
    !formData ||
    typeof formData !== "object" ||
    Array.isArray(formData)
  ) {
    errors.push("Form data is required");
    return errors;
  }

  // 2. Validate form name
  if (
    typeof formData.name !== "string" ||
    !formData.name.trim()
  ) {
    errors.push("Form name is required");
  }

  // 3. Validate fields array
  if (!Array.isArray(formData.fields)) {
    errors.push("Fields must be an array");
    return errors;
  }

  if (formData.fields.length === 0) {
    errors.push("Form must contain at least one field");
  }

  // 4. Validate individual fields
  const usedKeys = new Set();

  formData.fields.forEach((field, index) => {
    // Check field object
    if (
      !field ||
      typeof field !== "object" ||
      Array.isArray(field)
    ) {
      errors.push(`Field ${index + 1}: Invalid field object`);
      return;
    }

    // Validate label
    if (
      typeof field.label !== "string" ||
      !field.label.trim()
    ) {
      errors.push(`Field ${index + 1}: Label is required`);
    }

    // Validate key
    if (
      typeof field.key !== "string" ||
      !field.key.trim()
    ) {
      errors.push(`Field ${index + 1}: Key is required`);
    } else {
      const normalizedKey = field.key.trim().toLowerCase();

      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.key.trim())) {
        errors.push(
          `Field ${index + 1}: Key must start with a letter and contain only letters, numbers, and underscores`
        );
      }

      // Check duplicate keys
      if (usedKeys.has(normalizedKey)) {
        errors.push(`Duplicate field key: ${field.key}`);
      }

      usedKeys.add(normalizedKey);
    }

    // Validate field type
    if (!field.type) {
      errors.push(`Field ${index + 1}: Type is required`);
    } else if (!allowedFieldTypes.includes(field.type)) {
      errors.push(`Field ${index + 1}: Invalid field type`);
    }

    // Validate required property
    if (
      field.required !== undefined &&
      typeof field.required !== "boolean"
    ) {
      errors.push(
        `Field ${index + 1}: Required must be true or false`
      );
    }

    // Validate options
    if (["select", "radio", "checkbox"].includes(field.type)) {
      if (
        !Array.isArray(field.options) ||
        field.options.length === 0
      ) {
        errors.push(
          `Field ${index + 1}: Options are required for ${field.type}`
        );
      } else {
        const invalidOptions = field.options.some(
          (option) =>
            typeof option !== "string" || !option.trim()
        );

        if (invalidOptions) {
          errors.push(
            `Field ${index + 1}: Options must be non-empty strings`
          );
        }

        const normalizedOptions = field.options
          .filter((option) => typeof option === "string")
          .map((option) => option.trim().toLowerCase());

        if (
          new Set(normalizedOptions).size !==
          normalizedOptions.length
        ) {
          errors.push(
            `Field ${index + 1}: Duplicate options are not allowed`
          );
        }
      }
    }

    // Validate minLength
    if (
      field.minLength !== undefined &&
      (!Number.isInteger(field.minLength) || field.minLength < 0)
    ) {
      errors.push(
        `Field ${index + 1}: minLength must be a non-negative integer`
      );
    }

    // Validate maxLength
    if (
      field.maxLength !== undefined &&
      (!Number.isInteger(field.maxLength) || field.maxLength < 0)
    ) {
      errors.push(
        `Field ${index + 1}: maxLength must be a non-negative integer`
      );
    }

    if (
      typeof field.minLength === "number" &&
      typeof field.maxLength === "number" &&
      field.minLength > field.maxLength
    ) {
      errors.push(
        `Field ${index + 1}: minLength cannot exceed maxLength`
      );
    }

    // Validate min
    if (
      field.min !== undefined &&
      (typeof field.min !== "number" || !Number.isFinite(field.min))
    ) {
      errors.push(
        `Field ${index + 1}: min must be a valid number`
      );
    }

    // Validate max
    if (
      field.max !== undefined &&
      (typeof field.max !== "number" || !Number.isFinite(field.max))
    ) {
      errors.push(
        `Field ${index + 1}: max must be a valid number`
      );
    }

    if (
      typeof field.min === "number" &&
      typeof field.max === "number" &&
      field.min > field.max
    ) {
      errors.push(
        `Field ${index + 1}: min cannot exceed max`
      );
    }
  });

  // 5. Validate form status
  if (
    formData.status !== undefined &&
    !["draft", "published"].includes(formData.status)
  ) {
    errors.push("Invalid form status");
  }

  return errors;
};

module.exports = validateForm;
