const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const PHONE_NUMBER = process.env.AUTH_PHONE_NUMBER;
const AUTH_DIR = process.env.AUTH_DIR || './auth_info';

let sock = null;

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  
  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  sock.ev.on('creds.update', saveCreds);

  // Request pairing code if session not registered yet
  if (!sock.authState.creds.registered && PHONE_NUMBER) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log(`Pairing code generated: ${code}`);
      } catch (err) {
        console.error('Error requesting pairing code:', err);
      }
    }, 4000);
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('WhatsApp connection established successfully.');
    }
  });
}

app.post('/send', async (req, res) => {
  const { number, message } = req.body;
  if (!sock) return res.status(503).json({ error: 'WhatsApp socket not ready' });
  if (!number || !message) return res.status(400).json({ error: 'number and message are required' });

  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const jid = `${sanitizedNumber}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    res.json({ success: true, target: sanitizedNumber });
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Gateway API listening on port ${PORT}`);
  startSock();
});
