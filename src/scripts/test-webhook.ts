import fetch from 'node-fetch';
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
    const correctUrl = new URL(baseUrl);
    correctUrl.searchParams.append('hub.mode', 'subscribe');
    correctUrl.searchParams.append('hub.verify_token', verifyToken);
    correctUrl.searchParams.append('hub.challenge', challenge);
    
    const correctResponse = await fetch(correctUrl.toString());
    const correctData = await correctResponse.text();
    
    console.log('\nCorrect verify token test:');
    console.log(`Status: ${correctResponse.status}`);
    console.log(`Response: ${correctData}`);
    
    if (correctResponse.status === 200 && correctData === challenge) {
      console.log('✅ Webhook verification successful!');
    } else {
      console.log('❌ Webhook verification failed!');
    }
    
    // Test with incorrect verify token
    try {
      const incorrectUrl = new URL(baseUrl);
      incorrectUrl.searchParams.append('hub.mode', 'subscribe');
      incorrectUrl.searchParams.append('hub.verify_token', 'wrong_token');
      incorrectUrl.searchParams.append('hub.challenge', challenge);
      
      const incorrectResponse = await fetch(incorrectUrl.toString());
      
      console.log('\nIncorrect verify token test:');
      console.log(`Status: ${incorrectResponse.status}`);
      
      if (incorrectResponse.status === 403) {
        console.log('✅ Test passed! Received expected 403 error.');
      } else {
        console.log('❌ Test failed! Should have received a 403 error.');
      }
    } catch (error: any) {
      console.error('Error in incorrect token test:', error);
    }
    
    // Test with missing parameters
    try {
      const missingParamsResponse = await fetch(baseUrl);
      
      console.log('\nMissing parameters test:');
      console.log(`Status: ${missingParamsResponse.status}`);
      
      if (missingParamsResponse.status === 400) {
        console.log('✅ Test passed! Received expected 400 error.');
      } else {
        console.log('❌ Test failed! Should have received a 400 error.');
      }
    } catch (error: any) {
      console.error('Error in missing parameters test:', error);
    }
    
  } catch (error) {
    console.error('Error testing webhook verification:', error);
  }
}

// Run the test
testWebhookVerification(); 