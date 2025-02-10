const fs = require('fs');
const axios = require('axios');

// List sumber proxy
const sources = [
  "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/http.txt",
  "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/https.txt",
  "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/socks4.txt",
  "https://raw.githubusercontent.com/ErcinDedeoglu/proxies/refs/heads/main/proxies/socks5.txt",
  "https://raw.githubusercontent.com/proxifly/free-proxy-list/refs/heads/main/proxies/all/data.txt",
  "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/refs/heads/master/http.txt",
  "https://raw.githubusercontent.com/proxifly/free-proxy-list/refs/heads/main/proxies/all/data.txt",
  "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/refs/heads/master/http.txt",
  "https://raw.githubusercontent.com/vakhov/fresh-proxy-list/refs/heads/master/https.txt",
  "https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text",
  "https://raw.githubusercontent.com/monosans/proxy-list/refs/heads/main/proxies/all.txt",
  "https://raw.githubusercontent.com/hookzof/socks5_list/refs/heads/master/proxy.txt",
  "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/refs/heads/master/proxy.txt",
  "https://raw.githubusercontent.com/mmpx12/proxy-list/refs/heads/master/http.txt",
  "https://raw.githubusercontent.com/mmpx12/proxy-list/refs/heads/master/https.txt",
  "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/refs/heads/main/http.txt",
  "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/refs/heads/main/socks4.txt",
  "https://raw.githubusercontent.com/zevtyardt/proxy-list/refs/heads/main/all.txt",
  "https://raw.githubusercontent.com/ALIILAPRO/Proxy/main/http.txt",
  "https://raw.githubusercontent.com/sunny9577/proxy-scraper/refs/heads/master/proxies.txt",
  "https://raw.githubusercontent.com/proxy4parsing/proxy-list/refs/heads/main/http.txt",
  "https://raw.githubusercontent.com/SevenworksDev/proxy-list/refs/heads/main/proxies/http.txt",
  "https://raw.githubusercontent.com/SevenworksDev/proxy-list/refs/heads/main/proxies/https.txt",
];

// Fungsi untuk menunggu (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fungsi untuk scraping proxy dari setiap sumber
async function scrapeProxies() {
  let allProxies = [];

  for (const source of sources) {
    try {
      console.log(`Scraping dari: ${source}`);
      const response = await axios.get(source);
      const proxies = response.data.split('\n').filter(Boolean);
      allProxies = allProxies.concat(proxies);
      
      console.log(`Berhasil ambil ${proxies.length} proxy dari ${source}`);
    } catch (error) {
      console.error(`Gagal scrape dari ${source}: ${error.message}`);
    }

    // Delay 200-300ms sebelum lanjut ke sumber berikutnya
    const randomDelay = 300 + Math.floor(Math.random() * 100);
    await delay(randomDelay);
  }

  // Hapus duplikat proxy
  allProxies = [...new Set(allProxies)];
  console.log(`Total proxy unik: ${allProxies.length}`);

  // Simpan hasil ke file proxy.txt
  fs.writeFileSync('proxy.txt', allProxies.join('\n'), 'utf-8');
  console.log('Proxies berhasil disimpan di proxy.txt');
}

// Jalankan fungsi 
module.exports = scrapeProxies;