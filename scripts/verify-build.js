#!/usr/bin/env node
/**
 * Build Verification Script for DPRIDE School System
 * This script ensures that builds pass before pushing to production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DPRIDE Build Verification Started...\n');

try {
  // Step 1: Check if working directory is clean
  console.log('📋 Checking git status...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (gitStatus.trim()) {
    console.log('⚠️  Warning: You have uncommitted changes');
    console.log('📝 Changes detected:');
    console.log(gitStatus);
  } else {
    console.log('✅ Working directory is clean');
  }

  // Step 2: Run TypeScript check
  console.log('\n🔍 Running TypeScript compilation check...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.log('❌ TypeScript compilation failed!');
    console.log('💡 Please fix TypeScript errors before proceeding');
    process.exit(1);
  }

  // Step 3: Run Next.js build
  console.log('\n🏗️  Running Next.js build...');
  try {
    const buildOutput = execSync('npm run build', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    
    if (buildOutput.includes('Failed to compile')) {
      console.log('❌ Build failed!');
      console.log(buildOutput);
      process.exit(1);
    }
    
    console.log('✅ Next.js build successful');
  } catch (error) {
    console.log('❌ Build failed!');
    console.log(error.stdout || error.message);
    process.exit(1);
  }

  // Step 4: Check for common issues
  console.log('\n🔎 Checking for common issues...');
  
  const commonIssues = [
    {
      name: 'Material-UI imports',
      pattern: /import.*from ['"]@mui\/['"]/,
      files: ['**/*.tsx', '**/*.ts']
    },
    {
      name: 'Implicit any types in map functions',
      pattern: /\.map\(\w+\)\s*=>/,
      files: ['app/**/*.tsx']
    }
  ];

  for (const issue of commonIssues) {
    try {
      const grepOutput = execSync(
        `grep -r "${issue.pattern}" --include=${issue.files.join(' --include=')} .`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      if (grepOutput.trim()) {
        console.log(`⚠️  Potential ${issue.name} found:`);
        console.log(grepOutput);
      }
    } catch (error) {
      // No matches found, which is good
      console.log(`✅ No ${issue.name} issues found`);
    }
  }

  console.log('\n🎉 Build verification completed successfully!');
  console.log('🚀 Your code is ready for production deployment!');

} catch (error) {
  console.log('\n💥 Build verification failed!');
  console.log('❌ Error:', error.message);
  process.exit(1);
}
