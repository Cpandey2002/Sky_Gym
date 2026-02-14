export const validateName = (value = "") => {
  const name = value.trim();

  if (!name) return "Name is required";

  // Only alphabets & spaces (no dots, no special characters)
  if (!/^[A-Za-z ]+$/.test(name))
    return "Only alphabets and spaces are allowed";

  // Minimum 3 characters
  if (name.length < 3) return "Name must be at least 3 characters";

  // Maximum 20 characters
  if (name.length > 20) return "Name cannot exceed 20 characters";

  // No dot allowed
  if (name.includes(".")) return "Dots are not allowed in the name";

  return "";
};

export const validateAddress = (value = "") => {
  const v = value.trim();

  if (!v) return "Address is required";

  // BLOCK emoji
  if (/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(v))
    return "Emoji not allowed";

  // LENGTH CHECK
  if (v.length < 3) return "Address must be at least 3 characters";
  if (v.length > 50) return "Address cannot exceed 50 characters";

  // ALLOWED: alphabets, numbers, spaces
  // NOT ALLOWED: special characters
  if (!/^[A-Za-z0-9 ]+$/.test(v)) return "Special characters are not allowed";

  return "";
};

export const validateMobile = (value = "") => {
  const v = value.trim();

  if (!v) return "Mobile number is required";

  // Indian numbers: must start with 6/7/8/9 and be exactly 10 digits
  if (!/^[6-9][0-9]{9}$/.test(v)) {
    return "Enter valid Indian 10-digit mobile number";
  }

  // ❌ Reject numbers where all digits are the same (000..., 777..., 999...)
  if (/^([0-9])\1{9}$/.test(v)) {
    return "Mobile number cannot have all digits the same";
  }

  return "";
};

export const validateEmail = (value = "") => {
  const v = value.trim();

  if (!v) return "Email is required";

  // BLOCK emojis
  if (/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(v))
    return "Emoji not allowed in email";

  // STRICT EMAIL REGEX (no emojis, no ending dots, no invalid chars)
  const emailRegex =
    /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(v)) return "Enter a valid email address";

  return "";
};

export const validateReceivedFrom = (value = "") => {
  const v = value.trim();

  if (!v) return "Field is required";

  // Only letters and spaces allowed
  if (!/^[A-Za-z ]+$/.test(v)) return "Only letters allowed";

  // Min 3, Max 20 characters
  if (v.length < 3 || v.length > 20)
    return "Must be between 3 and 20 characters";

  return "";
};

export const validateNotFutureDate = (value = "") => {
  if (!value) return "Date required";
  const today = new Date().toISOString().split("T")[0];
  if (value > today) return "Date cannot be in future";
  return "";
};

export const validateEnquiryDate = (value = "") => {
  if (!value) return "Date required";
  const today = new Date().toISOString().split("T")[0];
  if (value > today) return "Date cannot be in future";
  return "";
};

export const validateFromDate = (value = "") => {
  if (!value) return "From date required";
  return "";
};

export const validateDuration = (value = "") => {
  if (!value) return "Duration required";

  // Reject decimal numbers (e.g., 1.34, 2.5, 3.99)
  if (!/^[0-9]+$/.test(value)) {
    return "Duration must be a whole number (no decimals)";
  }

  // Reject 0 or negative values
  if (parseInt(value) <= 0) {
    return "Enter valid months";
  }

  return "";
};

export const validateDOB = (value = "") => {
  if (!value) return "DOB required";

  // Accept DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
  const dobRegex =
    /^((0[1-9]|[12][0-9]|3[01])[\/-](0[1-9]|1[0-2])[\/-](1[0-9]{3}|20[0-9]{2})|(1[0-9]{3}|20[0-9]{2})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$/;

  if (!dobRegex.test(value)) {
    return "Enter valid DOB (DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD)";
  }

  return "";
};

export const validateAmount = (value = "") => {
  if (!value) return "Amount required";

  // Allow only numbers with optional decimals (00 or 00.00)
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return "Invalid amount";
  }

  const num = parseFloat(value);

  // LIMIT: Max 1 lakh
  if (num > 100000) {
    return "Amount cannot exceed 1,00,000";
  }

  if (num <= 0) {
    return "Amount must be greater than 0";
  }

  return "";
};

export const validateSessions = (value = "") => {
  if (!value) return "Sessions required";
  if (isNaN(value) || value <= 0) return "Enter valid session count";
  return "";
};

// REMOVE EMOJIS
export const removeEmojis = (text) =>
  text?.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u24C2|\uFE0F)/g,
    ""
  );

// REQUIRED FIELD
export const validateRequired = (value, field) => {
  if (!value?.toString().trim()) return `${field} is required`;
  return "";
};

export const validateCategoryId = (value = "") => {
  if (!value) return "Please select a category";
  return "";
};

// Missing — required for Renew page
export const validateToDate = (value = "") => {
  if (!value) return "To Date is required";
  return "";
};

// Missing — used in Renew page validation
export const validateFromDateRenew = (value = "") => {
  if (!value) return "From Date is required";
  return "";
};

export const validateDescription = (value = "") => {
  const v = value.trim();

  // ✅ If empty → NO ERROR (optional field)
  if (!v) return "";

  // Min & max length (only when entered)
  if (v.length < 3 || v.length > 200)
    return "Description must be between 3 and 200 characters";

  // Block emojis
  if (/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(v))
    return "Emoji not allowed";

  // Block ONLY special characters like !@#$%^&*()
  if (!/[a-zA-Z0-9]/.test(v))
    return "Description cannot contain only special characters";

  return "";
};
