const fs = require('fs');
const { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino');
const { makeWASocket } = require('./simple.js');

// Función para crear un sub-bot (conectar un sub-bot)
async function crearSubBot(m, args, parentConn) {
    const userId = m.sender.split('@')[0];
    const authFolder = `./serbot/${userId}`;
    let qrSent = false; // Bandera para controlar el envío del QR

    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });
    
    if (args[0]) fs.writeFileSync(`${authFolder}/creds.json`, Buffer.from(args[0], 'base64').toString('utf-8'));

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: "fatal" }),
        auth: state,
        browser: [`【 ✯ neko bot✰ 】`, "IOS", "1.0"],
        qrTimeout: 60, // Configurar tiempo de expiración del QR en segundos
    });

    conn.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr && !qrSent) { // Solo enviar el QR si no se ha enviado antes
            qrSent = true; // Marcar que ya se envió el QR
            const qrText = 'Escanea este QR para vincular tu sub bot.\nEste código expira en 60 segundos.';
            const qrImage = await qrcode.toDataURL(qr, { scale: 8 });
            await parentConn.sendFile(m.chat, qrImage, "qrcode.png", qrText, m);
        }

        if (connection === 'open') {
            global.conns.push(conn);
            parentConn.reply(m.chat, 'Sub bot conectado exitosamente.', m);
        }

        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            conn.ev.removeAllListeners();
            global.conns = global.conns.filter(c => c !== conn);
            fs.rmSync(authFolder, { recursive: true });
        }
    });

    conn.ev.on('creds.update', saveCreds);
}

// Exportar la función para que se pueda utilizar en otros archivos
module.exports = { crearSubBot };