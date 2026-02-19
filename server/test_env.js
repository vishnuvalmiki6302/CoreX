const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

console.log('Current Directory:', process.cwd());
const envPath = path.join(process.cwd(), '.env');
console.log('Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file found.');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File Content Start:');
    console.log(content.substring(0, 100) + '...');
    console.log('File Content End');
} else {
    console.log('.env file NOT found!');
}

const result = dotenv.config();
if (result.error) {
    console.log('Dotenv Error:', result.error);
}

console.log('Loaded Environment Variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
