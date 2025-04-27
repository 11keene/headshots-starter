// generate-apple-secret.js
const fs  = require('fs');
const jwt = require('jsonwebtoken');

// 1) Load your private key file (make sure the filename matches exactly)
const privateKey = fs.readFileSync('./AuthKey_75GHMB79ZC.p8', 'utf8');

// 2) Replace these placeholders with your real Apple values:
const TEAM_ID   = 'YOUR_TEAM_ID';            // from Apple Developer → Account → Membership
const CLIENT_ID = 'com.aimavenstudio.web';   // your Services (Web) ID
const KEY_ID    = '75GHMB79ZC';              // the Key ID shown next to your .p8

// 3) Compute timestamps
const now        = Math.floor(Date.now() / 1000);
const sixMonths  = 15777000; // ~6 months in seconds

// 4) Build and sign the JWT
const token = jwt.sign(
  {
    iss: TEAM_ID,
    iat: now,
    exp: now + sixMonths,
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: { kid: KEY_ID },
  }
);

// 5) Output the result
console.log('\n——— Your Apple client_secret JWT ———\n');
console.log(token);
console.log('\n——— Copy & paste this into Supabase → Apple “Secret” field ———\n');
