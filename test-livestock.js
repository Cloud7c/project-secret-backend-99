import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const html = fs.readFileSync('./public/agriculture/livestock.html', 'utf8');
const scriptCode = fs.readFileSync('./public/script.js', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);

const dom = new JSDOM(html, {
    url: 'http://localhost:3000/agriculture/livestock.html',
    runScripts: 'dangerously',
    virtualConsole
});

dom.window.fetch = async (url) => {
    console.log('Mock fetch called for:', url);
    return {
        ok: true,
        json: async () => ({
            count: 1,
            hasNextPage: false,
            page: 1,
            listings: [
                { id: 1, category: 'livestock', title: 'Test Cow', price: 100 }
            ]
        })
    };
};

try {
    const scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = scriptCode;
    dom.window.document.body.appendChild(scriptEl);
    
    setTimeout(() => {
        const grid = dom.window.document.querySelector('.livestock-grid');
        console.log('Grid HTML:', grid.innerHTML);
    }, 1000);
} catch (e) {
    console.error('Error running script:', e);
}
