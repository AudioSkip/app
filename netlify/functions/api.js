const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

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
	try {
		const { audioUrl } = req.body;

		if (!audioUrl) {
			return res.status(400).json({ error: 'audioUrl is required' });
		}

		console.log(`Attempting to transcribe audio from URL: ${audioUrl}`);

		// Download the audio file
		const audioResponse = await axios.get(audioUrl, {
			responseType: 'arraybuffer'
		});

		console.log('Audio downloaded successfully');

		// Transcribe the audio
		const transcription = await transcribeAudio(audioResponse.data);
		console.log('Transcription completed:', transcription);

		// Return the transcription
		res.status(200).json({
			success: true,
			transcription
		});
	} catch (error) {
		console.error('Error in test-transcription endpoint:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
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
	try {
		const url = `https://graph.facebook.com/v18.0/${mediaId}`;
		const response = await axios.get(url, {
			headers: {
				'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
			}
		});

		const mediaUrl = response.data.url;
		const mediaResponse = await axios.get(mediaUrl, {
			headers: {
				'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
			},
			responseType: 'arraybuffer'
		});

		return mediaResponse.data;
	} catch (error) {
		console.error('Error downloading media:', error);
		throw error;
	}
}

// Function to transcribe audio using OpenAI API
async function transcribeAudio(audioBuffer) {
	try {
		const formData = new FormData();
		formData.append('file', audioBuffer, {
			filename: 'audio.ogg',
			contentType: 'audio/ogg'
		});
		formData.append('model', 'whisper-1');
		formData.append('language', 'en'); // You can change this or make it dynamic

		const response = await axios.post(
			'https://api.openai.com/v1/audio/transcriptions',
			formData,
			{
				headers: {
					'Authorization': `Bearer ${OPENAI_API_KEY}`,
					...formData.getHeaders()
				}
			}
		);

		return response.data.text;
	} catch (error) {
		console.error('Error transcribing audio:', error);
		throw error;
	}
}

// Function to send a message via WhatsApp API
async function sendWhatsAppMessage(phoneNumberId, to, message) {
	try {
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

		const response = await axios.post(url, data, {
			headers: {
				'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		// Log the API response
		console.log('WhatsApp API response:', JSON.stringify(response.data));

		return response.data;
	} catch (error) {
		console.error('Error sending WhatsApp message:', error);
		throw error;
	}
}

// Webhook endpoint to receive events
app.post('/api/webhook', async (req, res) => {
	const body = req.body;

	console.log('Webhook event received:', JSON.stringify(body));

	// Return a '200 OK' response immediately to acknowledge receipt
	res.status(200).send('EVENT_RECEIVED');

	try {
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

						try {
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
						} catch (error) {
							console.error('Error processing audio message:', error);

							// Send error message to user
							await sendWhatsAppMessage(
								phoneNumberId,
								from,
								"Sorry, I couldn't transcribe your audio message. Please try again later."
							);
						}
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
	} catch (error) {
		console.error('Error processing webhook event:', error);
	}
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