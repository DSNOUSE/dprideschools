/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are set
 * and throws descriptive errors if any are missing.
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;
  
  // NextAuth
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  
  // Sanity CMS
  NEXT_PUBLIC_SANITY_PROJECT_ID: string;
  NEXT_PUBLIC_SANITY_DATASET: string;
  SANITY_PREVIEW_SECRET?: string;
  
  // Node Environment
  NODE_ENV: 'development' | 'production' | 'test';
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required variables
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }
  
  // Validate NEXTAUTH_SECRET in production
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || secret.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters in production');
    }
    if (secret === 'development-secret-key-change-in-production') {
      errors.push('NEXTAUTH_SECRET is set to default development value in production');
    }
  }
  
  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }
  
  if (errors.length > 0) {
    throw new EnvironmentError(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  };
}

// Validate on module load (server-side only)
let env: EnvConfig;

try {
  env = validateEnv();
} catch (error) {
  if (error instanceof EnvironmentError) {
    console.error('\n' + '='.repeat(80));
    console.error('ENV VALIDATION ERROR');
    console.error('='.repeat(80));
    console.error(error.message);
    console.error('='.repeat(80) + '\n');
    
    // In development, provide helpful guidance
    if (process.env.NODE_ENV !== 'production') {
      console.error('💡 Quick fix:');
      console.error('   1. Copy env.example to .env');
      console.error('   2. Fill in the required values');
      console.error('   3. Restart the development server\n');
    }
    
    process.exit(1);
  }
  throw error;
}

export { env };
