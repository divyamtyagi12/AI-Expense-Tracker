// frontend/src/utils/getErrorMessage.js
// Our backend returns errors as either:
//   { success: false, message: "..." }
//   { success: false, message: "Validation failed", errors: [{field, message}] }
// This helper normalizes both shapes into a single readable string.

export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';

  if (data.errors?.length) {
    return data.errors.map((e) => e.message).join(', ');
  }

  return data.message || 'Something went wrong. Please try again.';
}
