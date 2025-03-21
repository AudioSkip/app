import app from '../../src/server';
import serverless from 'serverless-http';

// Configure serverless-http with options to handle Netlify Functions
export default serverless(app, {
  request: (request: any, event: any, context: any) => {
    // Don't modify the request body property
    return request;
  }
});
