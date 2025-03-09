"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
/**
 * Test the webhook verification endpoint
 */
function testWebhookVerification() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseUrl = `http://localhost:${config_1.default.port}/api/webhook`;
            const verifyToken = config_1.default.whatsapp.verifyToken;
            const challenge = 'test_challenge_string';
            console.log('Testing webhook verification...');
            console.log(`URL: ${baseUrl}`);
            console.log(`Verify Token: ${verifyToken}`);
            console.log(`Challenge: ${challenge}`);
            // Test with correct verify token
            const correctResponse = yield axios_1.default.get(baseUrl, {
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
            }
            else {
                console.log('❌ Webhook verification failed!');
            }
            // Test with incorrect verify token
            try {
                const incorrectResponse = yield axios_1.default.get(baseUrl, {
                    params: {
                        'hub.mode': 'subscribe',
                        'hub.verify_token': 'wrong_token',
                        'hub.challenge': challenge
                    }
                });
                console.log('\nIncorrect verify token test:');
                console.log(`Status: ${incorrectResponse.status}`);
                console.log('❌ Test failed! Should have received a 403 error.');
            }
            catch (error) {
                if (error.response && error.response.status === 403) {
                    console.log('\nIncorrect verify token test:');
                    console.log(`Status: ${error.response.status}`);
                    console.log('✅ Test passed! Received expected 403 error.');
                }
                else {
                    throw error;
                }
            }
            // Test with missing parameters
            try {
                const missingParamsResponse = yield axios_1.default.get(baseUrl);
                console.log('\nMissing parameters test:');
                console.log(`Status: ${missingParamsResponse.status}`);
                console.log('❌ Test failed! Should have received a 400 error.');
            }
            catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log('\nMissing parameters test:');
                    console.log(`Status: ${error.response.status}`);
                    console.log('✅ Test passed! Received expected 400 error.');
                }
                else {
                    throw error;
                }
            }
        }
        catch (error) {
            console.error('Error testing webhook verification:', error);
        }
    });
}
// Run the test
testWebhookVerification();
