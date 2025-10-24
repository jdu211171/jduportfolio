#!/usr/bin/env node

const axios = require('axios');

const webhookData = {
	type: 'ADD_RECORD',
	record: {
		recruiterEmail: { value: 'test.recruiter@example.com' },
		recruiterFirstName: { value: 'Test' },
		recruiterLastName: { value: 'Recruiter' },
		recruiterCompany: { value: 'Test Company' },
		recruiterPhone: { value: '+998901234567' },
		'$id': { value: `TEST_${Date.now()}` },
		isPartner: { value: 'false' }
	}
};

console.log('🚀 Sending test webhook to create new recruiter...\n');
console.log('Webhook data:', JSON.stringify(webhookData, null, 2));
console.log('\n📧 Expected email recipient: boysoatov-asilbek@digital-knowledge.co.jp');
console.log('📧 Expected sender: noreply@manabi.uz\n');

axios.post('http://localhost:4000/api/recruiters/webhook', webhookData)
	.then(response => {
		console.log('✅ Webhook successful!');
		console.log('Status:', response.status);
		console.log('Response:', JSON.stringify(response.data, null, 2));
		console.log('\n📋 Now check the server logs for email sending details:');
		console.log('   tail -f /home/user/Development/jduportfolio/server.log\n');
	})
	.catch(error => {
		console.error('❌ Webhook failed!');
		if (error.response) {
			console.error('Status:', error.response.status);
			console.error('Response:', JSON.stringify(error.response.data, null, 2));
		} else {
			console.error('Error:', error.message);
		}
	});
