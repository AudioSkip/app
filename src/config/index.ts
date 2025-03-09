import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    apiToken: process.env.WHATSAPP_API_TOKEN || '',
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com/v18.0'
  },
  environment: process.env.NODE_ENV || 'development'
};

// Validate required configuration
const validateConfig = () => {
  const requiredEnvVars = [
    { key: 'whatsapp.verifyToken', value: config.whatsapp.verifyToken },
    { key: 'whatsapp.apiToken', value: config.whatsapp.apiToken }
  ];

  const missingEnvVars = requiredEnvVars
    .filter(env => !env.value)
    .map(env => env.key);

  if (missingEnvVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.warn('Please set these variables in your .env file or environment.');
  }
};

validateConfig();

export default config; 