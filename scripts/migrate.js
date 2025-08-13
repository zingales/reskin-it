import { execSync } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production';
const isLocal = !isProduction;

console.log(`Running migrations in ${isProduction ? 'production' : 'local'} mode...`);

try {
  if (isProduction) {
    // Production: Use PostgreSQL migrations
    console.log('1. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('2. Running PostgreSQL migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('3. Seeding production database...');
    execSync('npm run seed', { stdio: 'inherit' });
  } else {
    // Local: Use SQLite migrations
    console.log('1. Generating Prisma client for SQLite...');
    execSync('npx prisma generate --schema=./prisma/schema.sqlite.prisma', { stdio: 'inherit' });
    
    console.log('2. Running SQLite migrations...');
    execSync('npx prisma migrate deploy --schema=./prisma/schema.sqlite.prisma', { stdio: 'inherit' });
    
    console.log('3. Seeding local database...');
    execSync('npm run seed', { stdio: 'inherit' });
  }
  
  console.log('✅ Migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
