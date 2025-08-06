import bcrypt from 'bcryptjs';

// Salt rounds for bcrypt hashing
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Minimum length check
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Maximum length check
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Check for at least one letter (either case)
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  // Check for at least one number (optional for demo)
  if (!/\d/.test(password) && password.length < 8) {
    errors.push('Password must contain at least one number if less than 8 characters');
  }

  // For demo purposes, allow common passwords but warn
  const commonPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty',
    'abc123', 'password1', 'admin', 'letmein', 'welcome'
  ];
  
  // Only add warning for very weak passwords
  if (commonPasswords.includes(password.toLowerCase()) && password.length < 6) {
    errors.push('Password is too weak, please choose a stronger password');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate a random password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = lowercase + uppercase + numbers + specialChars;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill the remaining length with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a secure salt (for additional security if needed)
 */
export const generateSalt = async (rounds: number = SALT_ROUNDS): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(rounds);
    return salt;
  } catch (error) {
    throw new Error('Failed to generate salt');
  }
};

/**
 * Check if a password hash is valid/properly formatted
 */
export const isValidPasswordHash = (hash: string): boolean => {
  // bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost and salt
  const bcryptPattern = /^\$2[abyxy]?\$[0-9]{2}\$.{53}$/;
  return bcryptPattern.test(hash);
};

/**
 * Get the cost/rounds used in a bcrypt hash
 */
export const getHashCost = (hash: string): number | null => {
  try {
    const match = hash.match(/^\$2[abyxy]?\$([0-9]{2})\$/);
    return match ? parseInt(match[1], 10) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if a password hash needs to be rehashed (due to outdated cost)
 */
export const needsRehash = (hash: string): boolean => {
  const currentCost = getHashCost(hash);
  return currentCost !== null && currentCost < SALT_ROUNDS;
}; 