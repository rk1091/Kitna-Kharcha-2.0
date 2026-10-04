const fs = require('fs');
const { execSync } = require('child_process');

console.log('1. Setting up tsconfig.json...');
const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
tsconfig.compilerOptions.baseUrl = '.';
tsconfig.compilerOptions.paths = { '@/*': ['./src/*'] };
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

console.log('2. Setting up vite.config.ts...');
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`;
fs.writeFileSync('vite.config.ts', viteConfig);

console.log('3. Writing components.json...');
const componentsJson = {
  '$schema': 'https://ui.shadcn.com/schema.json',
  style: 'default',
  rsc: false,
  tsx: true,
  tailwind: {
    config: 'tailwind.config.js',
    css: 'src/index.css',
    baseColor: 'slate',
    cssVariables: true,
    prefix: ''
  },
  aliases: {
    components: '@/components',
    utils: '@/lib/utils'
  }
};
fs.writeFileSync('components.json', JSON.stringify(componentsJson, null, 2));

console.log('4. Installing dependencies...');
execSync('npm install -D @types/node tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot', { stdio: 'inherit' });

console.log('5. Creating utils file...');
if (!fs.existsSync('src/lib')) fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/utils.ts', `import { type ClassValue, clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`);

console.log('6. Updating tailwind.config.js...');
fs.writeFileSync('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
}`);

console.log('All foundational setup complete!');
