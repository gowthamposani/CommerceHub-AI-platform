export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;

export function validateRequired(value: string, label: string): string | null {
  return value.trim().length === 0 ? `${label} is required` : null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) {
    return 'Email is required';
  }

  return emailPattern.test(value.trim()) ? null : 'Enter a valid email address';
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Za-z]/.test(value)) {
    return 'Password must contain at least one letter';
  }

  if (!/\d/.test(value)) {
    return 'Password must contain at least one number';
  }

  return null;
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  return /^[+()\d\s-]{7,30}$/.test(value.trim()) ? null : 'Enter a valid phone number';
}

