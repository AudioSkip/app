import axios from 'axios';
import config from '../config';

/**
 * Test the webhook verification endpoint
 */
async function testWebhookVerification() {
  try {
    const baseUrl = `http://localhost:${config.port}/api/webhook`;
    const verifyToken = config.whatsapp.verifyToken;
    const challenge = 'test_challenge_string';
    
    console.log('Testing webhook verification...');
    console.log(`URL: ${baseUrl}`);
    console.log(`Verify Token: ${verifyToken}`);
    console.log(`Challenge: ${challenge}`);
    
    // Test with correct verify token
    const correctResponse = await axios.get(baseUrl, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': challenge
      }
    });
    
    console.log('\nCorrect verify token test:');
    console.log(`Status: ${correctResponse.status}`);
    console.log(`Response: ${correctResponse.data}`);
    
    if (correctResponse.status === 200 && correctResponse.data === challenge) {
      console.log('✅ Webhook verification successful!');
    } else {
      console.log('❌ Webhook verification failed!');
    }
    
    // Test with incorrect verify token
    try {
      const incorrectResponse = await axios.get(baseUrl, {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong_token',
          'hub.challenge': challenge
        }
      });
      
      console.log('\nIncorrect verify token test:');
      console.log(`Status: ${incorrectResponse.status}`);
      console.log('❌ Test failed! Should have received a 403 error.');
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.log('\nIncorrect verify token test:');
        console.log(`Status: ${error.response.status}`);
        console.log('✅ Test passed! Received expected 403 error.');
      } else {
        throw error;
      }
    }
    
    // Test with missing parameters
    try {
      const missingParamsResponse = await axios.get(baseUrl);
      
      console.log('\nMissing parameters test:');
      console.log(`Status: ${missingParamsResponse.status}`);
      console.log('❌ Test failed! Should have received a 400 error.');
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.log('\nMissing parameters test:');
        console.log(`Status: ${error.response.status}`);
        console.log('✅ Test passed! Received expected 400 error.');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('Error testing webhook verification:', error);
  }
}

// Run the test
testWebhookVerification(); 