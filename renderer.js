const { ipcRenderer } = require('electron');
const HOME = new URL('start.html', location.href).href;
const isHome = u => u === HOME;
const tabsEl = document.getElementById('tabs');
const views = document.getElementById('views');
const urlBox = document.getElementById('url');
const plus = document.createElement('button');
plus.id = 'plus'; plus.textContent = '+';
tabsEl.appendChild(plus);
let tabs = [], active = null;

function toURL(t) {
  t = t.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (!t.includes(' ') && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(t)) return 'https://' + t;
  return 'https://www.google.com/search?q=' + encodeURIComponent(t);
}
function select(t) {
  active = t;
  tabs.forEach(x => {
    x.wv.classList.toggle('active', x === t);
    x.tab.classList.toggle('active', x === t);
  });
  urlBox.value = isHome(t.url) ? '' : (t.url || '');
}
function closeTab(t) {
  const i = tabs.indexOf(t);
  tabs.splice(i, 1); t.wv.remove(); t.tab.remove();
  if (!tabs.length) return newTab();
  if (active === t) select(tabs[Math.max(0, i - 1)]);
}
function newTab(u = HOME) {
  const wv = document.createElement('webview');
  wv.src = u; views.appendChild(wv);
  const tab = document.createElement('div'); tab.className = 'tab';
  const title = document.createElement('span'); title.textContent = 'New Tab';
  const x = document.createElement('button'); x.textContent = '×';
  tab.append(title, x); tabsEl.insertBefore(tab, plus);
  const t = { wv, tab, url: u };
  tabs.push(t);
  tab.onclick = () => select(t);
  x.onclick = e => { e.stopPropagation(); closeTab(t); };
  wv.addEventListener('page-title-updated', e => title.textContent = e.title);
  wv.addEventListener('page-title-updated', e => document.title = e.title + ' - Nimbus');
  const nav = e => { t.url = e.url; if (t === active) urlBox.value = isHome(e.url) ? '' : e.url; };
  wv.addEventListener('did-navigate', nav);
  wv.addEventListener('did-navigate-in-page', nav);
  select(t);
}
plus.onclick = () => newTab();
urlBox.addEventListener('keydown', e => { if (e.key === 'Enter') active.wv.loadURL(toURL(urlBox.value)); });
document.getElementById('back').onclick = () => active.wv.canGoBack() && active.wv.goBack();
document.getElementById('fwd').onclick = () => active.wv.canGoForward() && active.wv.goForward();
document.getElementById('reload').onclick = () => active.wv.reload();
document.getElementById('home').onclick = () => active.wv.loadURL(HOME);
ipcRenderer.on('open-tab', (e, u) => newTab(u));
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 't') newTab();
  if (e.ctrlKey && e.key === 'w') closeTab(active);
  if (e.ctrlKey && e.key === 'l') urlBox.select();
});
newTab();
