const crypto = require('crypto');

const secret = 'IeltsThanhLeLearning_SecretKey_For_Jwt_Token_Validation_2026_Minimum256Bits!';
const header = {
    alg: 'HS256',
    typ: 'JWT'
};

const payload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "d0476e2c-7710-4688-9381-a18c97b76e13",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Teacher",
    "iss": "IeltsThanhLeVocabWeb",
    "aud": "IeltsThanhLeVocabWeb",
    "exp": Math.floor(Date.now() / 1000) + 3600
};

function base64url(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));

const signature = crypto.createHmac('sha256', secret)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const token = `${encodedHeader}.${encodedPayload}.${signature}`;
console.log(token);
