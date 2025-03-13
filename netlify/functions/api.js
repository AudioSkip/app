const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const FormData = require('form-data');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
// Add node-fetch for Node.js environments
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initialize express app
const app = express();

// Get environment variables
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log environment for debugging
console.log(`Running in ${NODE_ENV} environment`);
console.log(`Verify token is ${WHATSAPP_VERIFY_TOKEN ? 'set' : 'not set'}`);
console.log(`WhatsApp API token is ${WHATSAPP_API_TOKEN ? 'set' : 'not set'}`);
console.log(`OpenAI API key is ${OPENAI_API_KEY ? 'set' : 'not set'}`);

// Middleware
app.use(helmet({
	contentSecurityPolicy: false, // Disable CSP for simplicity in serverless context
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
	next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		service: 'whatsapp-webhook-server',
		environment: NODE_ENV
	});
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
	res.status(200).json({
		message: 'Test endpoint is working!',
		timestamp: new Date().toISOString()
	});
});

// Test transcription endpoint
app.post('/api/test-transcription', async (req, res) => {
	await errorHandler(async () => {
		const { audioUrl } = req.body;

		if (!audioUrl) {
			return res.status(400).json({ error: 'audioUrl is required' });
		}

		console.log(`Attempting to transcribe audio from URL: ${audioUrl}`);

		// Download the audio file
		const audioResponse = await fetch(audioUrl);
		const audioBuffer = await audioResponse.arrayBuffer();

		console.log('Audio downloaded successfully');

		// Transcribe the audio
		const transcription = await transcribeAudio(Buffer.from(audioBuffer));
		console.log('Transcription completed:', transcription);

		// Return the transcription
		res.status(200).json({
			success: true,
			transcription
		});
	}).catch(error => {
		console.error('Error in test-transcription endpoint:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	});
});

// Webhook verification endpoint
app.get('/api/webhook', (req, res) => {
	const mode = req.query['hub.mode'];
	const token = req.query['hub.verify_token'];
	const challenge = req.query['hub.challenge'];

	console.log('Webhook verification request received');
	console.log(`Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);
	console.log(`Expected token: ${WHATSAPP_VERIFY_TOKEN}`);

	// Check if a token and mode is in the query string of the request
	if (mode && token) {
		// Check the mode and token sent are correct
		if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
			// Respond with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} else {
			// Respond with '403 Forbidden' if verify tokens do not match
			console.log('WEBHOOK_VERIFICATION_FAILED: Token mismatch');
			res.sendStatus(403);
		}
	} else {
		// Respond with '400 Bad Request' if required parameters are missing
		console.log('WEBHOOK_VERIFICATION_FAILED: Missing parameters');
		res.sendStatus(400);
	}
});

// Function to download media from WhatsApp
async function downloadMedia(mediaId) {
	return errorHandler(async () => {
		const url = `https://graph.facebook.com/v18.0/${mediaId}`;
		const response = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch media info: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		const mediaUrl = data.url;
		
		const mediaResponse = await fetch(mediaUrl, {
			headers: {
				'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
			}
		});

		if (!mediaResponse.ok) {
			throw new Error(`Failed to download media: ${mediaResponse.status} ${mediaResponse.statusText}`);
		}

		return Buffer.from(await mediaResponse.arrayBuffer());
	});
}

// Function to transcribe audio using OpenAI API
async function transcribeAudio(audioBuffer) {
	return errorHandler(async () => {
		const formData = new FormData();
		formData.append('file', audioBuffer, {
			filename: 'audio.ogg',
			contentType: 'audio/ogg'
		});
		formData.append('model', 'whisper-1');
		formData.append('language', 'en'); // You can change this or make it dynamic

		const response = await fetch(
			'https://api.openai.com/v1/audio/transcriptions',
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${OPENAI_API_KEY}`
					// FormData will set its own content-type with boundary
				},
				body: formData
			}
		);

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data.text;
	});
}

// Function to send a message via WhatsApp API
async function sendWhatsAppMessage(phoneNumberId, to, message) {
	const maxRetries = 3;
	let retryCount = 0;
	let lastError = null;

	while (retryCount < maxRetries) {
		const result = await errorHandler(async () => {
			const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

			const data = {
				messaging_product: 'whatsapp',
				recipient_type: 'individual',
				to,
				type: 'text',
				text: {
					body: message
				}
			};

			console.log(`Attempt ${retryCount + 1}/${maxRetries} to send WhatsApp message to ${to}`);
			
			// Add a small delay between retries
			if (retryCount > 0) {
				await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
			
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data),
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
			}

			const responseData = await response.json();
			
			// Log the API response
			console.log('WhatsApp API response:', JSON.stringify(responseData));
			
			return responseData;
		}).catch(error => {
			lastError = error;
			retryCount++;
			
			// Log detailed error information
			console.error(`WhatsApp API error (attempt ${retryCount}/${maxRetries}):`, {
				message: error.message,
				name: error.name,
				code: error.code
			});
			
			// If we've reached max retries or it's not a retryable error, throw
			if (retryCount >= maxRetries || 
				(error.name !== 'AbortError' && error.name !== 'FetchError')) {
				throw error;
			}
			
			console.log(`Retrying WhatsApp message to ${to} in ${retryCount} second(s)...`);
			return null; // Signal that we should retry
		});
		
		// If we got a successful result, return it
		if (result) return result;
	}
}

// Error handler utility function
const errorHandler = async (fn, ...args) => {
	try {
		return await fn(...args);
	} catch (error) {
		console.error(`Error in ${fn.name || 'anonymous function'}:`, error);
		throw error;
	}
};

// Webhook endpoint to receive events
app.post('/api/webhook', async (req, res) => {
	const body = req.body;

	console.log('Webhook event received:', JSON.stringify(body));

	// Return a '200 OK' response immediately to acknowledge receipt
	res.status(200).send('EVENT_RECEIVED');

	await errorHandler(async () => {
		// Check if this is an event from a WhatsApp API
		if (body.object === 'whatsapp_business_account') {
			// Process different types of events
			if (body.entry &&
				body.entry[0].changes &&
				body.entry[0].changes[0] &&
				body.entry[0].changes[0].value) {

				const value = body.entry[0].changes[0].value;

				// Handle different types of messages
				if (value.messages && value.messages.length > 0) {
					const message = value.messages[0];
					const phoneNumberId = value.metadata.phone_number_id;
					const from = message.from;

					console.log('Message received:', JSON.stringify(message));

					// Process the message based on type
					if (message.type === 'audio') {
						console.log('Audio message received, processing for transcription');

						await errorHandler(async () => {
							// Download the audio file
							const audioBuffer = await downloadMedia(message.audio.id);
							console.log('Audio downloaded successfully');

							// Transcribe the audio
							const transcription = await transcribeAudio(audioBuffer);
							console.log('Transcription completed:', transcription);

							// Send the transcription back to the user
							const responseMessage = `📝 Transcription:\n\n${transcription}`;
							await sendWhatsAppMessage(phoneNumberId, from, responseMessage);
							console.log('Transcription sent to user');
						}).catch(async (error) => {
							console.error('Error processing audio message:', error);

							// Send error message to user
							await sendWhatsAppMessage(
								phoneNumberId,
								from,
								"Sorry, I couldn't transcribe your audio message. Please try again later."
							);
						});
					} else if (message.type === 'text') {
						console.log('Text message received:', message.text.body);

						// Respond to text messages
						await sendWhatsAppMessage(
							phoneNumberId,
							from,
							"Hello! I can transcribe audio messages. Send me a voice note and I'll convert it to text."
						);
					} else {
						console.log(`Received message of type: ${message.type}`);

						// Optional: Inform user about supported message types
						await sendWhatsAppMessage(
							phoneNumberId,
							from,
							"I can transcribe audio messages. Please send me a voice note."
						);
					}
				}

				// Handle status updates
				if (value.statuses && value.statuses.length > 0) {
					const status = value.statuses[0];
					console.log('Status update received:', JSON.stringify(status));
				}
			}
		}
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.message);
	console.error('Stack:', err.stack);

	const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

	res.status(statusCode).json({
		message: err.message,
		stack: NODE_ENV === 'production' ? '🥞' : err.stack,
	});
});

// Export the serverless function
module.exports.handler = serverless(app); 