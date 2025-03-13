import fetch from 'node-fetch';
import config from '../config';

/**
 * Simulate a WhatsApp webhook event
 */
async function simulateWebhookEvent() {
  try {
    const baseUrl = `http://localhost:${config.port}/api/webhook`;
    
    console.log('Simulating WhatsApp webhook event...');
    console.log(`URL: ${baseUrl}`);
    
    // Simulate a text message event
    const textMessageEvent = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123456789',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15551234567',
                  phone_number_id: '987654321'
                },
                contacts: [
                  {
                    profile: {
                      name: 'Test User'
                    },
                    wa_id: '15557654321'
                  }
                ],
                messages: [
                  {
                    from: '15557654321',
                    id: 'wamid.abcdefghijklmnopqrstuvwxyz',
                    timestamp: new Date().toISOString(),
                    type: 'text',
                    text: {
                      body: 'Hello, this is a test message!'
                    }
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };
    
    console.log('\nSending text message event:');
    console.log(JSON.stringify(textMessageEvent, null, 2));
    
    const textResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(textMessageEvent)
    });
    
    const textData = await textResponse.text();
    
    console.log(`Status: ${textResponse.status}`);
    console.log(`Response: ${textData}`);
    
    if (textResponse.status === 200 && textData === 'EVENT_RECEIVED') {
      console.log('✅ Text message event simulation successful!');
    } else {
      console.log('❌ Text message event simulation failed!');
    }
    
    // Simulate a status update event
    const statusUpdateEvent = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123456789',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15551234567',
                  phone_number_id: '987654321'
                },
                statuses: [
                  {
                    id: 'wamid.abcdefghijklmnopqrstuvwxyz',
                    recipient_id: '15557654321',
                    status: 'delivered',
                    timestamp: new Date().toISOString(),
                    conversation: {
                      id: 'conversation_id_123'
                    }
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };
    
    console.log('\nSending status update event:');
    console.log(JSON.stringify(statusUpdateEvent, null, 2));
    
    const statusResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusUpdateEvent)
    });
    
    const statusData = await statusResponse.text();
    
    console.log(`Status: ${statusResponse.status}`);
    console.log(`Response: ${statusData}`);
    
    if (statusResponse.status === 200 && statusData === 'EVENT_RECEIVED') {
      console.log('✅ Status update event simulation successful!');
    } else {
      console.log('❌ Status update event simulation failed!');
    }
    
  } catch (error) {
    console.error('Error simulating webhook event:', error);
  }
}

// Run the simulation
simulateWebhookEvent(); 