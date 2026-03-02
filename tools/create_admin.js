/*
Usage:
  1. Install dependencies: npm install firebase-admin
  2. Set the env var: GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
  3. Run: node tools/create_admin.js --email admin@example.com --password secret123 --displayName "Admin Name"

This script creates a Firebase Auth user and writes a document to Firestore under collection `admins/{uid}`.
*/

const admin = require('firebase-admin');
const { argv } = require('process');

function parseArgs() {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--email')) out.email = argv[++i];
    else if (arg.startsWith('--password')) out.password = argv[++i];
    else if (arg.startsWith('--displayName')) out.displayName = argv[++i];
  }
  return out;
}

async function main() {
  const { email, password, displayName } = parseArgs();
  if (!email || !password) {
    console.error('Missing --email or --password');
    process.exit(1);
  }

  // Initialize SDK using GOOGLE_APPLICATION_CREDENTIALS or default credentials
  try {
    admin.initializeApp();
  } catch (e) {
    // ignore if already initialized
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || undefined,
      emailVerified: false
    });

    console.log('Created user:', userRecord.uid);

    const db = admin.firestore();
    await db.collection('admins').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Wrote admins/'+userRecord.uid+' document.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
