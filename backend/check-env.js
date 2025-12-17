// Environment variable checker for Render deployment
const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

console.log('🔍 Checking environment variables...');

let allPresent = true;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.log('\n❌ Some required environment variables are missing!');
  console.log('Please check your Render environment variables configuration.');
  process.exit(1);
}

console.log('\n✅ All environment variables are present!');