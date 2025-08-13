import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

console.log(`Running migrations in ${isProduction ? 'production' : 'local'} mode...`);

try {
  if (isProduction) {
    // Production: Use Neon PostgreSQL
    console.log('1. Setting up PostgreSQL migrations...');
    
    // Copy all PostgreSQL migrations to main migrations directory
    const postgresDir = path.join('prisma', 'migrations', 'postgres');
    const mainMigrationsDir = path.join('prisma', 'migrations');
    
    if (fs.existsSync(postgresDir)) {
      const postgresFiles = fs.readdirSync(postgresDir);
      
      for (const file of postgresFiles) {
        if (file.endsWith('.sql')) {
          const migrationName = path.parse(file).name;
          const sourceFile = path.join(postgresDir, file);
          const targetDir = path.join(mainMigrationsDir, migrationName);
          const targetFile = path.join(targetDir, 'migration.sql');
          
          // Create target directory
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          // Copy the migration file
          fs.copyFileSync(sourceFile, targetFile);
          console.log(`Copied PostgreSQL migration: ${migrationName}`);
        }
      }
    }
    
    console.log('2. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('3. Running PostgreSQL migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('4. Seeding production database...');
    execSync('npm run seed', { stdio: 'inherit' });
  } else {
    // Local: Use SQLite
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
