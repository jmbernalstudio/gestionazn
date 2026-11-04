const I = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  team: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.7.2 4.4 1.9 5 4.9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  out: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 1-2-2z"/><path d="M14.5 6.5L17 4"/>',
  talk: '<path d="M4 6h16v10h-6l-4 4v-4H4z"/><path d="M8 10h8M8 13h5"/>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  inbox: '<path d="M3.5 13l2.5-8h12l2.5 8v6h-17z"/><path d="M3.5 13H9l1 2h4l1-2h5.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  eq: '<path d="M6 10h12M6 14h12"/>',
  minus: '<path d="M5 12h14"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l4.3 3.1-1.6 5h-5.4l-1.6-5z"/>',
  card: '<rect x="7" y="3.5" width="10" height="17" rx="2"/>',
  swap: '<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  whistle: '<circle cx="9" cy="14" r="5"/><path d="M12.5 10.5L20 6v4l-5 2"/>'
};
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

const STATES = ['Enviada', 'Vista', 'En marcha', 'Resuelta'];

/* Equipos, partidos y clasificaciones reales (js/datos.js, sacado de rfaf.es y educationleague.es) */
const D = window.DATOS || { equipos: [] };
/* Orden del club: de mayores a pequeños */
const ORDEN = ['senior', 'internacional', 'juvenil', 'cadete', 'infantil', 'alevin2', 'alevin1', 'benjamin2', 'benjamin1', 'prebenjamin', 'minis'];
D.equipos.sort((a, b) => (ORDEN.indexOf(a.id) + 1 || 99) - (ORDEN.indexOf(b.id) + 1 || 99));
const EQ = Object.fromEntries(D.equipos.map(e => [e.nombre, e]));
/* Equipos de la estructura del club que no son del C.D. Aznalcóllar Fútbol Base (el C.D. Internacional de Sevilla):
   solo salen en Partidos, con todo el club. No tienen entrenadores, plantilla ni entrenamientos */
const EXT = D.externos || [];
/* El equipo que juega cada partido: el nuestro o el externo, con su escudo */
const sideName = e => e.externo ? e.nombre : 'Aznalcóllar';
const sideCrest = e => e.externo ? crestOf(e, e.nombre_web) : crestSm();
const sideCrestBig = e => e.externo ? crestOf(e, e.nombre_web) : crestBig();
const US = /AZNALC[OÓ]LLAR/i; /* nunca solo "AZNALC": coincidiría con el C.A. Aznalcázar */
const ISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const TODAY = ISO(new Date());
const WD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const toDate = iso => new Date(iso + 'T12:00:00');
const dayLbl = iso => { const d = toDate(iso); return `${WD[d.getDay()]} ${d.getDate()}`; };
const dateLbl = iso => { const d = toDate(iso); return `${WD[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`; };
/* "C.D. ATLÉTICO SAN JUAN" -> "C.D. Atlético San Juan" */
const nice = n => n === n.toUpperCase()
  ? n.split(' ').map(w => /\.|^"|^[IVX]+$/.test(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()).join(' ').replace(/ (De|Del|La|Las|Los|Y) /g, m => m.toLowerCase())
  : n;
/* "Alevín 2º año" -> "A2", "Infantil" -> "In" */
const abbr = n => { const m = /(\d)º/.exec(n); return n.slice(0, m ? 1 : 2) + (m ? m[1] : ''); };
const crestOf = (e, name) => e.escudos[name] || null;
const usName = e => (e.tabla.find(r => US.test(r.equipo)) || {}).equipo || Object.keys(e.escudos).find(n => US.test(n));
/* Por fecha y no por jornada: un partido aplazado (p. ej. la J7 del Senior, el 30 nov) no tapa a los siguientes */
const byDate = (a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora || '99').localeCompare(b.hora || '99') || a.j - b.j;
const nextMatch = e => e.partidos.filter(p => !p.descansa && !p.nojuega && !p.goles && p.fecha >= TODAY).sort(byDate)[0] || null;
const played = e => e.partidos.filter(p => p.goles).sort(byDate);
const lastMatch = e => played(e).slice(-1)[0] || null;
const outcome = p => { const [a, b] = p.casa ? p.goles : [p.goles[1], p.goles[0]]; return a > b ? 'G' : a < b ? 'P' : 'E'; };
const scoreTxt = p => `${p.goles[0]}–${p.goles[1]}`;
const ourRow = e => e.tabla.find(r => US.test(r.equipo));
const placeOf = p => (p.campo || '').replace(/\s*\((F11|F7)[^)]*\)/gi, '').trim().split(' - ').map(x => nice(x.trim())).join(' · ');
const updated = () => { const d = new Date(D.actualizado); return isNaN(d) ? '' : `${d.getDate()} ${MES[d.getMonth()]}`; };
function crestBadge(e, name, cls = 'mini') {
  const src = US.test(name) ? crestSm() : crestOf(e, name);
  return src ? `<span class="${cls} img" aria-hidden="true"><img src="${src}" alt="" loading="lazy"></span>`
    : `<span class="${cls}" style="background:var(--navy)" aria-hidden="true">${initials(nice(name).replace(/^[A-Z.]+\s/, '').replace(/"/g, ''))}</span>`;
}
const S = {
  role: 'coach', tab: 'home', sub: null, conv: {}, stats: {}, actas: {},
  /* live = true cuando hay sesión iniciada en el servidor del club (js/servidor.js) */
  live: false, me: { id: null, nombre: 'Paco Martín' }, board: 'Ana Ruiz',
  coach: 'Paco', team: 'Alevín 2º año',
  /* Equipos de Paco (entrenador de ejemplo). Los partidos son reales; la plantilla aún es de ejemplo. */
  teams: {
    'Alevín 2º año': { cat: 'Alevín · F7', train: { dias: [1, 3], h: '18:00', where: 'Campo 2' },
      players: ['Lucas Romero', 'Hugo Sanz', 'Martín Gil', 'Pablo Ortega', 'Daniel Ruiz', 'Álvaro Vidal', 'Leo Navarro', 'Mateo Cano', 'Izan Molina', 'Adrián Prieto', 'Marcos León', 'Bruno Díez'] },
    'Infantil': { cat: 'Infantil · F11', train: { dias: [1, 4], h: '19:30', where: 'Campo 1' },
      players: ['Sara Blanco', 'Nerea Gómez', 'Lucía Pastor', 'Carla Ibáñez', 'Alba Rubio', 'Irene Moya', 'Paula Crespo', 'Vega Herrero', 'Noa Garrido', 'Elena Soler'] }
  },
  attend: {},
  people: [
    { id: 'd1', nombre: 'Ana Ruiz', usuario: 'ana@example.com', rol: 'junta', equipos: [] },
    { id: 'd2', nombre: 'Paco Martín', usuario: 'paco.alevin', rol: 'entrenador', equipos: ['alevin2', 'infantil'] }
  ],
  cal: [
    { wd: 'Lun', d: '26', h: '18:00', t: 'Entrenamiento', w: 'Campo 2' },
    { wd: 'Mié', d: '28', h: '18:00', t: 'Entrenamiento', w: 'Campo 2' },
    { wd: 'Sáb', d: '31', h: '10:30', t: 'Partido vs. CD Las Eras', w: 'Fuera · Polideportivo Norte' }
  ],
  requests: [
    { id: 1, kind: 'roto', title: 'Portería pequeña con la red rota', where: 'Campo 2', team: 'Alevín A', by: 'Paco', st: 2, when: 'Hace 2 días', urgent: true },
    { id: 2, kind: 'material', title: '10 balones del número 4', where: '', team: 'Alevín A', by: 'Paco', st: 1, when: 'Ayer', urgent: false },
    { id: 3, kind: 'roto', title: 'Luz del vestuario 3 no enciende', where: 'Vestuario 3', team: 'Cadete A', by: 'Raquel', st: 0, when: 'Hoy, 9:12', urgent: true },
    { id: 4, kind: 'otra', title: 'Cambiar el entrenamiento del jueves a las 19:00', where: '', team: 'Infantil B', by: 'Manolo', st: 0, when: 'Hoy, 11:40', urgent: false }
  ],
  notices: [
    { id: 1, from: 'Junta directiva', title: 'Fotos oficiales del club', body: 'El sábado 31 a las 9:00 hacemos las fotos de todos los equipos en el Campo 1. Venid con la primera equipación.', read: false, readBy: 18, total: 24 },
    { id: 2, from: 'Coordinación deportiva', title: 'Nuevo horario de campos', body: 'Desde noviembre, el Campo 2 queda libre los viernes para partidos amistosos.', read: true, readBy: 22, total: 24 }
  ],
  draft: null
};
/* Demo: cada jugador con su id; la asistencia guarda ids */
for (const t of Object.values(S.teams)) t.players = t.players.map((n, i) => ({ id: i + 1, n }));

/* Demo: se guarda en este móvil. Con sesión iniciada, los datos van al servidor (window.API). */
const STORE_KEY = 'cd-aznalcollar-v2';
const API = () => (S.live && window.API) || null;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!d) return;
    if (d.requests) S.requests = d.requests;
    if (d.notices) S.notices = d.notices;
    if (d.attend) for (const k in d.attend) S.attend[k] = new Set(d.attend[k]);
  } catch (_) {}
}
function save() {
  if (S.live) return;
  try {
    const attend = {};
    for (const k in S.attend) attend[k] = [...S.attend[k]];
    localStorage.setItem(STORE_KEY, JSON.stringify({ requests: S.requests, notices: S.notices, attend }));
  } catch (_) {}
}
const today = () => TODAY;

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('');
const short = n => { const [a, b] = n.split(' '); return b ? `${a} ${b[0]}.` : a; };

/* Ventanas propias (sirven en todos los móviles y en la vista previa). onClose recibe el valor de cierre. */
/* Con una ventana abierta, la página de detrás queda quieta (también en iPhone, donde overflow:hidden no basta):
   se fija el body en su sitio y al cerrar se vuelve a la misma altura */
const LOCK = { on: false, y: 0 };
function lockScroll() {
  const open = !!document.querySelector('body > .modal, body > .pz'), b = document.body.style;
  if (open === LOCK.on) return;
  LOCK.on = open;
  if (open) { LOCK.y = window.scrollY; Object.assign(b, { position: 'fixed', top: `${-LOCK.y}px`, left: '0', right: '0', width: '100%' }); }
  else { Object.assign(b, { position: '', top: '', left: '', right: '', width: '' }); window.scrollTo(0, LOCK.y); }
}
/* Nombres de jugador: si no caben, "Nombre A." (nombre y la inicial del primer apellido), como pidió la junta */
const shortName = n => { const w = String(n || '').trim().split(/\s+/); return w.length > 1 ? `${w[0]} ${w[1][0].toUpperCase()}.` : w[0] || ''; };
const pn = n => `<span class="pn" data-sn="${esc(shortName(n))}">${esc(n)}</span>`;
const fitNames = (() => { let raf = 0, mo = null;
  const run = () => { raf = 0; if (mo) mo.disconnect();
    document.querySelectorAll('.pn').forEach(el => { const box = el.parentElement; if (!box) return;
      const full = el.dataset.full || (el.dataset.full = el.textContent);
      if (el.textContent !== full) el.textContent = full;
      if (box.clientWidth && box.scrollWidth > box.clientWidth + 1) el.textContent = el.dataset.sn; });
    if (mo) { mo.takeRecords(); mo.observe(document.body, { childList: true, subtree: true }); } };
  const soon = () => { if (!raf) raf = requestAnimationFrame(run); };
  mo = new MutationObserver(soon); mo.observe(document.body, { childList: true, subtree: true });
  addEventListener('resize', soon);
  return soon; })();
function modal(html, role, onClose) {
  const back = document.activeElement, d = document.createElement('div');
  d.className = 'modal'; d.setAttribute('role', role); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'mdl-t');
  /* Todas las ventanas llevan arriba la misma X (redonda, gris): si no la traen, se le pone junto al título */
  if (!/class="iconbtn" data-v="0"/.test(html)) html = html.replace(/^\s*<h2 id="mdl-t">([\s\S]*?)<\/h2>/, (_, t) =>
    `<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${t}</h2></div><button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>`);
  d.innerHTML = `<div class="card stack">${html}</div>`;
  const focusables = () => [...d.querySelectorAll('button, input, select, textarea')];
  const key = e => {
    if (e.key === 'Escape') close(false);
    if (e.key === 'Tab') { const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  };
  const close = v => { d.remove(); lockScroll(); document.removeEventListener('keydown', key); back && back.focus && back.focus({ preventScroll: true }); onClose(v); };
  d.onclick = e => { if (e.target === d) close(false); const b = e.target.closest('[data-v]'); if (b) close(b.dataset.v === '1'); };
  document.addEventListener('keydown', key);
  document.body.append(d); lockScroll();
  return { el: d, close };
}
function ask(title, text, okLabel) {
  return new Promise(done => {
    const m = modal(`<h2 id="mdl-t">${esc(title)}</h2><p>${esc(text)}</p>
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Cancelar</button><button type="button" class="btn red" data-v="1">${ic('trash')} ${esc(okLabel)}</button></div>`, 'alertdialog', done);
    m.el.querySelector('[data-v="0"]').focus();
  });
}
function say(msg, undo) {
  $('#live').textContent = msg;
  const t = $('#toast');
  t.innerHTML = `${ic('check')}<span>${esc(msg)}</span>${undo ? '<button type="button" id="undo">Deshacer</button>' : ''}`;
  t.hidden = false;
  clearTimeout(say.tm);
  say.tm = setTimeout(() => (t.hidden = true), 4500);
  if (undo) $('#undo').onclick = () => { undo(); t.hidden = true; render(); };
}


/* Escudo del club: el del 75º aniversario (por defecto) o el de siempre, según elija cada usuario en Opciones.
   Se guarda en el propio móvil; si no se puede leer, sale el del aniversario */
const ESC75 = () => { try { return localStorage.getItem('escudo75') !== '0'; } catch (_) { return true; } };
const crestSm = () => ESC75() ? 'icons/escudo-160.png' : 'icons/escudo-clasico-160.png';
const crestBig = () => ESC75() ? 'icons/escudo.png' : 'icons/escudo-clasico.png';
/* Lo que no pinta la app (menú lateral e icono de la pestaña) se cambia aquí */
function applyCrest() {
  document.querySelectorAll('.rail .logo').forEach(i => { i.src = crestSm(); });
  const fav = document.querySelector('link[rel=icon]'); if (fav) fav.href = crestSm();
}
applyCrest();
const CLUB = 'C.D. Aznalcóllar';
const greet = () => { const h = new Date().getHours(); return h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; };
const myName = () => S.live ? S.me.nombre : S.role === 'coach' ? S.me.nombre : S.board;
const roleName = () => S.role === 'coach' ? 'Entrenador' : 'Junta directiva';
const myPerson = () => S.live ? S.me : { nombre: myName(), foto: null };
/* Foto de la persona, o sus iniciales si la junta aún no ha subido ninguna */
/* Número del jugador; si tiene foto, la foto con el dorsal en una esquina */
const pnum = (p, cls, alt) => p.foto ? `<span class="${cls} pimg" aria-hidden="true"><img src="${esc(p.foto)}" alt="" loading="lazy">${p.dorsal ? `<i>${p.dorsal}</i>` : ''}</span>`
  : `<span class="${cls}" aria-hidden="true">${p.dorsal || alt}</span>`;
const avatar = (p, cls) => p.foto ? `<span class="${cls} ph" aria-hidden="true"><img src="${esc(p.foto)}" alt=""></span>` : `<span class="${cls}" aria-hidden="true">${esc(initials(p.nombre))}</span>`;
/* La foto de arriba abre la pantalla de Opciones (antes era un menú desplegable) */
function bindMe() {
  $('#me').onclick = () => { if (S.tab === 'opts') return; S.optsFrom = [S.tab, S.sub]; go('opts'); };
}
function optsScreen() {
  const back = () => { const [t, sub] = S.optsFrom || ['home', null]; go(t, sub); };
  const on = ESC75();
  return { kicker: 'Tu cuenta', title: 'Opciones', back,
    body: `<div class="opts">
      <section class="card opts-me" aria-label="Tu perfil">${avatar(myPerson(), 'av big')}<div class="grow"><b>${esc(myName())}</b><small>${roleName()}</small></div>
        <button type="button" class="btn ghost" id="rename">${ic('pen')} Cambiar mi nombre</button></section>
      <section class="card stack" aria-labelledby="h-op-esc"><h2 id="h-op-esc" class="opts-h">Escudo del club</h2>
        <div class="opts-row"><div class="grow"><b id="op-esc-l">Usar escudo del 75º aniversario</b><small>Si lo quitas, en toda la app sale el escudo de siempre.</small></div>
          <button type="button" class="tgl" role="switch" id="op-esc" aria-checked="${on}" aria-labelledby="op-esc-l"><span></span></button></div>
        <div class="opts-cr" aria-hidden="true"><img src="${crestSm()}" alt=""></div></section>
      ${S.live && ['off', 'on', 'denied'].includes(S.push) ? `<section class="card stack" aria-labelledby="h-op-push"><h2 id="h-op-push" class="opts-h">Notificaciones</h2>
        ${S.push === 'on' ? `<p class="push-st">${ic('check')} Notificaciones activadas</p>`
          : S.push === 'denied' ? '<p class="muted" style="margin:0">Notificaciones bloqueadas. Actívalas en los ajustes del móvil.</p>'
          : `<button type="button" class="btn blue block" id="push-menu">${ic('bell')} Activar notificaciones</button>`}</section>` : ''}
      <section class="card stack opts-end">${S.live ? `<button type="button" class="btn red block" id="logout">${ic('out')} Cerrar sesión</button>`
        : `<small>Demostración · ver como</small>
          <button type="button" class="btn ${S.role === 'coach' ? 'blue' : 'out'} block" data-role="coach">Entrenador</button>
          <button type="button" class="btn ${S.role === 'board' ? 'blue' : 'out'} block" data-role="board">Junta</button>`}</section></div>`,
    bind() {
      $('#rename').onclick = renameMe;
      if ($('#push-menu')) $('#push-menu').onclick = activarPush;
      if ($('#logout')) $('#logout').onclick = () => window.logout && window.logout();
      document.querySelectorAll('.opts [data-role]').forEach(x => x.onclick = () => { S.role = x.dataset.role; go('home'); });
      $('#op-esc').onclick = () => { const v = !ESC75(); try { localStorage.setItem('escudo75', v ? '1' : '0'); } catch (_) {}
        applyCrest(); render(); say(v ? 'Ahora sale el escudo del 75º aniversario' : 'Ahora sale el escudo de siempre'); $('#op-esc').focus(); };
    } };
}
/* ---------- Notificaciones al móvil ---------- */
const pushNo = () => { try { return localStorage.getItem('push-no') === '1'; } catch (_) { return false; } };
function pushCard() {
  if (!S.live || !['off', 'ios'].includes(S.push) || pushNo()) return '';
  const quien = S.role === 'coach' ? 'cuando la junta te mande un aviso o conteste a tus peticiones' : 'cuando un entrenador haga una petición';
  return `<section class="card push-card" aria-labelledby="h-push"><span class="ic">${ic('bell')}</span>
    <div class="grow">${S.push === 'ios'
      ? '<h2 id="h-push">Recibe los avisos en el móvil</h2><p>Para que te lleguen las notificaciones, abre la app desde su icono en la pantalla de inicio.</p></div><div class="btns one"><button type="button" class="btn ghost" id="push-no">Entendido</button></div>'
      : `<h2 id="h-push">Activa las notificaciones</h2><p>Te avisaremos en el móvil ${quien}.</p></div><div class="btns"><button type="button" class="btn ghost" id="push-no">Ahora no</button><button type="button" class="btn blue" id="push-si">${ic('bell')} Activar</button></div>`}
  </section>`;
}
async function activarPush() {
  try { S.push = await window.Push.activar(); } catch (_) { say('No se han podido activar. Prueba otra vez en un momento.'); return; }
  render();
  say(S.push === 'on' ? 'Notificaciones activadas' : 'Las notificaciones están bloqueadas. Actívalas en los ajustes del móvil.');
}
function bindPush() {
  if ($('#push-si')) $('#push-si').onclick = activarPush;
  if ($('#push-no')) $('#push-no').onclick = () => { try { localStorage.setItem('push-no', '1'); } catch (_) {} render(); };
}

/* Ventana para cambiar el nombre que sale junto a la foto */
function renameMe() {
  const m = modal(`<h2 id="mdl-t">Cambiar mi nombre</h2>
    <form id="nf" class="stack" novalidate>
      <label class="f" for="nn">Tu nombre<span class="hint">Sale junto a tu foto</span><input type="text" id="nn" autocomplete="name" maxlength="60" value="${esc(myName())}"></label>
      <p id="nerr" class="err" role="alert" hidden>Escribe tu nombre.</p>
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Cancelar</button><button type="submit" class="btn blue">${ic('check')} Guardar</button></div>
    </form>`, 'dialog', () => {});
  $('#nn').focus(); $('#nn').select();
  $('#nf').onsubmit = async e => {
    e.preventDefault();
    const n = $('#nn').value.trim().replace(/\s+/g, ' ');
    if (!n) { $('#nerr').hidden = false; $('#nn').focus(); return; }
    try { API() && await API().nombre(n); } catch (_) { $('#nerr').textContent = 'No se ha podido guardar. Revisa la conexión.'; $('#nerr').hidden = false; return; }
    const old = myName();
    S.requests.forEach(r => { if (r.by === old) r.by = n; });
    const yo = S.people.find(p => p.id && p.id === S.me.id); if (yo) yo.nombre = n;
    if (S.live || S.role === 'coach') { S.me.nombre = n; S.coach = n; } else S.board = n;
    m.close(); render(); say('Nombre cambiado.');
  };
}
/* Reduce la foto a 192 px (JPEG) para guardarla junto al perfil */
function readPhoto(file) {
  return new Promise((ok, ko) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const n = 192, c = document.createElement('canvas'), sz = Math.min(img.width, img.height);
      c.width = c.height = n;
      c.getContext('2d').drawImage(img, (img.width - sz) / 2, (img.height - sz) / 2, sz, sz, 0, 0, n, n);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = ko; img.src = url;
  });
}
/* Foto de una petición: lado mayor a 1280 px (JPEG) para que suba rápido y se vea bien */
function readImage(file, max = 1280) {
  return new Promise((ok, ko) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = ko; img.src = url;
  });
}
function photoField(foto, nombre) {
  return `<label class="photo" for="fo">${avatar({ foto, nombre: nombre || '?' }, 'av')}<span id="fo-t">${foto ? 'Foto añadida · toca para cambiarla' : 'Añadir foto (opcional)'}</span></label>
    <input type="file" id="fo" accept="image/*" class="sr">`;
}
function bindPhoto(state) {
  $('#fo').onchange = async () => {
    const f = $('#fo').files[0]; if (!f) return;
    try { state.foto = await readPhoto(f); } catch (_) { say('No se ha podido leer esa foto. Prueba con otra.'); return; }
    const l = $('label[for=fo]'); l.querySelector('.av').outerHTML = avatar({ foto: state.foto }, 'av'); $('#fo-t').textContent = 'Foto añadida · toca para cambiarla';
  };
}
const firstName = () => myName().split(' ')[0];
const crestImg = (cls = '') => `<img class="cr ${cls}" src="${crestSm()}" alt="">`;


/* Días de entrenamiento: 1 = lunes … 7 = domingo (los elige la junta en cada equipo) */
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_D = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_L = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados', 'domingos'];
const dow = iso => (toDate(iso).getDay() + 6) % 7 + 1;
const addDays = (iso, n) => { const d = toDate(iso); d.setDate(d.getDate() + n); return ISO(d); };
const trainOf = team => S.teams[team] && S.teams[team].train && S.teams[team].train.dias.length ? S.teams[team].train : null;
/* La junta puede anular el entrenamiento de un equipo un día concreto (desde el Calendario) */
const anulado = (team, iso) => !!(S.anulados && S.anulados.has(`${team} ${iso}`));
const trainsOn = (team, iso) => { const t = trainOf(team); return !!t && t.dias.includes(dow(iso)) && !anulado(team, iso); };
/* Cada día de entrenamiento lleva su hora y su campo (p. ej. lunes Campo 1, miércoles Campo 2) */
const sesiones = t => t ? (t.ses && t.ses.length ? t.ses : t.dias.map(d => ({ d, h: t.h || '', where: t.where || '' }))) : [];
const trainAt = (team, iso) => { const t = trainOf(team); if (!t || !t.dias.includes(dow(iso)) || anulado(team, iso)) return null; return sesiones(t).find(x => x.d === dow(iso)) || { d: dow(iso), h: t.h || '', where: t.where || '' }; };
/* Duración fija de los entrenamientos (no se edita): hora y media, y los Minis una hora */
const trainMin = team => (EQ[team] || {}).id === 'minis' ? 60 : 90;
const hhmm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const trainEnd = (team, h) => { const [a, b] = (h || '').split(':').map(Number); return isNaN(a) ? '' : hhmm(a * 60 + (b || 0) + trainMin(team)); };
/* Duración aproximada de un partido: sus partes más 10 minutos de descanso */
const matchMin = team => { const du = durOf(team), m = du.partes * du.min; return m ? m + 10 : 90; };
const hm2min = h => { const [a, b] = (h || '').split(':').map(Number); return a * 60 + (b || 0); };
/* Reparte en carriles las citas de un día que se pisan (como Google Calendar): cada una lleva lane y n */
function calLanes(day) {
  const out = [], list = day.slice().sort((x, y) => x.a - y.a); let g = null, end = -1;
  for (const it of list) { if (!g || it.a >= end) { g = []; out.push(g); end = -1; } g.push(it); end = Math.max(end, it.z); }
  for (const grp of out) { const lanes = []; for (const it of grp) { let l = lanes.findIndex(z => z <= it.a); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = it.z; it.lane = l; } grp.forEach(it => { it.n = lanes.length; }); }
  return list;
}
const trainLbl = t => ['Entrenamiento', t.h, t.where].filter(Boolean).join(' · ');
/* Solo se pasa lista en días de entrenamiento: hoy si toca, o uno de las dos últimas semanas que se olvidó */
const LOOKBACK = 14;
const trainDates = team => [...Array(LOOKBACK)].map((_, i) => addDays(TODAY, i - LOOKBACK + 1)).filter(d => trainsOn(team, d));
/* Cuentan como pendientes desde la primera lista pasada en la app (antes no se usaba) */
const firstList = team => Object.keys(S.attend).filter(k => k.startsWith(team + ' ') && S.attend[k].size).map(k => k.slice(team.length + 1)).sort()[0] || TODAY;
const pendingLists = team => S.teams[team].players.length ? trainDates(team).filter(d => d >= firstList(team) && !(S.attend[`${team} ${d}`] || { size: 0 }).size) : [];
const pendingAll = () => Object.keys(S.teams).flatMap(team => pendingLists(team).map(iso => ({ team, iso })));
/* Agenda: entrenamientos y partidos reales de los próximos 7 días; tira de días de lunes a domingo */
const WEEK = [...Array(7)].map((_, i) => addDays(TODAY, i));
const MONWEEK = [...Array(7)].map((_, i) => addDays(TODAY, i - dow(TODAY) + 1));
function buildAgenda() {
  const ev = [];
  for (const team of Object.keys(S.teams)) WEEK.forEach((iso, i) => {
    const t = trainAt(team, iso), tt = trainOf(team);
    /* Un entrenamiento anulado por la junta sale como anulado: no hay que pasar lista */
    if (!t && tt && tt.dias.includes(dow(iso)) && anulado(team, iso)) {
      const x = sesiones(tt).find(y => y.d === dow(iso)) || {};
      return ev.push({ iso, day: i === 0 ? 'Hoy' : dayLbl(iso), h: x.h || '--:--', kind: 'train', team, where: '', anul: true });
    }
    if (!t) return;
    ev.push({ iso, day: i === 0 ? 'Hoy' : dayLbl(iso), h: t.h || '--:--', kind: 'train', team, where: t.where || '', today: i === 0 });
  });
  for (const e of D.equipos) for (const p of e.partidos)
    if (!p.descansa && !p.nojuega && p.fecha >= WEEK[0] && p.fecha <= WEEK[6]) ev.push({ iso: p.fecha, day: p.fecha === TODAY ? 'Hoy' : dayLbl(p.fecha), h: p.hora || '--:--', kind: 'match', team: e.nombre, p, e });
  return ev.sort((a, b) => (a.iso + a.h).localeCompare(b.iso + b.h));
}
/* Un partido que pasado el miércoles de su semana sigue sin hora (ni resultado) no se juega: casi siempre
   es contra un rival que se ha retirado y la federación lo deja en el calendario. No sale como próximo ni en agendas */
for (const e of D.equipos.concat(EXT)) for (const p of e.partidos)
  if (!p.descansa && p.fecha && !p.hora && !p.goles && !p.estado && TODAY > addDays(p.fecha, 3 - dow(p.fecha))) { p.nojuega = true; p.estado = 'No se juega'; }
let AGENDA = buildAgenda();

function tabsFor() {
  const unread = S.notices.filter(n => !n.read).length;
  const open = S.requests.filter(r => r.st < 3).length;
  return S.role === 'coach'
    ? [['home', 'Inicio', 'home'], ['team', 'Mi equipo', 'team', '', pendingAll().length], ['ask', 'Solicitar', 'plus', 'plus'], ['games', 'Partidos', 'cal'], ['msg', 'Mensajes', 'chat', '', unread]]
    : [['home', 'Bandeja', 'inbox', '', open], ['team', 'Equipos', 'team'], ['ask', 'Aviso', 'send', 'plus'], ['games', 'Partidos', 'cal'], ['msg', 'Enviados', 'chat']];
}

function go(tab, sub = null) { if (tab === 'ask' && S.tab !== 'ask') S.askView = 'new'; S.tab = tab; S.sub = sub; if (tab !== 'ask') S.draft = null; render(true); }

function render(focus) {
  save();
  const tabs = tabsFor();
  $('#rail-tabs').innerHTML = tabs.map(([k, l, i, cls, n]) =>
    `<li><button type="button" class="${cls || ''}" data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span>${n ? `<span class="badge" aria-label="${n} pendientes">${n}</span>` : ''}</button></li>`).join('');
  $('#bottom-tabs').innerHTML = tabs.map(([k, l, i, cls, n]) =>
    `<li><button type="button" class="${cls || ''}" data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${cls === 'plus' ? `<span class="ic">${ic(i)}</span>` : ic(i)}<span>${l}</span>${n ? `<span class="badge" aria-label="${n} pendientes">${n}</span>` : ''}</button></li>`).join('');
  const v = (S.role === 'coach' ? COACH : BOARD)[S.tab]();
  const unread = S.notices.filter(n => !n.read).length;
  const unseen = S.requests.filter(r => r.st === 0).length;
  $('#top').innerHTML = `
    ${v.back ? `<button type="button" class="back" data-back aria-label="Volver">${ic('back')}</button>` : crestImg('logo')}
    <div class="title"><small>${v.kicker}</small><h1 id="title">${v.title}</h1></div>
    <div class="me-wrap"><button type="button" class="me" id="me" aria-label="Opciones de tu cuenta: ${esc(myName())}">
      ${S.tab === 'home' ? `<span class="me-t"><small>${roleName()}</small></span>` : `<span class="me-t"><small>${roleName()}</small><b>${esc(myName())}</b></span>`}${avatar(myPerson(), 'av')}</button></div>
    ${S.role === 'coach' ? `<button type="button" class="iconbtn" data-go="msg" aria-label="Mensajes${unread ? `, ${unread} sin leer` : ''}">${ic('bell')}${unread ? '<span class="dot"></span>' : ''}</button>`
      : `<button type="button" class="iconbtn" data-go="home" aria-label="Peticiones${unseen ? `, ${unseen} sin ver` : ''}">${ic('bell')}${unseen ? '<span class="dot"></span>' : ''}</button>`}`;
  bindMe();
  $('#main').className = v.layout || '';
  $('#main').innerHTML = v.body;
  v.bind && v.bind();
  bindPush();
  bindMatches();
  bindGo();
  if (v.back) $('[data-back]').onclick = v.back;
  if (focus) { LOCK.y = 0; $('#title').setAttribute('tabindex', '-1'); $('#title').focus({ preventScroll: true }); window.scrollTo(0, 0); }
}

const kindIco = k => k === 'roto' ? 'wrench' : k === 'material' ? 'box' : 'talk';
const kindName = k => k === 'roto' ? 'Algo roto' : k === 'material' ? 'Material' : 'Otra petición';
const kindCls = k => k === 'roto' ? '' : k === 'material' ? 'b' : 'g';
function stPill(r) {
  if (r.urgent && r.st < 3) return '<span class="pill red">Urgente</span>';
  return `<span class="pill ${r.st === 3 ? '' : r.st === 0 ? 'grey' : 'blue'}">${STATES[r.st]}</span>`;
}
function stepsHTML(r, labels) {
  return `<div role="img" aria-label="Estado: ${STATES[r.st]}, paso ${r.st + 1} de 4"><div class="steps" aria-hidden="true">${STATES.map((_, i) => `<i class="${i <= r.st ? 'on' : ''}"></i>`).join('')}</div>
    ${labels ? `<div class="steps-lbl" aria-hidden="true">${STATES.map((s, i) => `<span class="${i <= r.st ? 'on' : ''}">${s}</span>`).join('')}</div>` : ''}</div>`;
}
function reqRow(r, ctl = '') {
  return `<div class="rq" data-rq="${r.id}"><span class="ic ${kindCls(r.kind)}">${ic(kindIco(r.kind))}</span>
    <div class="grow"><button type="button" class="rq-open" data-rq-open="${r.id}" title="${esc(r.title)}">${esc(r.title)}</button><div class="rq-meta">${stPill(r)}<small>${r.conFoto ? `<span class="rq-ph" aria-label="Con foto">${ic('camera')}</span>` : ''}${S.role === 'board' ? `${r.by} · ${r.team} · ` : ''}${r.when}${r.where ? ' · ' + esc(r.where) : ''}</small></div>${stepsHTML(r, !!ctl)}</div>
    ${ctl}</div>`;
}
/* Tocar una petición abre todo: texto entero, quién, dónde, foto y estado */
function openRequest(r) {
  const board = S.role === 'board';
  /* Si es nueva y la abre la junta, pasa sola a "Vista" (el entrenador lo ve en su móvil) */
  if (board && r.st === 0) { r.st = 1; render(); API() && API().estado(r.id, 1).catch(() => { r.st = 0; render(); }); }
  /* La junta puede borrar cualquiera; el entrenador solo retira la suya mientras la junta no la haya abierto */
  const canDel = board || r.st === 0;
  const m = modal(`<div class="rqd-h"><span class="ic ${kindCls(r.kind)}">${ic(kindIco(r.kind))}</span><div class="grow"><small>${kindName(r.kind)}</small><div class="rq-meta">${stPill(r)}</div></div>
      <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
    <h2 id="mdl-t" class="rqd-t">${esc(r.title)}</h2>
    <dl class="facts">${board ? `<div><dt>Lo pide</dt><dd>${esc(r.by || '—')}</dd></div>` : ''}<div><dt>Equipo</dt><dd>${esc(r.team || '—')}</dd></div>
      <div><dt>Cuándo</dt><dd>${esc(r.when)}</dd></div>${r.where ? `<div><dt>Dónde</dt><dd>${esc(r.where)}</dd></div>` : ''}</dl>
    <div id="rqd-ph">${r.foto ? `<a href="${r.foto}" target="_blank" rel="noopener"><img class="rqd-img" src="${r.foto}" alt="Foto adjunta"></a>` : r.conFoto ? '<p class="muted" style="margin:0">Cargando la foto…</p>' : '<p class="muted" style="margin:0">Sin foto adjunta.</p>'}</div>
    ${stepsHTML(r, true)}
    ${board ? `<label class="f" for="rqd-st">Estado<select id="rqd-st">${STATES.map((s, i) => `<option value="${i}" ${i === r.st ? 'selected' : ''}>${s}</option>`).join('')}</select></label>` : ''}
    <button type="button" class="btn blue block" data-v="0">${ic('check')} Hecho</button>
    ${canDel ? `<button type="button" class="btn red block" id="rqd-del">${ic('trash')} ${board ? 'Borrar petición' : 'Retirar petición'}</button>` : ''}`, 'dialog', () => {});
  m.el.classList.add('rqd');
  if (r.conFoto && !r.foto && API()) API().fotoPeticion(r.id).then(f => { r.foto = f; const box = m.el.querySelector('#rqd-ph'); if (box && f) box.innerHTML = `<a href="${f}" target="_blank" rel="noopener"><img class="rqd-img" src="${f}" alt="Foto adjunta"></a>`; })
    .catch(() => { const box = m.el.querySelector('#rqd-ph'); if (box) box.innerHTML = '<p class="muted" style="margin:0">No se ha podido cargar la foto.</p>'; });
  const del = m.el.querySelector('#rqd-del');
  if (del) del.onclick = async () => {
    m.close(false);
    if (!(await ask(board ? '¿Borrar esta petición?' : '¿Retirar esta petición?', board ? 'Desaparecerá también del móvil del entrenador. No se puede deshacer.' : 'La junta ya no la verá. No se puede deshacer.', board ? 'Sí, borrar' : 'Sí, retirar'))) return;
    try { API() && await API().borrarPeticion(r.id); } catch (e) {
      if (e && e.message === 'vista' && !board) { r.st = Math.max(r.st, 1); render(); say('La junta ya la ha visto y no se puede retirar. Si es un error, avisa a la junta.'); }
      else say('No se ha podido borrar. Revisa la conexión.');
      return;
    }
    S.requests = S.requests.filter(x => x !== r); render(); say(board ? 'Petición borrada.' : 'Petición retirada.');
  };
  const sel = m.el.querySelector('#rqd-st');
  if (sel) sel.onchange = () => {
    const prev = r.st; r.st = +sel.value; render();
    API() && API().estado(r.id, r.st).catch(() => { r.st = prev; render(); say('No se ha podido guardar. Revisa la conexión.'); });
    say(`“${r.title}” pasa a ${STATES[r.st]}.`);
  };
  m.el.querySelector('.iconbtn').focus();
}
function bindRequests() {
  document.querySelectorAll('[data-rq]').forEach(row => row.onclick = e => {
    if (e.target.closest('.ctl')) return;
    const r = S.requests.find(x => x.id == row.dataset.rq); if (r) openRequest(r);
  });
}
/* Pantalla sin contenido: tarjeta alta con el mensaje centrado en la parte visible */
function emptyPage(icon, title, text, cls = '', action = '') {
  return `<section class="card empty empty-page ${cls}">${ic(icon)}<b>${title}</b><small>${text}</small>${action}</section>`;
}
function card(id, title, body, cls = '', more = '') {
  return `<section class="card ${cls}" aria-labelledby="${id}"><div class="card-h"><h2 id="${id}">${title}</h2>${more}</div>${body}</section>`;
}
function scoreHTML(team) {
  const e = EQ[team];
  const m = e && nextMatch(e);
  if (!m) return `<p style="margin:8px 0 0">No hay más partidos publicados por ahora.</p>`;
  const us = `<div><div class="ring">${crestImg()}</div><b>Aznalcóllar</b><small>${team}</small></div>`;
  const src = crestOf(e, m.rival);
  const them = `<div><div class="ring ${src ? '' : 'rv'}" aria-hidden="true">${src ? `<img src="${src}" alt="">` : initials(nice(m.rival))}</div><b title="${esc(nice(m.rival))}">${esc(nice(m.rival))}</b><small>${m.casa ? 'Visitante' : 'Local'}</small></div>`;
  return `<div class="score">${m.casa ? us : them}<div><div class="vs-time">${m.hora || '--:--'}</div><small>${m.hora ? 'Jornada ' + m.j : 'Hora por confirmar'}</small></div>${m.casa ? them : us}</div>`;
}
function agendaRow(e, withAct) {
  let what;
  if (e.kind === 'match') {
    const p = e.p;
    what = `<span class="vsl"><span class="pill gold">vs</span>${crestBadge(e.e, p.rival)}<span class="nm">${esc(nice(p.rival))}</span></span><span class="where">${p.casa ? 'Local' : 'Visitante'}${placeOf(p) ? ' · ' + esc(placeOf(p)) : ''}</span>`;
  } else if (e.kind === 'club') what = `<span class="t">${e.title}</span><span class="where">${e.where}</span>`;
  else if (e.anul) what = `<span class="t">Entrenamiento anulado</span><span class="where"><span class="ev-tm">${e.team} · </span>Lo ha anulado la junta</span>`;
  else {
    // El equipo va en la etiqueta de la derecha; en el móvil (sin etiqueta) o con el botón de pasar lista, va junto al campo
    const btn = withAct && e.today;
    what = `<span class="t">Entrenamiento</span>${e.today ? '<span class="pill">Hoy</span>' : ''}<span class="where"><span class="ev-tm${btn ? ' on' : ''}">${e.team}${e.where ? ' · ' : ''}</span>${e.where}</span>`;
  }
  const act = withAct && e.today && e.kind === 'train' && !e.anul
    ? `<button type="button" class="btn gold sm ev-act" data-team-go="${e.team}">Pasar lista</button>`
    : `<span class="pill ${e.kind === 'match' ? 'gold' : e.kind === 'club' ? 'grey' : 'blue'} ev-act">${e.kind === 'club' ? 'Club' : e.team}</span>`;
  return `<div class="ev"><div class="when"><b>${e.h}</b><small>${e.day}</small></div><div class="what">${what}</div>${act}</div>`;
}
/* Partidos de todos los equipos, agrupados por fin de semana (semana de lunes a domingo) */
const weekOf = iso => addDays(iso, 1 - dow(iso));
function allGames() {
  return D.equipos.concat(EXT).flatMap(e => e.partidos.filter(p => p.fecha && !p.nojuega).map(p => ({ e, p, wk: weekOf(p.fecha) })));
}
function weekLbl(wk, first) {
  const sa = toDate(first && first < addDays(wk, 5) ? first : addDays(wk, 5)), su = toDate(addDays(wk, 6));
  if (first && first < addDays(wk, 5)) return sa.getMonth() === su.getMonth() ? `${sa.getDate()} – ${su.getDate()} ${MES[su.getMonth()]}` : `${sa.getDate()} ${MES[sa.getMonth()]} – ${su.getDate()} ${MES[su.getMonth()]}`;
  return sa.getMonth() === su.getMonth() ? `${sa.getDate()} y ${su.getDate()} ${MES[su.getMonth()]}` : `${sa.getDate()} ${MES[sa.getMonth()]} y ${su.getDate()} ${MES[su.getMonth()]}`;
}
/* Escudo del equipo que seguimos; sin escudo, sus iniciales */
const ownCrest = (e, cls) => e.externo ? (sideCrest(e) ? `<img class="${cls}" src="${sideCrest(e)}" alt="">` : `<span class="${cls} rv" aria-hidden="true">${initials(e.nombre)}</span>`) : crestImg(cls);
function gameCard(e, p, mine) {
  const us = `<span class="gs">${ownCrest(e, 'gcr')}<b>${esc(sideName(e))}</b></span>`;
  const src = crestOf(e, p.rival);
  const them = `<span class="gs">${src ? `<img class="gcr" src="${src}" alt="" loading="lazy">` : `<span class="gcr rv" aria-hidden="true">${initials(nice(p.rival).replace(/^[A-Z.]+\s/, '').replace(/"/g, ''))}</span>`}<b title="${esc(nice(p.rival))}">${esc(nice(p.rival))}</b></span>`;
  const res = p.goles ? outcome(p) : null;
  const mid = res ? `<span class="res ${res}" aria-label="${res === 'G' ? 'Ganado' : res === 'P' ? 'Perdido' : 'Empatado'} ${scoreTxt(p)}">${scoreTxt(p)}</span>`
    : p.estado ? `<span class="pill red">${esc(p.estado)}</span>` : p.hora ? `<span class="gtime">${p.hora}</span>` : '<span class="gtime tbd">Hora por<br>confirmar</span>';
  return `<article class="gm" data-match="${e.id}|${p.j}" role="button" tabindex="0" aria-label="Ver el partido contra ${esc(nice(p.rival))}"><div class="gm-h"><span class="pill ${mine ? 'gold' : 'blue'}">${esc(e.nombre)}${mine ? '<span class="sr"> (tu equipo)</span>' : ''}</span><small>${dateLbl(p.fecha)}${p.hora && res ? ' · ' + p.hora : ''} · J${p.j}</small></div>
    <div class="gm-s">${p.casa ? us : them}${mid}${p.casa ? them : us}</div>
    <small class="where">${p.casa ? 'Local' : 'Visitante'}${placeOf(p) ? ' · ' + esc(placeOf(p)) : ''}</small></article>`;
}
/* ---------- Ficha de un partido (ventana centrada al tocarlo) ---------- */
const WDL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const longDate = iso => { const d = toDate(iso); return `${WDL[d.getDay()]} ${d.getDate()} de ${MESL[d.getMonth()]}`; };
/* Nombre del color (como lo escribe la federación) -> muestra de color; "Negra y amarilla" da dos franjas */
const KIT = [['azul marino', '#1B2A4A'], ['azul celeste', '#7EC8F2'], ['celeste', '#7EC8F2'], ['granate', '#7A1E2C'], ['burdeos', '#6D1A2A'], ['blanc', '#FFFFFF'],
  ['negr', '#111111'], ['roj', '#D7262E'], ['azul', '#1F4FD8'], ['amarill', '#F6C800'], ['verde', '#1E9A4B'], ['morad', '#6B2FA0'], ['violeta', '#6B2FA0'],
  ['naranja', '#F28C1B'], ['gris', '#9AA0A6'], ['rosa', '#F06BA8'], ['plat', '#C0C4CA'], ['dorad', '#C9A227'], ['marr', '#7A4B2A']];
function kitColors(txt) {
  const t = (txt || '').toLowerCase(); let rest = t; const out = [];
  for (const [k, c] of KIT) if (rest.includes(k)) { out.push([t.indexOf(k), c]); rest = rest.split(k).join('#'.repeat(k.length)); }
  return out.sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, 3);
}
const swatch = txt => { const cs = kitColors(txt); return `<span class="sw" aria-hidden="true">${(cs.length ? cs : ['#E3E6EE']).map(c => `<i style="background:${c}"></i>`).join('')}</span>`; };
function openMatch(e, p) {
  const res = p.goles ? outcome(p) : null, src = crestOf(e, p.rival), rv = nice(p.rival);
  const us = `<div class="mx-t">${ownCrest(e, 'mx-cr')}<b>${esc(sideName(e))}</b></div>`;
  const them = `<div class="mx-t">${src ? `<img class="mx-cr" src="${src}" alt="">` : `<span class="mx-cr rv" aria-hidden="true">${initials(rv.replace(/^[A-Z.]+\s/, '').replace(/"/g, ''))}</span>`}<b title="${esc(rv)}">${esc(rv)}</b></div>`;
  const mid = res ? `<div class="mx-m"><span class="res ${res}">${scoreTxt(p)}</span><small>${res === 'G' ? 'Ganado' : res === 'P' ? 'Perdido' : 'Empatado'}</small></div>`
    : `<div class="mx-m"><b class="mx-h">${p.estado ? esc(p.estado) : p.hora || '--:--'}</b><small>${p.estado ? '' : p.hora ? 'Hora' : 'Hora por confirmar'}</small></div>`;
  const k = p.equipacion;
  const kit = k ? `<div class="kit">${[['Camiseta', k.camiseta], ['Pantalón', k.pantalon], ['Medias', k.medias]].filter(x => x[1]).map(([l, v]) =>
      `<div class="kit-r">${swatch(v)}<span class="kit-l">${l}</span><b>${esc(v)}</b></div>`).join('')}</div>`
    : `<p class="muted" style="margin:0">Todavía no tenemos los colores de este equipo.</p>`;
  const m = modal(`<div class="rqd-h"><span class="pill ${S.teams[e.nombre] && S.role === 'coach' ? 'gold' : 'blue'}">${esc(e.nombre)}</span><div class="grow"><small>Jornada ${p.j}</small></div>
      <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
    <h2 id="mdl-t" class="sr">${p.casa ? esc(sideName(e)) + ' contra ' + esc(rv) : esc(rv) + ' contra ' + esc(sideName(e))}</h2>
    <div class="mx-s">${p.casa ? us : them}${mid}${p.casa ? them : us}</div>
    <dl class="facts mx-f"><div class="wide"><dt>Fecha</dt><dd>${longDate(p.fecha)}${p.hora && res ? ` · ${p.hora}` : ''}</dd></div>
      <div><dt>${e.externo ? 'Juega' : 'Jugamos'}</dt><dd>${p.casa ? 'De local' : 'De visitante'}</dd></div><div><dt>Césped</dt><dd>${p.superficie ? esc(/artificial/i.test(p.superficie) ? 'Artificial' : /natural/i.test(p.superficie) ? 'Natural' : p.superficie) : 'Sin datos'}</dd></div>
      <div class="wide"><dt>Rival</dt><dd>${esc(rv)}</dd></div>
      <div class="wide"><dt>Campo</dt><dd>${placeOf(p) ? esc(placeOf(p)) : 'Por confirmar'}</dd></div>
      <div class="wide"><dt>Competición</dt><dd>${esc(e.cat)}</dd></div></dl>
    ${p.casa ? '' : `<section class="mx-k" aria-labelledby="mx-kt"><h3 id="mx-kt">Equipación del rival</h3>${kit}</section>`}
    ${needMaps(p) ? `<a class="btn blue block" target="_blank" rel="noopener" href="${esc(mapsUrl(p))}">${ic('pin')} Cómo llegar</a>` : ''}
    ${lvAvail(e, p) ? `<button type="button" class="btn blue block" id="mx-lv">${ic(actaOf(e.nombre, p.fecha) && actaOf(e.nombre, p.fecha).fase === 'fin' ? 'list' : (actaOf(e.nombre, p.fecha) || {}).fase && actaOf(e.nombre, p.fecha).fase !== 'previa' ? 'play' : 'pen')} ${(() => { const a = actaOf(e.nombre, p.fecha); return !a || a.fase === 'previa' ? 'Rellenar datos' : a.fase === 'fin' ? 'Ver acta del partido' : 'Seguir el directo'; })()}</button>` : ''}
    ${fichaAvail(e, p) ? `<button type="button" class="btn outline block" id="mx-fp">${ic('list')} Ficha del partido</button>` : ''}
    ${p.goles && !e.externo && S.teams[e.nombre] && statsOn() && !stFilled(e.nombre, p.fecha) ? `<button type="button" class="btn outline block" id="mx-st">${ic('clock')} Apuntar minutos y goles</button>` : ''}
    <button type="button" class="btn outline block" id="mx-wa">${ic('send')} Enviar por WhatsApp</button>`, 'dialog', () => {});
  m.el.classList.add('rqd', 'mx');
  const fp = m.el.querySelector('#mx-fp'); if (fp) fp.onclick = () => { m.close(false); openFicha(e.nombre, p.fecha); };
  const lv = m.el.querySelector('#mx-lv'); if (lv) lv.onclick = () => { m.close(false); openLv(e.nombre, p.fecha); };
  const st = m.el.querySelector('#mx-st'); if (st) st.onclick = () => { m.close(false); S.team = e.nombre; openSt(e.nombre, p.fecha); };
  m.el.querySelector('#mx-wa').onclick = () => { m.close(false); shareMatch(e, p); };
  m.el.querySelector('[data-v="0"]').focus();
}
/* Imagen del partido para mandar por WhatsApp: la tarjeta con escudos y hora, los datos y, de visitante, la equipación del rival */
async function matchPoster(e, p) {
  await Promise.all(['800 60px Outfit', '700 40px Outfit', '500 30px Outfit'].map(f => document.fonts.load(f).catch(() => {})));
  const W = 1080, BLUE = '#0034DF', GOLD = '#FDCB2B', INK = '#0B0B0B', MUTED = '#5B6475', BG = '#F3F5FA';
  const cv = document.createElement('canvas'), x = cv.getContext('2d');
  const font = (w, px) => `${w} ${px}px Outfit, system-ui, sans-serif`;
  const text = (t, tx, y, w, px, color, maxW = W - 192, align = 'center') => {
    x.font = font(w, px); while (px > 14 && x.measureText(t).width > maxW) x.font = font(w, --px);
    x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(t, tx, y);
  };
  /* Texto largo (el campo): en dos líneas como mucho */
  const lines = (t, w, px, maxW) => { x.font = font(w, px); const out = ['']; for (const wd of t.split(' ')) { const tr = (out[out.length - 1] + ' ' + wd).trim();
    if (x.measureText(tr).width > maxW && out[out.length - 1]) out.push(wd); else out[out.length - 1] = tr; } return out.length > 2 ? [out[0], out.slice(1).join(' ')] : out; };
  const rr = (rx, ry, rw, rh, rad, color) => { x.beginPath(); x.moveTo(rx + rad, ry); x.arcTo(rx + rw, ry, rx + rw, ry + rh, rad); x.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
    x.arcTo(rx, ry + rh, rx, ry, rad); x.arcTo(rx, ry, rx + rw, ry, rad); x.closePath(); x.fillStyle = color; x.fill(); };
  const fitImg = (img, cx, cy, box) => { const k = Math.min(box / img.width, box / img.height); x.drawImage(img, cx - img.width * k / 2, cy - img.height * k / 2, img.width * k, img.height * k); };
  const res = p.goles ? outcome(p) : null, rv = nice(p.rival), kit = !p.casa && p.equipacion;
  const campo = placeOf(p) ? placeOf(p).replace(/ · /g, ' - ') : 'Por confirmar';
  x.font = font(700, 36); const campoL = lines(campo, 700, 36, W - 192);
  const facts = [['Fecha', longDate(p.fecha)], ['Hora', p.hora || 'Por confirmar'], [e.externo ? 'Juega' : 'Jugamos', p.casa ? 'De local' : 'De visitante'], ['Campo', campoL], ['Competición', e.cat]];
  const factsH = 60 + facts.reduce((a, f) => a + (Array.isArray(f[1]) ? 64 + 44 * f[1].length : 108), 0);
  const kitRows = kit ? [['Camiseta', kit.camiseta], ['Pantalón', kit.pantalon], ['Medias', kit.medias]].filter(r => r[1]) : [];
  const kitH = kitRows.length ? 130 + kitRows.length * 96 : 0;
  const H = 48 + 430 + 24 + factsH + (kitH ? 24 + kitH : 0) + 48;
  cv.width = W; cv.height = H;
  x.fillStyle = BG; x.fillRect(0, 0, W, H);
  /* Tarjeta del partido */
  rr(48, 48, W - 96, 430, 40, '#FFFFFF');
  x.font = font(700, 30); const pw = Math.min(x.measureText(e.nombre).width + 44, 560);
  rr(96, 92, pw, 56, 28, GOLD); text(e.nombre, 96 + pw / 2, 121, 700, 30, INK, pw - 44);
  text(`Jornada ${p.j}`, W - 96, 121, 500, 30, MUTED, 380, 'right');
  const src = crestOf(e, p.rival), [ours, theirs] = await Promise.all([sideCrestBig(e) ? loadImg(sideCrestBig(e)) : null, src ? loadImg(src) : null]);
  const side = (img, name, mine, cx) => {
    if (img) fitImg(img, cx, 260, 150);
    else { x.beginPath(); x.arc(cx, 260, 70, 0, Math.PI * 2); x.fillStyle = BLUE; x.fill(); text(initials(name.replace(/^[A-Z.]+\s/, '').replace(/"/g, '')), cx, 262, 800, 48, '#FFFFFF'); }
    text(mine ? sideName(e) : name, cx, 385, 700, 34, INK, 360);
  };
  const us = [ours, sideName(e), true], them = [theirs, rv, false];
  side(...(p.casa ? us : them), 270); side(...(p.casa ? them : us), 810);
  if (res) text(scoreTxt(p), W / 2, 265, 800, 76, INK, 240);
  else if (p.hora) text(p.hora, W / 2, 265, 800, 76, INK, 240);
  else { text('Hora por', W / 2, 245, 600, 32, MUTED, 220); text('confirmar', W / 2, 283, 600, 32, MUTED, 220); }
  text(p.casa ? 'Local' : 'Visitante', W / 2, 440, 600, 30, BLUE);
  /* Datos */
  let y = 48 + 430 + 24;
  rr(48, y, W - 96, factsH, 40, '#FFFFFF');
  y += 30;
  for (const [l, v] of facts) {
    text(l, 96, y + 26, 500, 28, MUTED, 400, 'left');
    if (Array.isArray(v)) { v.forEach((ln, i) => text(ln, 96, y + 70 + i * 44, 700, 36, INK, W - 192, 'left')); y += 64 + 44 * v.length; }
    else { text(v, 96, y + 70, 700, 36, INK, W - 192, 'left'); y += 108; }
  }
  /* Equipación del rival (solo de visitante) */
  if (kitH) {
    y = 48 + 430 + 24 + factsH + 24;
    rr(48, y, W - 96, kitH, 40, '#FFFFFF');
    text('Equipación del rival', 96, y + 66, 800, 38, INK, W - 192, 'left');
    kitRows.forEach(([l, v], i) => {
      const ry = y + 110 + i * 96;
      rr(80, ry, W - 160, 80, 24, BG);
      const cs = kitColors(v), cols = cs.length ? cs : ['#E3E6EE'];
      x.save(); x.beginPath(); x.roundRect ? x.roundRect(104, ry + 12, 56, 56, 14) : x.rect(104, ry + 12, 56, 56); x.clip();
      cols.forEach((c, k) => { x.fillStyle = c; x.fillRect(104 + k * 56 / cols.length, ry + 12, 56 / cols.length + 1, 56); }); x.restore();
      x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; x.beginPath(); x.roundRect ? x.roundRect(104, ry + 12, 56, 56, 14) : x.rect(104, ry + 12, 56, 56); x.stroke();
      text(l, 190, ry + 40, 500, 30, MUTED, 200, 'left');
      text(v, 400, ry + 40, 700, 34, INK, W - 400 - 112, 'left');
    });
  }
  return new Promise(ok => cv.toBlob(b => ok(b), 'image/png'));
}
/* Texto con la ubicación del campo (solo de visitante: de local jugamos en casa) */
/* En la Liga Educa, el enlace de Google Maps que trae el PDF de la liga; si no, se busca el campo por su nombre */
const mapsUrl = p => /^https:\/\//.test(p.maps || '') ? p.maps : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeOf(p))}`;
/* Cómo llegar sólo hace falta de visitante y si el partido no se ha jugado todavía */
const needMaps = p => !!p.campo && !p.casa && !p.goles && !(p.fecha < TODAY);
const mapsMsg = p => needMaps(p) ? `*Cómo llegar y ubicación del partido:*\n\n📍 ${mapsUrl(p)}` : '';
/* Ventana para mandar una imagen por WhatsApp. Muchos móviles (iPhone y algunos Android) quitan el texto
   cuando se comparte una imagen, así que la ubicación va en un segundo paso con un enlace de WhatsApp,
   que abre el chat con el texto ya escrito en los dos sistemas. Al compartir la imagen, el texto también queda copiado */
async function shareImage({ title, wait, build, name, alt, msg, what }) {
  let url = null;
  const m = modal(`<h2 id="mdl-t">${title}</h2><p id="pst-w">${wait}</p><div id="pst"></div>`, 'dialog', () => { if (url) URL.revokeObjectURL(url); });
  const blob = await build();
  if (!document.body.contains(m.el)) return;
  const file = new File([blob], name, { type: 'image/png' });
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  url = URL.createObjectURL(blob);
  $('#pst-w').textContent = msg ? `Manda primero ${what} y después la ubicación, al mismo grupo.` : canShare ? 'Pulsa "Compartir" y elige WhatsApp y el grupo del equipo.' : `Descarga ${what} y mándalo por WhatsApp.`;
  $('#pst').outerHTML = `<img class="pst-img" src="${url}" alt="${esc(alt)}">
    ${canShare ? `<button type="button" class="btn blue block" id="pst-sh">${ic('send')} ${msg ? '1. Enviar ' + what : 'Compartir'}</button>`
      : `<button type="button" class="btn blue block" id="pst-dl">${ic('check')} ${msg ? '1. ' : ''}Descargar ${what}</button>`}
    ${msg ? `<a class="btn outline block" id="pst-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">${ic('pin')} 2. Enviar ubicación</a>` : ''}
    <button type="button" class="btn ghost block" data-v="0">Cerrar</button>`;
  const sh = $('#pst-sh'), dl = $('#pst-dl');
  const copy = () => { try { navigator.clipboard && navigator.clipboard.writeText(msg).catch(() => {}); } catch (_) {} };
  if (sh) { sh.focus(); sh.onclick = () => { if (msg) copy(); navigator.share(msg ? { files: [file], text: msg } : { files: [file] }).catch(() => {}); }; }
  if (dl) { dl.focus(); dl.onclick = () => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); }; }
}
const fileName = (pre, team, f) => `${pre}-${team}-${f}.png`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9.-]+/g, '-');
function shareMatch(e, p) {
  return shareImage({ title: 'Enviar el partido', wait: 'Preparando la imagen…', build: () => matchPoster(e, p), name: fileName('partido', e.nombre, p.fecha),
    alt: `Partido del ${e.nombre} contra ${nice(p.rival)}, ${longDate(p.fecha)}`, msg: mapsMsg(p), what: 'la imagen' });
}
function bindMatches() {
  document.querySelectorAll('#main [data-match]').forEach(el => {
    const go = () => { const [id, j] = el.dataset.match.split('|'), e = D.equipos.concat(EXT).find(x => x.id === id), p = e && e.partidos.find(x => String(x.j) === j); if (p) openMatch(e, p); };
    el.onclick = go;
    el.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } };
  });
}
function gamesView() {
  /* Entrenadores: sus equipos o todo el club; la junta ve siempre todo */
  const coach = S.role === 'coach', mineOnly = coach && S.gscope !== 'all';
  const own = e => coach && !!S.teams[e.nombre];
  const all = allGames().filter(g => !mineOnly || own(g.e));
  const weeks = [...new Set(all.filter(g => !g.p.descansa).map(g => g.wk))].sort();
  const now = weekOf(TODAY);
  const wk = S.wk || weeks.find(w => w >= now) || weeks[weeks.length - 1] || now;
  const i = weeks.indexOf(wk), prev = weeks.filter(w => w < wk).pop(), next = weeks.find(w => w > wk);
  const venue = S.gvenue || 'all', VENUES = [['all', 'Todos'], ['home', 'Local'], ['away', 'Visitante']];
  const week = all.filter(g => g.wk === wk && !g.p.descansa);
  const list = week.filter(g => venue === 'all' || (venue === 'home') === !!g.p.casa)
    .sort((a, b) => a.p.fecha.localeCompare(b.p.fecha) || (a.p.hora || '99').localeCompare(b.p.hora || '99') || ORDEN.indexOf(a.e.id) - ORDEN.indexOf(b.e.id));
  const done = list.filter(g => g.p.goles), cnt = k => done.filter(g => outcome(g.p) === k).length;
  const nav = `<div class="wk-nav card">
      <button type="button" class="iconbtn" data-wk="${prev || ''}" ${prev ? '' : 'disabled'} aria-label="Fin de semana anterior">${ic('back')}</button>
      <div class="wk-t"><small>${wk === now ? 'Este fin de semana' : wk < now ? 'Ya jugado' : 'Próximamente'}</small><b>${weekLbl(wk, week.length ? week.map(g => g.p.fecha).sort()[0] : null)}</b></div>
      <button type="button" class="iconbtn" data-wk="${next || ''}" ${next ? '' : 'disabled'} aria-label="Fin de semana siguiente">${ic('chev')}</button>
      <div class="wk-v" role="group" aria-label="Local o visitante">${VENUES.map(([k, l]) =>
        `<button type="button" data-gv="${k}" aria-pressed="${venue === k}">${l}</button>`).join('')}</div>
      ${wk !== now && weeks.includes(now) ? `<button type="button" class="more wk-now" data-wk="${now}">Volver a este fin de semana</button>` : ''}</div>`;
  const stats = `<div class="kpis wk-k ${done.length ? '' : 'k3'}">
      <div class="kpi dark blue"><small>Partidos</small><b>${list.length}</b></div>
      ${done.length ? `<div class="kpi"><small>Ganados</small><b class="ok">${cnt('G')}</b></div><div class="kpi"><small>Empatados</small><b>${cnt('E')}</b></div><div class="kpi"><small>Perdidos</small><b class="bad">${cnt('P')}</b></div>`
        : `<div class="kpi"><small>De local</small><b>${week.filter(g => g.p.casa).length}</b></div><div class="kpi"><small>De visitante</small><b>${week.filter(g => !g.p.casa).length}</b></div>`}</div>`;
  const body = list.length ? `<div class="games">${list.map(g => gameCard(g.e, g.p, own(g.e))).join('')}</div>`
    : emptyPage('cal', `No hay partidos${venue === 'home' ? ' de local' : venue === 'away' ? ' de visitante' : ''}`, 'Usa las flechas para ver otro fin de semana.', 'g');
  const n = Object.keys(S.teams).length;
  const scope = coach ? `<div class="seg g-scope" role="group" aria-label="Qué partidos ver">
      <button type="button" data-gs="mine" aria-pressed="${mineOnly}">${n === 1 ? 'Mi equipo' : 'Mis equipos'}</button>
      <button type="button" data-gs="all" aria-pressed="${!mineOnly}">Todo el club</button></div>` : '';
  const venueSeg = `<div class="seg g-scope g-venue" role="group" aria-label="Local o visitante">${VENUES.map(([k, l]) =>
      `<button type="button" data-gv="${k}" aria-pressed="${venue === k}">${l}</button>`).join('')}</div>`;
  return `<div class="stack"><div class="g-filters ${coach ? '' : 'only-v'}">${scope}${venueSeg}</div>${nav}${stats}${body}</div>`;
}
/* Un partido de la temporada: fecha, rival con escudo, resultado o hora */
function matchRow(e, p) {
  if (p.descansa) return `<div class="mt rest"><div class="cal-d"><span>J${p.j}</span><b>${p.fecha ? toDate(p.fecha).getDate() : '–'}</b></div><div class="grow"><b>Descansa</b><small>${p.fecha ? dateLbl(p.fecha) : ''}</small></div></div>`;
  const res = p.goles ? outcome(p) : null;
  const right = res ? `<span class="res ${res}" aria-label="${res === 'G' ? 'Ganado' : res === 'P' ? 'Perdido' : 'Empatado'} ${scoreTxt(p)}">${scoreTxt(p)}</span>`
    : p.estado ? `<span class="pill red">${p.estado}</span>` : `<span class="pill ${p.hora ? 'blue' : 'grey'}" ${p.hora ? '' : 'title="Hora por confirmar"'}>${p.hora || 'Sin hora'}</span>`;
  return `<div class="mt ${p.fecha === (nextMatch(e) || {}).fecha ? 'next' : ''}" data-match="${e.id}|${p.j}" role="button" tabindex="0" aria-label="Ver el partido contra ${esc(nice(p.rival))}"><div class="cal-d"><span>J${p.j}</span><b>${toDate(p.fecha).getDate()}</b></div>${crestBadge(e, p.rival)}
    <div class="grow"><b title="${esc(nice(p.rival))}">${esc(nice(p.rival))}</b><small>${dateLbl(p.fecha)} · ${p.casa ? 'Local' : 'Visitante'}${placeOf(p) ? ' · ' + esc(placeOf(p)) : ''}</small></div>${right}</div>`;
}
/* Todos los partidos del grupo, jornada a jornada */
function groupView(e) {
  const js = e.grupo || [];
  if (!js.length) return emptyPage('cal', 'Todavía no hay partidos del grupo', 'Se cargan con la próxima actualización de resultados.', 'g');
  const now = weekOf(TODAY);
  const cur = js.find(x => x.fecha && weekOf(x.fecha) === now) || [...js].reverse().find(x => x.fecha && x.fecha <= TODAY) || js[0];
  const jr = js.find(x => x.j === S.gj) || cur;
  const i = js.indexOf(jr), prev = js[i - 1], next = js[i + 1];
  const days = jr.partidos.map(p => p.f).filter(Boolean).sort();
  const wk = weekOf(days[0] || jr.fecha || TODAY);
  const name = n => US.test(n) ? 'Aznalcóllar' : nice(n);
  /* Cada partido en dos líneas (local arriba, visitante abajo) para que los nombres quepan en el móvil */
  const side = (n, g, win) => `<span class="gr-t ${win ? 'w' : ''}">${crestBadge(e, n)}<b title="${esc(name(n))}">${esc(name(n))}</b>${g != null ? `<span class="gr-g">${g}</span>` : ''}</span>`;
  const row = p => {
    const g = p.g || [];
    const when = p.g ? `<b>Final</b>` : `<b class="${p.h ? 'h' : 'tbd'}">${p.h || 'Sin hora'}</b>`;
    return `<div class="gr ${US.test(p.l) || US.test(p.v) ? 'us' : ''}"><span class="gr-m">${when}<small>${p.f ? dateLbl(p.f) : ''}</small></span>
      <span class="gr-ts">${side(p.l, g[0], p.g && g[0] > g[1])}${side(p.v, g[1], p.g && g[1] > g[0])}</span></div>`;
  };
  const list = [...jr.partidos].sort((a, b) => (a.f || '9').localeCompare(b.f || '9') || (a.h || '99').localeCompare(b.h || '99'));
  const nav = `<div class="wk-nav card">
      <button type="button" class="iconbtn" data-gj="${prev ? prev.j : ''}" ${prev ? '' : 'disabled'} aria-label="Jornada anterior">${ic('back')}</button>
      <div class="wk-t"><small>Jornada ${jr.j}</small><b>${weekLbl(wk, days[0])}</b></div>
      <button type="button" class="iconbtn" data-gj="${next ? next.j : ''}" ${next ? '' : 'disabled'} aria-label="Jornada siguiente">${ic('chev')}</button>
      ${jr !== cur ? `<button type="button" class="more wk-now" data-gj="${cur.j}">Volver a la jornada actual</button>` : ''}</div>`;
  const rest = (jr.descansa || []).length ? `<p class="gr-rest">Descansa: ${jr.descansa.map(n => esc(name(n))).join(', ')}</p>` : '';
  return `<div class="stack">${nav}${card('h-gr', `Jornada ${jr.j} · ${list.length} partidos`, `<div class="gr-list">${list.map(row).join('')}</div>` + rest, '', `<span class="tag src">${e.fuente}</span>`)}</div>`;
}
function tableHTML(e) {
  const gd = r => r.gf != null ? r.gf - r.gc : r.dif;
  return `<div class="tbl" role="table" aria-label="Clasificación"><div class="tr th" role="row"><span role="columnheader">#</span><span role="columnheader">Equipo</span><span role="columnheader" title="Jugados">PJ</span><span role="columnheader" title="Diferencia de goles">DG</span><span role="columnheader">Pts</span></div>
    ${e.tabla.map(r => `<div class="tr ${US.test(r.equipo) ? 'us' : ''}" role="row"><span role="cell">${r.pos}</span><span role="cell" class="tn">${crestBadge(e, r.equipo)}<b title="${esc(nice(r.equipo))}">${esc(US.test(r.equipo) ? 'C.D. Aznalcóllar Fútbol Base' : nice(r.equipo))}</b></span><span role="cell">${r.j}</span><span role="cell">${gd(r) > 0 ? '+' : ''}${gd(r)}</span><span role="cell"><b>${r.pts}</b></span></div>`).join('')}</div>`;
}
function agendaCard(filter) {
  const f = filter || 'all';
  const list = AGENDA.filter(e => (e.kind !== 'match' || S.teams[e.team]) && (f === 'all' || e.kind === f));
  return card('h-ag', 'Próximos 7 días', `
    <div class="tabs" role="group" aria-label="Filtrar agenda">${[['all', 'Todo'], ['train', 'Entrenamientos'], ['match', 'Partidos']].map(([k, l]) =>
      `<button type="button" data-ag="${k}" aria-pressed="${f === k}">${l}</button>`).join('')}</div>
    <div id="ag-list">${list.map(e => agendaRow(e, true)).join('')}</div>`, 'a-agenda');
}
function bindAgenda() {
  document.querySelectorAll('[data-ag]').forEach(b => b.onclick = () => { S.ag = b.dataset.ag; const el = b.closest('section'); el.outerHTML = agendaCard(S.ag); bindAgenda(); bindGo(); });
  document.querySelectorAll('[data-team-go]').forEach(b => b.onclick = () => { S.team = b.dataset.teamGo; go('team', 'list'); });
}
/* Últimos 8 días con lista pasada. En la demo, cifras de ejemplo. */
function attendanceHist(team) {
  const n = S.teams[team].players.length;
  if (!S.live) return { days: [5, 7, 12, 14, 19, 21, 23, 26], pct: team === 'Alevín 2º año' ? [75, 83, 92, 67, 92, 100, 83, 92] : [80, 90, 100, 70, 90, 100, 90, 100] };
  const days = Object.keys(S.attend).filter(k => k.startsWith(team + ' ') && S.attend[k].size).map(k => k.slice(team.length + 1)).sort().slice(-8);
  return { days: days.map(d => toDate(d).getDate()), pct: days.map(d => n ? Math.round(S.attend[`${team} ${d}`].size / n * 100) : 0) };
}
/* Asistencia de un jugador: entrenamientos con lista pasada a los que ha venido (global y por semana) */
const listDays = team => Object.keys(S.attend).filter(k => k.startsWith(team + ' ') && S.attend[k].size).map(k => k.slice(team.length + 1)).sort();
const attLvl = p => p >= 90 ? 'hi' : p < 70 ? 'lo' : 'mid';
function playerAtt(team, id, days = listDays(team)) {
  const v = days.filter(d => S.attend[`${team} ${d}`].has(id)).length;
  return { n: days.length, v, pct: days.length ? Math.round(v / days.length * 100) : null };
}
const attPill = (team, id, short) => { const a = playerAtt(team, id); return a.pct == null ? '' : `<span class="ppct ${attLvl(a.pct)}" ${short ? `aria-label="${a.pct}% de asistencia"` : ''}>${a.pct}%${short ? '' : ' asistencia'}</span>`; };
function playerAttHTML(team, p) {
  const days = listDays(team), g = playerAtt(team, p.id, days);
  if (g.pct == null) return `<div class="patt"><b>Asistencia</b><p class="muted" style="margin:0">Todavía no se ha pasado lista en ${esc(team)}.</p></div>`;
  const weeks = [...new Set(days.map(weekOf))].slice(-8).map(w => ({ w, ...playerAtt(team, p.id, days.filter(d => weekOf(d) === w)) }));
  const wl = w => { const d = toDate(w); return `${d.getDate()} ${MES[d.getMonth()]}`; };
  return `<div class="patt"><b>Asistencia a los entrenamientos</b>
    <div class="patt-g"><span class="bignum ${attLvl(g.pct)}">${g.pct}%</span><small>Global: ha venido a ${g.v} de ${g.n} entrenamiento${g.n === 1 ? '' : 's'} desde el ${dateLbl(days[0]).toLowerCase()}</small></div>
    <small class="muted">Por semana (de lunes a domingo)</small>
    <div class="bars" role="img" aria-label="Asistencia por semana: ${weeks.map(x => `semana del ${wl(x.w)}, ${x.pct}%`).join('; ')}">${weeks.map(x => `<span class="${attLvl(x.pct)}" style="height:${Math.max(x.pct, 4) * .82}%"><b>${x.pct}%</b></span>`).join('')}</div>
    <div class="bars-x" aria-hidden="true">${weeks.map(x => `<span>${wl(x.w)}</span>`).join('')}</div>
    <div class="pweeks">${weeks.slice().reverse().map(x => `<div><span>Semana del ${wl(x.w)}</span><b>${x.v} de ${x.n}</b></div>`).join('')}</div></div>`;
}
/* Resumen del equipo en la temporada: lo que piden los entrenadores para tener un control rápido */
/* Duración de un partido por categoría (minutos), para los minutos jugados */
const DURACION = { senior: 90, juvenil: 90, cadete: 60, infantil: 80, alevin2: 70, alevin1: 60, benjamin2: 60, benjamin1: 60, prebenjamin: 50, minis: 50 };
/* La junta puede cambiarla en Equipos > el equipo; si no, la de arriba (siempre en 2 partes) */
const durOf = team => { const t = S.teams[team], e = EQ[team]; return t && t.dur ? t.dur : { partes: 2, min: ((e && DURACION[e.id]) || 0) / 2 }; };
/* Fútbol 7 o fútbol 11: marca cuántos titulares hay y cuántos se pueden convocar (titulares + 7 suplentes).
   La junta lo cambia en Equipos > el equipo; si no, el de abajo */
const MODALIDAD = { senior: 11, juvenil: 11, infantil: 11, cadete: 7, alevin2: 7, alevin1: 7, benjamin2: 7, benjamin1: 7, prebenjamin: 7, minis: 7 };
const modOf = team => (S.teams[team] && S.teams[team].mod) || (EQ[team] && MODALIDAD[EQ[team].id]) || 11;
const maxConv = team => modOf(team) + 7;
/* Formaciones posibles según los jugadores en el campo (sin contar al portero) */
const FORMACIONES = { 11: ['4-4-2', '4-3-3', '4-2-3-1', '4-1-4-1', '4-5-1', '4-4-1-1', '3-5-2', '3-4-3', '5-3-2', '5-4-1'],
  8: ['3-3-1', '3-2-2', '2-3-2', '3-1-3', '2-4-1'], 7: ['2-3-1', '3-2-1', '3-1-2', '2-1-2-1', '3-3', '2-2-2', '1-3-2'], 5: ['2-2', '1-2-1', '2-1-1', '1-1-2'] };
const formsOf = team => FORMACIONES[modOf(team)] || [];
/* Dibujo pequeño de la formación: el portero abajo y cada línea hacia arriba */
function formPitch(form) {
  const lines = form.split('-').map(Number), n = lines.length, W = 120, H = 150;
  const dot = (x, y, gk) => `<circle cx="${x}" cy="${y}" r="7.5" class="${gk ? 'gk' : ''}"/>`;
  const rows = lines.map((k, r) => { const y = H - 34 - (r + 1) * ((H - 52) / n); return Array.from({ length: k }, (_, i) => dot(W * (i + 1) / (k + 1), y)).join(''); }).join('');
  return `<svg class="fm-pitch" viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10"/><line x1="2" y1="${H / 2}" x2="${W - 2}" y2="${H / 2}"/><circle cx="${W / 2}" cy="${H / 2}" r="14" fill="none"/><rect x="${W / 2 - 26}" y="${H - 26}" width="52" height="24" fill="none"/>${rows}${dot(W / 2, H - 16, true)}</svg>`;
}
function modCard(team) {
  const m = modOf(team);
  if (S.editMod !== team) return card('h-mo', 'Modalidad', `<div class="trs"><div class="trs-r du-r"><b>Fútbol ${m}</b><span>${m} titulares y hasta 7 suplentes (${m + 7} convocados)</span></div></div>`,
    '', '<button type="button" class="more" id="moedit">Editar</button>');
  return `<form id="mof" class="card stack" novalidate aria-labelledby="h-mo"><h2 id="h-mo" style="margin:0;font-size:1.1rem">Modalidad</h2>
    <p class="muted" style="margin:0">Marca cuántos titulares hay y cuántos jugadores se pueden convocar.</p>
    <div class="seg g-scope gm-seg" role="group" aria-label="Modalidad">${[7, 11].map(n => `<button type="button" data-mo="${n}" aria-pressed="${n === m}">Fútbol ${n}</button>`).join('')}</div>
    <p id="moerr" class="err" role="alert" hidden></p>
    <div class="btn-row"><button type="button" class="btn ghost" id="mocancel">Cancelar</button><button type="submit" class="btn blue">${ic('check')} Guardar</button></div></form>`;
}
function bindMod(team) {
  if ($('#moedit')) { $('#moedit').onclick = () => { S.editMod = team; render(); }; return; }
  if (!$('#mof')) return;
  let v = modOf(team);
  document.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => { v = +b.dataset.mo; document.querySelectorAll('[data-mo]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#mocancel').onclick = () => { S.editMod = null; render(); };
  $('#mof').onsubmit = async ev => {
    ev.preventDefault();
    try { API() && await API().modalidad(team, v); }
    catch (x) { $('#moerr').textContent = /modalidad|column/i.test(x.message || '') ? 'Falta un paso en Supabase para poder guardar esto. Pídeselo a Claude.' : 'No se ha podido guardar. Revisa la conexión.'; $('#moerr').hidden = false; return; }
    S.teams[team].mod = v; S.editMod = null; render(); say(`${team}: fútbol ${v}`);
  };
}
function durCard(team) {
  const d = durOf(team);
  if (S.editDur !== team) return card('h-du', 'Duración de los partidos', `<div class="trs"><div class="trs-r du-r"><b>${d.partes} partes de ${d.min} minutos</b><span>${d.partes * d.min} minutos en total</span></div></div>`,
    '', '<button type="button" class="more" id="duedit">Editar</button>');
  return `<form id="duf" class="card stack" novalidate aria-labelledby="h-du"><h2 id="h-du" style="margin:0;font-size:1.1rem">Duración de los partidos</h2>
    <p class="muted" style="margin:0">Se usa para los minutos jugados del resumen de la temporada.</p>
    <div class="row2"><label class="f" for="dup">Partes<select id="dup">${[1, 2, 3, 4].map(n => `<option value="${n}" ${n === d.partes ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <label class="f" for="dum">Minutos de cada parte<input type="number" id="dum" inputmode="numeric" min="5" max="60" value="${d.min}"></label></div>
    <p id="duerr" class="err" role="alert" hidden></p>
    <div class="btn-row"><button type="button" class="btn ghost" id="ducancel">Cancelar</button><button type="submit" class="btn blue">${ic('check')} Guardar</button></div></form>`;
}
function bindDur(team) {
  if ($('#duedit')) { $('#duedit').onclick = () => { S.editDur = team; render(); $('#dum') && $('#dum').focus(); }; return; }
  if (!$('#duf')) return;
  $('#ducancel').onclick = () => { S.editDur = null; render(); };
  $('#duf').onsubmit = async ev => {
    ev.preventDefault();
    const partes = +$('#dup').value, min = +$('#dum').value, err = m => { $('#duerr').textContent = m; $('#duerr').hidden = false; };
    if (!(min >= 5 && min <= 60)) return err('Pon los minutos de cada parte (entre 5 y 60).');
    try { API() && await API().duracion(team, partes, min); }
    catch (x) { return err(/partes|minutos_parte|column/i.test(x.message || '') ? 'Falta un paso en Supabase para poder guardar esto. Pídeselo a Claude.' : 'No se ha podido guardar. Revisa la conexión.'); }
    S.teams[team].dur = { partes, min }; S.editDur = null; render(); say(`${team}: ${partes} partes de ${min} minutos`);
  };
}
function summaryCard(e) {
  if (!e) return '';
  const pl = played(e), n = pl.length, c = k => pl.filter(p => outcome(p) === k).length;
  const G = c('G'), E = c('E'), P = c('P');
  const gf = pl.reduce((a, p) => a + p.goles[p.casa ? 0 : 1], 0), gc = pl.reduce((a, p) => a + p.goles[p.casa ? 1 : 0], 0);
  const du = durOf(e.nombre), min = n * du.partes * du.min;
  let open = true; try { open = localStorage.getItem('resumen-cerrado') !== '1'; } catch (_) {}
  const pct = x => n ? Math.round(x / n * 1000) / 10 : 0;
  /* Anillo: cada parte es un trozo de la circunferencia (sin degradados) */
  const R = 15.915, parts = [['ok', G], ['mid', E], ['bad', P]];
  let off = 25;
  const ring = n ? parts.filter(x => x[1]).map(([cl, v]) => { const len = v / n * 100, seg = `<circle class="rs-${cl}" cx="21" cy="21" r="${R}" fill="none" stroke-width="7" stroke-dasharray="${len} ${100 - len}" stroke-dashoffset="${off}"/>`; off -= len; return seg; }).join('')
    : `<circle cx="21" cy="21" r="${R}" fill="none" stroke="var(--line)" stroke-width="7"/>`;
  const tile = (cls, icon, v, l) => `<div class="rs-t ${cls}"><span class="rs-i" aria-hidden="true">${ic(icon)}</span><span class="rs-v"><b>${v}</b><small>${l}</small></span></div>`;
  const line = `<span><b>${n}</b> jugados</span><span><b class="ok">${G}</b> G</span><span><b>${E}</b> E</span><span><b class="bad">${P}</b> P</span><span><b>${gf}</b> a favor</span><span><b>${gc}</b> en contra</span>`;
  return `<section class="card rs" aria-labelledby="h-rs">
    <button type="button" class="rs-h" id="rs-tg" aria-expanded="${open}" aria-controls="rs-b"><span id="h-rs">Resumen de la temporada</span><span class="rs-line">${line}</span><span class="rs-ch" aria-hidden="true">${ic(open ? 'up' : 'down')}</span></button>
    <div id="rs-b" class="rs-b" ${open ? '' : 'hidden'}>
      <div class="rs-tiles">${tile('ok', 'up', G, G === 1 ? 'Ganado' : 'Ganados')}${tile('mid', 'eq', E, E === 1 ? 'Empatado' : 'Empatados')}${tile('bad', 'down', P, P === 1 ? 'Perdido' : 'Perdidos')}${tile('blue', 'clock', min + "'", 'Minutos jugados')}
        ${tile('blue', 'check', gf, 'Goles a favor')}${tile('blue', 'x', gc, 'Goles en contra')}</div>
      <div class="rs-chart"><svg viewBox="0 0 42 42" role="img" aria-label="${n ? `De ${n} partidos: ${G} ganados, ${E} empatados y ${P} perdidos` : 'Todavía no hay partidos jugados'}">${ring}<text x="21" y="20" text-anchor="middle" class="rs-n">${n}</text><text x="21" y="26" text-anchor="middle" class="rs-l">jugados</text></svg>
        <ul class="rs-key">${[['ok', G, 'Ganados'], ['mid', E, 'Empatados'], ['bad', P, 'Perdidos']].map(([cl, v, l]) => `<li><i class="${cl}" aria-hidden="true"></i><span><b>${v}</b> ${l}</span><small>${pct(v).toLocaleString('es-ES')}%</small></li>`).join('')}</ul></div>
    </div></section>`;
}
function bindSummary() {
  const b = $('#rs-tg'); if (!b) return;
  b.onclick = () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open); $('#rs-b').hidden = !open; b.querySelector('.rs-ch').innerHTML = ic(open ? 'up' : 'down');
    try { localStorage.setItem('resumen-cerrado', open ? '0' : '1'); } catch (_) {}
  };
}
function attendanceCard(team, id) {
  const { days, pct } = attendanceHist(team);
  const avg = pct.length ? Math.round(pct.reduce((a, b) => a + b) / pct.length) : null;
  const n = S.teams[team].players.length;
  // Abajo: el último entrenamiento con lista pasada (hoy si ya la has pasado)
  const done = Object.keys(S.attend).filter(k => k.startsWith(team + ' ') && S.attend[k].size).map(k => k.slice(team.length + 1)).sort();
  const lastIso = done.length ? done[done.length - 1] : today();
  const a = S.attend[`${team} ${lastIso}`];
  const lvl = p => p >= 90 ? 'hi' : p < 70 ? 'lo' : 'mid';
  return card(id, `Asistencia · ${team}`, `
    <div class="bignum">${avg == null ? '–' : avg + '%'}</div><div class="delta">${avg == null ? 'Aún no has pasado lista' : S.live ? `Media de los últimos ${pct.length} entrenamientos` : '+4% respecto a septiembre'}</div>
    <div class="bars" role="img" aria-label="Asistencia por entrenamiento: ${pct.join(', ')} por ciento">${pct.map(p => `<span class="${lvl(p)}" style="height:${Math.max(p, 4) * .82}%"><b>${p}%</b></span>`).join('')}</div>
    <div class="bars-x" aria-hidden="true">${days.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="bars-key"><span><i class="hi"></i>90% o más</span><span><i class="mid"></i>70–89%</span><span><i class="lo"></i>Menos de 70%</span></div>
    <div class="last">${ic('check')}<span class="last-t">${lastIso === today() ? 'Hoy' : 'Último entrenamiento · ' + dayLbl(lastIso)}</span><b>${a ? a.size : 0} de ${n}</b></div>`, 'a-attend', `<span class="tag">${S.live ? `Últimos ${pct.length}` : 'Octubre'}</span>`);
}
function noticeCard(n, cls = '') {
  if (!n) return '';
  return `<section class="card notice ${cls}" aria-labelledby="nt${n.id}"><div class="media">${crestImg()}<span class="lbl">${ic('bell')}Aviso del club</span></div>
    <span class="eyebrow">${esc(n.from)}</span><h3 id="nt${n.id}">${esc(n.title)}</h3><p class="eyebrow nb">${esc(n.body)}</p></section>`;
}

/* Días, hora y campo de entrenamiento de un equipo (lo edita la junta) */
const CAMPOS = ['Campo entero', 'Campo 1', 'Campo 2'];
function trainCard(team) {
  const t = trainOf(team), ses = sesiones(t);
  /* Ya guardado: se muestra como ficha, un renglón por día, con botón para editar */
  if (t && S.editTrain !== team) return card('h-tr', 'Entrenamientos', `<div class="trs">${ses.map(x => `<div class="trs-r"><b>${DIAS_D[x.d - 1]}</b><span>${esc(x.h || 'Sin hora')}</span><span>${esc(x.where || 'Sin campo')}</span></div>`).join('')}</div>`,
    '', '<button type="button" class="more" id="tedit">Editar</button>');
  const last = ses[ses.length - 1] || {};
  return `<form id="tf" class="card stack" novalidate aria-labelledby="h-tr"><h2 id="h-tr" style="margin:0;font-size:1.1rem">Entrenamientos</h2>
        <fieldset class="f"><legend>Días</legend><div class="chips">${DIAS.map((d, i) => `<label class="chip"><input type="checkbox" value="${i + 1}" ${ses.some(z => z.d === i + 1) ? 'checked' : ''}> <span aria-hidden="true">${d}</span><span class="sr">${DIAS_D[i]}</span></label>`).join('')}</div></fieldset>
    <div class="trf">${DIAS_D.map((dn, i) => { const x = ses.find(z => z.d === i + 1), on = !!x, v = x || last;
      return `<div class="trf-r" data-d="${i + 1}" ${on ? '' : 'hidden'}><b>${dn}</b>
        <label class="f"><span class="sr">Hora del ${dn.toLowerCase()}</span><input type="time" value="${esc(v.h || '')}"></label>
        <label class="f"><span class="sr">Campo del ${dn.toLowerCase()}</span><select>${[...new Set([...CAMPOS, ...(v.where ? [v.where] : [])])].map(c => `<option ${(v.where || 'Campo entero') === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label></div>`; }).join('')}</div>
    <p id="terr" class="err" role="alert" hidden></p>
    <div class="btn-row">${t ? '<button type="button" class="btn ghost" id="tcancel">Cancelar</button>' : ''}<button type="submit" class="btn blue block">${ic('check')} Guardar</button></div></form>`;
}
function bindTrain(team) {
  if ($('#tedit')) { $('#tedit').onclick = () => { S.editTrain = team; render(); $('#tf input') && $('#tf input').focus(); }; return; }
  if ($('#tcancel')) $('#tcancel').onclick = () => { S.editTrain = null; render(); };
  const rows = [...document.querySelectorAll('#tf .trf-r')];
  /* Al marcar un día nuevo, copia la hora y el campo del último día marcado para no repetirlos */
  document.querySelectorAll('#tf .chips input').forEach(cb => cb.onchange = () => {
    const r = rows.find(o => o.dataset.d === cb.value);
    if (cb.checked) { const prev = rows.filter(o => o !== r && !o.hidden).pop();
      if (prev) { r.querySelector('input[type=time]').value = prev.querySelector('input[type=time]').value; r.querySelector('select').value = prev.querySelector('select').value; } }
    r.hidden = !cb.checked;
  });
  $('#tf').onsubmit = async e => {
    e.preventDefault();
    const ses = rows.filter(r => !r.hidden).map(r => ({ d: +r.dataset.d, h: r.querySelector('input[type=time]').value, where: r.querySelector('select').value }));
    if (ses.some(x => !x.h)) { $('#terr').textContent = 'Pon la hora de cada día marcado.'; $('#terr').hidden = false; return; }
    const tr = { dias: ses.map(x => x.d), h: (ses[0] || {}).h || '', where: (ses[0] || {}).where || '', ses };
    try { API() && await API().entreno(team, tr); } catch (_) { $('#terr').textContent = 'No se ha podido guardar. Revisa la conexión.'; $('#terr').hidden = false; return; }
    S.teams[team].train = tr; S.editTrain = null; AGENDA = buildAgenda(); render();
    say(tr.dias.length ? `${team} entrena los ${tr.dias.map(d => DIAS_L[d - 1]).join(', ').replace(/, ([^,]*)$/, ' y $1')}` : `${team} sin días de entrenamiento`);
  };
}

/* Plantilla: lista y alta/baja de jugadores (entrenador de ese equipo o junta) */
function rosterCard(team) {
  const t = S.teams[team];
  const list = [...t.players].sort((a, b) => (a.dorsal || 99) - (b.dorsal || 99) || a.n.localeCompare(b.n));
  return card('h-pl', `Plantilla · ${t.players.length} jugador${t.players.length === 1 ? '' : 'es'}`, list.length ? `<div class="roster">${list.map(p => `<button type="button" class="tm tm-btn pcard" data-edit="${p.id}" aria-label="Editar a ${esc(p.n)}">${pnum(p, 'k', '–')}
      <span class="grow"><b title="${esc(p.n)}">${pn(p.n)}</b><small>${p.dorsal ? 'Dorsal ' + p.dorsal : 'Sin dorsal'}</small></span>
      ${attPill(team, p.id, true)}<span class="go" aria-hidden="true">${ic('chev')}</span></button>`).join('')}</div>` : '<p class="muted" style="margin:0">Todavía no hay jugadores.</p>');
}
function addPlayerCard(team) {
  return `<form id="pf" class="card stack add-pl" novalidate aria-labelledby="h-add"><h2 id="h-add" style="margin:0;font-size:1.1rem">Añadir jugador</h2>
      <div class="add-row"><label class="f" for="pn">Nombre y apellidos<input type="text" id="pn" autocomplete="off" required></label>
      <label class="f" for="pd">Dorsal (opcional)<input type="number" id="pd" inputmode="numeric" min="1" max="99"></label></div>
      <p id="perr" class="err" role="alert" hidden>Escribe el nombre del jugador.</p>
      <button type="submit" class="btn blue block">${ic('plus')} Añadir a ${esc(team)}</button></form>`;
}
function bindRoster(team) {
  const t = S.teams[team], f = $('#pf');
  if (!f) return;
  f.onsubmit = async e => {
    e.preventDefault();
    const p = { n: $('#pn').value.trim(), dorsal: +$('#pd').value || null };
    if (!p.n) { $('#perr').hidden = false; $('#pn').focus(); return; }
    try { p.id = API() ? await API().jugador(team, p) : Date.now(); } catch (_) { say('No se ha podido guardar. Revisa la conexión.'); return; }
    t.players.push(p); render(); say(`${p.n} añadido a ${team}`); $('#pn') && $('#pn').focus();
  };
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editPlayer(team, t.players.find(x => x.id == b.dataset.edit)));
}
/* Ventana para cambiar nombre y dorsal, o quitar al jugador (con confirmación) */
function editPlayer(team, p) {
  const t = S.teams[team];
  const ph = { foto: p.foto || null };
  const m = modal(`<h2 id="mdl-t">${pn(p.n)}</h2>
    ${playerAttHTML(team, p)}
    ${statsOn() && playerStats(p.id).pj ? `<div class="patt"><b>Liga</b>${statKpis(team, p)}</div>` : ''}
    <form id="ef" class="stack" novalidate><b style="margin-top:4px">Editar jugador</b>
      ${photoField(ph.foto, p.n)}
      ${p.foto ? '<button type="button" class="linkbtn" id="efq" style="align-self:flex-start">Quitar la foto</button>' : ''}
      <label class="f" for="en">Nombre y apellidos<input type="text" id="en" autocomplete="off" value="${esc(p.n)}"></label>
      <label class="f" for="ed">Dorsal (opcional)<input type="number" id="ed" inputmode="numeric" min="1" max="99" value="${p.dorsal || ''}"></label>
      <p id="eerr" class="err" role="alert" hidden>Escribe el nombre del jugador.</p>
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Cancelar</button><button type="submit" class="btn blue">${ic('check')} Guardar</button></div>
    </form>
    <button type="button" class="linkbtn" id="edel">Quitar de la plantilla</button>`, 'dialog', () => {});
  bindPhoto(ph);
  if ($('#efq')) $('#efq').onclick = () => { ph.foto = null; const l = $('label[for=fo]'); l.querySelector('.av').outerHTML = avatar({ nombre: p.n }, 'av'); $('#fo-t').textContent = 'Añadir foto (opcional)'; $('#efq').remove(); };
  $('#en').focus();
  $('#ef').onsubmit = async e => {
    e.preventDefault();
    const n = $('#en').value.trim(), dorsal = +$('#ed').value || null;
    if (!n) { $('#eerr').hidden = false; $('#en').focus(); return; }
    try { API() && await API().editarJugador(p.id, n, dorsal); } catch (_) { $('#eerr').textContent = 'No se ha podido guardar. Revisa la conexión.'; $('#eerr').hidden = false; return; }
    p.n = n; p.dorsal = dorsal;
    /* La foto va aparte: si falta el paso de Supabase, el resto se guarda igual */
    let fotoMal = false;
    if ((ph.foto || null) !== (p.foto || null)) {
      try { API() && await API().fotoJugador(p.id, ph.foto); p.foto = ph.foto || undefined; } catch (_) { fotoMal = true; }
    }
    m.close(); render(); say(fotoMal ? `${n} guardado, pero sin la foto: falta un paso en Supabase.` : `${n} guardado`);
  };
  $('#edel').onclick = async () => {
    m.close();
    if (!(await ask(`¿Quitar a ${p.n}?`, `Se eliminará de la plantilla de ${team} y ya no saldrá al pasar lista.`, 'Sí, quitar'))) return;
    try { API() && await API().quitarJugador(p.id, false); } catch (_) { say('No se ha podido quitar. Revisa la conexión.'); return; }
    t.players = t.players.filter(x => x !== p); render();
    say(`${p.n} ya no está en la plantilla`, () => { t.players.push(p); API() && API().quitarJugador(p.id, true); });
  };
}

/* ---------- ESTADÍSTICAS ---------- */
/* Minutos y goles de cada jugador en liga. La federación no los publica: el entrenador los apunta tras cada partido */
const statOf = (id, f) => (S.stats[id] || {})[f];
const stFilled = (team, f) => S.teams[team].players.some(p => statOf(p.id, f));
/* Partidos convocados: convocatorias del equipo hechas en la app para partidos de liga ya jugados (o de hoy) */
const convCount = (team, id) => { const e = EQ[team]; if (!e) return 0;
  return e.partidos.filter(p => !p.descansa && p.fecha <= TODAY && ((S.conv[convKey(team, p)] || {}).ids || []).includes(id)).length; };
function playerStats(id, team) {
  const r = Object.values(S.stats[id] || {});
  return { pc: team ? convCount(team, id) : 0, pj: r.length, m: r.reduce((a, x) => a + x.m, 0), g: r.reduce((a, x) => a + x.g, 0) };
}
const statsOn = () => !(S.live && S.statsOff);
const goalsUs = p => p.goles[p.casa ? 0 : 1];
function openSt(team, fecha) { S.stDate = fecha; S.stDraft = null; go('team', S.role === 'coach' ? 'st' : 'st:' + team); }
function statsView(team) {
  const t = S.teams[team], e = EQ[team];
  if (!statsOn()) return `<section class="card stack notrain"><span class="ic">${ic('clock')}</span><p style="margin:0">Las estadísticas estarán listas en cuanto la junta termine un paso. Vuelve a mirar en un rato.</p></section>`;
  const pl = e ? played(e).slice().reverse() : [], pend = pl.filter(p => !stFilled(team, p.fecha));
  const sort = S.stSort || 'dorsal';
  const rows = t.players.map(p => ({ p, ...playerStats(p.id, team) })).sort((a, b) => (sort === 'min' ? b.m - a.m || b.pj - a.pj : sort === 'goles' ? b.g - a.g || b.m - a.m : 0)
    || (a.p.dorsal || 99) - (b.p.dorsal || 99) || a.p.n.localeCompare(b.p.n, 'es'));
  const SORTS = [['dorsal', 'Dorsal'], ['min', 'Minutos'], ['goles', 'Goles']];
  const players = card('h-st', 'Estadísticas de liga', !t.players.length ? '<p class="muted" style="margin:0">Todavía no hay jugadores.</p>' : `
    <div class="seg g-scope st-sort" role="group" aria-label="Ordenar por">${SORTS.map(([k, l]) => `<button type="button" data-sts="${k}" aria-pressed="${sort === k}">${l}</button>`).join('')}</div>
    <div class="st-head st5" aria-hidden="true"><span>Jugador</span><span>PC</span><span>PJ</span><span>Min.</span><span>Goles</span></div>
    <div class="st-list">${rows.map(r => `<button type="button" class="st-row st5" data-stp="${r.p.id}" aria-label="${esc(r.p.n)}${r.p.dorsal ? ', dorsal ' + r.p.dorsal : ''}: ${r.pc} convocado, ${r.pj} jugados, ${r.m} minutos, ${r.g} goles">
      ${pnum(r.p, 'k', '–')}<b class="st-n" title="${esc(r.p.n)}">${pn(r.p.n)}</b><span>${r.pc}</span><span>${r.pj}</span><span class="${sort === 'min' ? 'on' : ''}">${r.m}'</span><span class="${sort === 'goles' ? 'on' : ''}">${r.g}</span></button>`).join('')}</div>
    <p class="muted st-foot">PC: partidos convocado. PJ: partidos jugados. Partidos apuntados: ${pl.length - pend.length} de ${pl.length}.</p>`, 'st-card');
  const matches = card('h-stm', 'Partidos de liga', pl.length ? `<p class="muted" style="margin:0 0 4px">Toca un partido para ver su ficha o apuntar los minutos y los goles.</p>${pl.map(p => {
    const res = outcome(p), done = stFilled(team, p.fecha);
    return `<button type="button" class="mt st-mt" data-stm="${p.fecha}"><span class="cal-d"><span>J${p.j}</span><b>${toDate(p.fecha).getDate()}</b></span>${crestBadge(e, p.rival)}
      <span class="grow"><b title="${esc(nice(p.rival))}">${esc(nice(p.rival))}</b><small>${dateLbl(p.fecha)} · <span class="res-t ${res}">${scoreTxt(p)}</span></small></span>
      ${done ? `<span class="pill">${ic('check')} Apuntado</span>` : '<span class="pill gold">Apuntar</span>'}</button>`;
  }).join('')}` : '<p class="muted" style="margin:0">Todavía no se ha jugado ningún partido.</p>');
  const banner = pend.length && t.players.length ? `<button type="button" class="card st-pend" data-stm="${pend[pend.length - 1].fecha}"><span class="ic">${ic('clock')}</span>
    <span class="grow"><b>${pend.length === 1 ? '1 partido sin apuntar' : `${pend.length} partidos sin apuntar`}</b><small>Apunta el de ${esc(nice(pend[pend.length - 1].rival))}</small></span><span class="go" aria-hidden="true">${ic('chev')}</span></button>` : '';
  /* Actas hechas con el directo (acabadas o a medias), para verlas y corregirlas sin ir a Partidos */
  const actas = e ? e.partidos.filter(p => !p.descansa && actaOf(team, p.fecha) && actaOf(team, p.fecha).fase !== 'previa').sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];
  const actasCard = actas.length ? card('h-sta', 'Actas de partidos', `<p class="muted" style="margin:0 0 4px">Toca un acta para verla o corregirla.</p>${actas.map(p => {
    const a = actaOf(team, p.fecha), g = p.casa ? [a.nos, a.ellos] : [a.ellos, a.nos], fin = a.fase === 'fin';
    return `<button type="button" class="mt st-mt" data-sta="${p.fecha}"><span class="cal-d"><span>J${p.j}</span><b>${toDate(p.fecha).getDate()}</b></span>${crestBadge(e, p.rival)}
      <span class="grow"><b title="${esc(nice(p.rival))}">${esc(nice(p.rival))}</b><small>${dateLbl(p.fecha)} · <span class="res-t ${outcome({ ...p, goles: g })}">${g[0]}–${g[1]}</span></small></span>
      ${fin ? `<span class="pill">${ic('check')} Acabada</span>` : '<span class="pill gold">En juego</span>'}</button>`;
  }).join('')}`) : '';
  /* Formaciones: la de cada jornada y cuánto se ha usado cada una */
  const conForm = e ? e.partidos.filter(p => !p.descansa && (actaOf(team, p.fecha) || {}).form).sort((a, b) => b.fecha.localeCompare(a.fecha)) : [];
  const cuenta = {}; conForm.forEach(p => { const fm = actaOf(team, p.fecha).form; cuenta[fm] = (cuenta[fm] || 0) + 1; });
  const ranking = Object.entries(cuenta).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const formCard = formsOf(team).length ? card('h-stf', 'Formaciones', !conForm.length ? '<p class="muted" style="margin:0">Todavía no hay ninguna. Elige la formación al rellenar los datos de cada partido.</p>' : `
    <div class="fm-top">${formPitch(ranking[0][0])}<div class="grow"><small class="muted">La que más usas</small><b class="fm-big">${esc(ranking[0][0])}</b><small class="muted">${Math.round(ranking[0][1] * 100 / conForm.length)}% de ${conForm.length} ${conForm.length === 1 ? 'partido' : 'partidos'}</small></div></div>
    <div class="fm-bars">${ranking.map(([fm, n]) => { const pc = Math.round(n * 100 / conForm.length);
      return `<div class="fm-bar"><b>${esc(fm)}</b><span class="fm-track"><i style="width:${pc}%"></i></span><span>${pc}%</span></div>`; }).join('')}</div>
    <h3 class="fm-h">Jornada a jornada</h3>${conForm.map(p => `<div class="fm-row"><span class="cal-d"><span>J${p.j}</span><b>${toDate(p.fecha).getDate()}</b></span>${crestBadge(e, p.rival)}
      <span class="grow"><b title="${esc(nice(p.rival))}">${esc(nice(p.rival))}</b><small>${dateLbl(p.fecha)}</small></span><span class="pill blue">${esc(actaOf(team, p.fecha).form)}</span></div>`).join('')}`) : '';
  return `<div class="stack">${banner}<div class="split st-split">${players}<div class="stack">${formCard}${actasCard}${matches}</div></div></div>`;
}
function bindStats(team) {
  document.querySelectorAll('[data-sts]').forEach(b => b.onclick = () => { S.stSort = b.dataset.sts; render(); });
  document.querySelectorAll('[data-stm]').forEach(b => b.onclick = () => stFilled(team, b.dataset.stm) ? openFicha(team, b.dataset.stm) : openSt(team, b.dataset.stm));
  document.querySelectorAll('[data-sta]').forEach(b => b.onclick = () => openLv(team, b.dataset.sta));
  document.querySelectorAll('[data-stp]').forEach(b => b.onclick = () => statPlayer(team, S.teams[team].players.find(x => x.id == b.dataset.stp)));
}
/* Cifras de liga de un jugador (en su ficha y en la ventana de estadísticas) */
function statKpis(team, p) {
  const s = playerStats(p.id, team), e = EQ[team], du = durOf(team), full = du.partes * du.min;
  const filled = e ? played(e).filter(x => stFilled(team, x.fecha)).length : 0, pct = filled && full ? Math.round(s.m / (filled * full) * 100) : null;
  return `<div class="st-kpis"><div><b>${s.pc}</b><small>Convocado</small></div><div><b>${s.pj}</b><small>Jugados</small></div><div><b>${s.m}'</b><small>Minutos</small></div><div><b>${s.g}</b><small>Goles</small></div><div><b>${s.pj ? Math.round(s.m / s.pj) + "'" : '–'}</b><small>Media</small></div></div>
    ${pct != null ? `<small class="muted">Ha jugado el ${pct}% de los minutos posibles (${filled} partido${filled === 1 ? '' : 's'} apuntado${filled === 1 ? '' : 's'}).</small>` : ''}`;
}
function statPlayer(team, p) {
  const e = EQ[team], pl = e ? played(e).slice().reverse().filter(x => stFilled(team, x.fecha)) : [];
  const m = modal(`<div class="rqd-h">${pnum(p, 'st-dor', '–')}<div class="grow"><h2 id="mdl-t" class="st-h2" title="${esc(p.n)}">${pn(p.n)}</h2><small>${esc(team)}${p.dorsal ? ' · Dorsal ' + p.dorsal : ''}</small></div>
      <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
    ${statKpis(team, p)}
    <b>Partido a partido</b>
    ${pl.length ? `<div class="st-pm">${pl.map(x => { const s = statOf(p.id, x.fecha);
      return `<div class="${s ? '' : 'no'}"><span class="grow"><b title="${esc(nice(x.rival))}">${esc(nice(x.rival))}</b><small>${dateLbl(x.fecha)} · ${scoreTxt(x)}</small></span>${s ? `<span class="st-v">${s.m}'</span><span class="st-v">${s.g ? `${s.g} gol${s.g === 1 ? '' : 'es'}` : '–'}</span>` : '<span class="st-v no">No jugó</span>'}</div>`; }).join('')}</div>`
      : '<p class="muted" style="margin:0">Todavía no hay partidos apuntados.</p>'}`, 'dialog', () => {});
  m.el.classList.add('rqd');
  m.el.querySelector('[data-v="0"]').focus();
}
/* Pantalla para apuntar quién jugó, cuántos minutos y sus goles en un partido */
function stScreen(team, back) {
  const t = S.teams[team], e = EQ[team];
  /* El partido con resultado de la federación o, si aún no ha salido, con el del directo */
  let p = e && e.partidos.find(x => x.fecha === S.stDate && !x.descansa);
  const acta = p && actaOf(team, p.fecha);
  if (p && !p.goles && acta && acta.fase === 'fin') p = { ...p, goles: p.casa ? [acta.nos, acta.ellos] : [acta.ellos, acta.nos] };
  if (p && !p.goles) p = null;
  if (!p) return { kicker: 'Minutos y goles', title: esc(team), back, body: emptyPage('cal', 'No encontramos ese partido', 'Vuelve atrás y elige otro partido.') };
  const du = durOf(team), full = du.partes * du.min, max = full + 30, k = `${team} ${p.fecha}`;
  const d = S.stDraft && S.stDraft.k === k ? S.stDraft
    : (S.stDraft = { k, rows: Object.fromEntries(t.players.filter(x => statOf(x.id, p.fecha)).map(x => [x.id, { ...statOf(x.id, p.fecha) }])) });
  const list = [...t.players].sort((a, b) => (a.dorsal || 99) - (b.dorsal || 99) || a.n.localeCompare(b.n, 'es'));
  const ours = goalsUs(p), res = outcome(p);
  const row = x => { const r = d.rows[x.id], on = !!r;
    return `<li class="st-e ${on ? 'on' : ''}" data-ste="${x.id}"><button type="button" class="st-tg" aria-pressed="${on}"><span class="tick" aria-hidden="true">${ic('check')}</span>${pnum(x, 'num', '–')}
      <span class="grow"><b title="${esc(x.n)}">${pn(x.n)}</b><small class="pstate">${on ? 'Ha jugado' : 'No ha jugado'}</small></span></button>
      <div class="st-c" ${on ? '' : 'hidden'}><label class="st-m" for="stm-${x.id}">Minutos<input type="number" id="stm-${x.id}" inputmode="numeric" min="1" max="${max}" value="${on ? r.m : full}"></label>
      <div class="st-g" role="group" aria-label="Goles de ${esc(x.n)}"><span>Goles</span><span class="st-gc"><button type="button" class="iconbtn" data-gd="-1" aria-label="Un gol menos">${ic('minus')}</button><output>${on ? r.g : 0}</output><button type="button" class="iconbtn" data-gd="1" aria-label="Un gol más">${ic('plus')}</button></span></div></div></li>`; };
  const n = () => Object.keys(d.rows).length, gl = () => Object.values(d.rows).reduce((a, r) => a + r.g, 0);
  const allOn = () => t.players.length > 0 && t.players.every(x => d.rows[x.id]);
  const allBtn = () => allOn() ? `${ic('x')} Quitar a todos` : `${ic('check')} Todos jugaron`;
  const goalsTxt = () => `Goles apuntados: <b>${gl()}</b> de ${ours} que marcó el equipo.`;
  return {
    kicker: `Minutos y goles · ${esc(team)}`, title: `vs ${esc(nice(p.rival))}`, back,
    body: `<div class="split"><div class="stack">
      <section class="card match" aria-label="Partido"><div class="att-top">
        <div><span class="tag">${dateLbl(p.fecha)} · ${p.casa ? 'Local' : 'Visitante'} · ${res === 'G' ? 'Ganado' : res === 'P' ? 'Perdido' : 'Empatado'} ${scoreTxt(p)}</span><div class="vs-time" style="margin-top:10px" id="stn">${n()}<small style="font-size:1.2rem;opacity:.7"> / ${t.players.length}</small></div><small>han jugado</small></div>
        <button type="button" class="btn gold" id="stall"${t.players.length ? '' : ' disabled'}>${allBtn()}</button></div>
        <small class="cv-place">${ic('clock')} Partido de ${full} minutos</small></section>
      <p class="muted" style="margin:0">Toca a cada jugador que ha jugado. Luego cambia sus minutos si no jugó el partido entero y súmale sus goles.</p>
      ${acta && acta.fase === 'fin' ? `<div class="card stack st-acta"><p style="margin:0">Este partido tiene <b>acta del directo</b>. Si falta un gol, añádelo en el acta con su minuto: así se actualizan el marcador y las estadísticas.</p><button type="button" class="btn blue block" id="stacta">${ic('list')} Abrir el acta</button></div>` : ''}
      ${t.players.length ? '' : `<p class="card muted" style="margin:0">Todavía no hay jugadores en este equipo. Añádelos en “Plantilla”.</p>`}
      <ul class="st-es">${list.map(row).join('')}</ul></div>
      <form id="stf" class="card stack st-save" novalidate aria-labelledby="h-sts"><h2 id="h-sts" style="margin:0;font-size:1.1rem">Guardar</h2>
        <p class="muted" style="margin:0" id="stgl" aria-live="polite">${goalsTxt()}</p>
        <p id="sterr" class="err" role="alert" hidden></p>
        <button type="submit" class="btn blue block">${ic('check')} Guardar minutos y goles</button></form></div>`,
    bind() {
      if ($('#stacta')) $('#stacta').onclick = () => openLv(team, p.fecha);
      const sync = () => { $('#stn').innerHTML = `${n()}<small style="font-size:1.2rem;opacity:.7"> / ${t.players.length}</small>`; $('#stall').innerHTML = allBtn(); $('#stgl').innerHTML = goalsTxt(); };
      const paint = li => { const id = +li.dataset.ste, r = d.rows[id], on = !!r;
        li.querySelector('.st-tg').setAttribute('aria-pressed', on); li.querySelector('.pstate').textContent = on ? 'Ha jugado' : 'No ha jugado';
        li.classList.toggle('on', on); li.querySelector('.st-c').hidden = !on; if (on) { li.querySelector('input').value = r.m; li.querySelector('output').textContent = r.g; } };
      const lis = [...document.querySelectorAll('[data-ste]')];
      lis.forEach(li => {
        const id = +li.dataset.ste;
        li.querySelector('.st-tg').onclick = () => { if (d.rows[id]) delete d.rows[id]; else d.rows[id] = { m: full, g: 0 }; paint(li); sync(); };
        li.querySelector('input').oninput = ev => { if (d.rows[id]) d.rows[id].m = +ev.target.value || 0; };
        li.querySelectorAll('[data-gd]').forEach(b => b.onclick = () => { const r = d.rows[id]; if (!r) return; r.g = Math.min(20, Math.max(0, r.g + +b.dataset.gd)); paint(li); sync();
          $('#live').textContent = `${t.players.find(x => x.id === id).n}: ${r.g} gol${r.g === 1 ? '' : 'es'}`; });
      });
      $('#stall').onclick = () => { if (allOn()) d.rows = {}; else t.players.forEach(x => { d.rows[x.id] = d.rows[x.id] || { m: full, g: 0 }; }); lis.forEach(paint); sync(); };
      $('#stf').onsubmit = async ev => {
        ev.preventDefault();
        const err = (m, el) => { $('#sterr').textContent = m; $('#sterr').hidden = false; if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); } };
        document.querySelectorAll('.st-m input').forEach(i => i.removeAttribute('aria-invalid'));
        const ids = Object.keys(d.rows).map(Number);
        if (!ids.length) return err('Marca al menos a un jugador que haya jugado.');
        const bad = list.find(x => d.rows[x.id] && !(d.rows[x.id].m >= 1 && d.rows[x.id].m <= max));
        if (bad) return err(`Revisa los minutos de ${bad.n} (entre 1 y ${max}).`, $(`#stm-${bad.id}`));
        const filas = ids.map(id => ({ id, m: Math.round(d.rows[id].m), g: d.rows[id].g }));
        const quitar = t.players.filter(x => statOf(x.id, p.fecha) && !d.rows[x.id]).map(x => x.id);
        try { API() && await API().estadisticas(p.fecha, filas, quitar); }
        catch (x) { return err(/estadisticas|relation|schema/i.test(x.message || '') ? 'Falta un paso en Supabase para poder guardar esto. Avisa a la junta.' : 'No se ha podido guardar. Revisa la conexión.'); }
        filas.forEach(f => { (S.stats[f.id] = S.stats[f.id] || {})[p.fecha] = { m: f.m, g: f.g }; });
        quitar.forEach(id => { delete S.stats[id][p.fecha]; });
        S.stDraft = null; back(); say(`Guardado: ${filas.length} jugadores contra ${nice(p.rival)}`);
      };
    }
  };
}

/* ---------- DIRECTO DEL PARTIDO ---------- */
/* El entrenador elige titulares y suplentes, pone el cronómetro en marcha y apunta goles, tarjetas y cambios con su minuto.
   El reloj va por la hora real, así que sigue aunque se bloquee el móvil o se cierre la app.
   Al acabar, los minutos y goles de cada jugador pasan a las estadísticas. */
const lvKey = (team, f) => `directo ${team} ${f}`;
const lvStrip = L => { const { hist, ...r } = L; return r; };
const actaOf = (team, f) => (S.actas || {})[`${team} ${f}`] || null;
/* Dorsal de cada jugador en este partido (se elige al poner titulares y suplentes); si no, el de la plantilla */
const lvDor = (L, x) => (L.dor && L.dor[x.id] != null ? L.dor[x.id] : x.dorsal) || null;
const lvPlayers = (L, players) => players.map(x => ({ ...x, dorsal: lvDor(L, x) }));
/* Junto al nombre solo si tiene foto: sin foto el dorsal ya va dentro de la bola */
const dorTxt = q => q && q.foto && q.dorsal ? `${q.dorsal} · ` : '';
function lvLoad(team, p) {
  let L = null; try { L = JSON.parse(localStorage.getItem(lvKey(team, p.fecha)) || 'null'); } catch (_) {}
  const srv = actaOf(team, p.fecha);
  if (srv && (!L || (srv.v || 0) > (L.v || 0))) L = { ...srv, hist: [] };
  if (L) return L;
  const du = durOf(team), cv = S.conv[convKey(team, p)];
  return { v: 0, fase: 'previa', parte: 0, partes: du.partes, min: du.min, rival: nice(p.rival), casa: !!p.casa,
    tit: [], sup: cv ? [...cv.ids] : [], campo: [], rojas: [], acc: 0, ini: null, desde: {}, seg: {}, ev: [], nos: 0, ellos: 0, hist: [] };
}
function lvSave(team, f, L) {
  L.v = Date.now();
  try { localStorage.setItem(lvKey(team, f), JSON.stringify(L)); } catch (_) {}
  (S.actas = S.actas || {})[`${team} ${f}`] = lvStrip(L);
  if (API() && !(S.live && S.directoOff)) API().directo(team, f, lvStrip(L)).catch(() => {});
}
const lvPart = L => L.fase === 'juego' && L.ini ? Math.max(0, (Date.now() - L.ini) / 1000) : 0;
const lvCap = L => L.acc + Math.min(lvPart(L), L.min * 60);  /* segundos que cuentan para los minutos (sin el añadido) */
const lvMin = L => {
  if (L.fase !== 'juego') return `${L.parte * L.min}`;
  const m = Math.floor(lvPart(L) / 60) + 1, base = (L.parte - 1) * L.min;
  return m > L.min ? `${base + L.min}+${m - L.min}` : `${base + m}`;
};
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const lvClock = L => L.fase === 'juego' ? mmss((L.parte - 1) * L.min * 60 + lvPart(L)) : mmss(L.parte * L.min * 60);
const lvSeg = (L, id) => (L.seg[id] || 0) + (L.fase === 'juego' && L.campo.includes(id) ? lvCap(L) - (L.desde[id] || 0) : 0);
const lvMins = (L, id) => Math.floor(lvSeg(L, id) / 60);
const lvSnap = L => { L.hist = [...(L.hist || []).slice(-29), JSON.stringify(lvStrip(L))]; };
const lvGoals = (L, id) => L.ev.filter(x => x.t === 'gol' && x.id === id).length;
const lvYellow = (L, id) => L.ev.filter(x => x.t === 'ama' && x.id === id).length;
const parteLbl = n => `${n}ª parte`;
function openLv(team, fecha) { S.lvFrom = S.tab; S.lvSub = S.sub; S.lvDate = fecha; S.lv = null; if (S.role === 'coach') S.team = team; go('team', S.role === 'coach' ? 'lv' : 'lv:' + team); }
/* Un partido tiene directo si es el próximo, si es de hoy o de ayer, o si ya se empezó */
const lvAvail = (e, p) => !e.externo && !!S.teams[e.nombre] && !p.descansa && (!!actaOf(e.nombre, p.fecha) || p.fecha <= TODAY || p === nextMatch(e));
/* Pizarra: el campo a pantalla completa con la formación, para colocar a cada jugador en su sitio.
   Va aparte de la formación de las estadísticas: solo guarda quién va en cada hueco (L.pz). Antes del partido se colocan
   los titulares; durante el partido, los que están en el campo (el que entra en un cambio ocupa el hueco del que sale) */
const pzSpots = form => { const lines = form ? form.split('-').map(Number) : [], spots = [{ x: 50, y: 88 }];
  lines.forEach((k, r) => { for (let i = 0; i < k; i++) spots.push({ x: 100 * (i + 1) / (k + 1), y: 88 - (r + 1) * (74 / lines.length) }); });
  return spots; };
function pizarra(team, L, players, save, e, p, onSub) {
  players = lvPlayers(L, players);
  let form = L.form || formsOf(team)[0] || '', spots = pzSpots(form), n = spots.length, dirty = false;
  const form0 = L.form;
  L.pz = L.pz || { ids: [] };
  /* En el directo se pueden probar cambios en la pizarra sin apuntarlos: L.pz.plan = { hueco: el que entraría } */
  const live = typeof onSub === 'function' && ['juego', 'pausa'].includes(L.fase);
  L.pz.plan = L.pz.plan || {};
  let sel = null;   /* jugador elegido abajo, a la espera de tocar su hueco */
  const pl = id => players.find(x => x.id === id) || { id, n: 'Jugador', dorsal: null };
  const byDor = (a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99) || pl(a).n.localeCompare(pl(b).n, 'es');
  const avail = () => (L.fase === 'previa' ? L.tit : L.campo).filter(id => !(L.rojas || []).includes(id));
  const bench = () => (L.fase === 'previa' ? L.sup : [...new Set([...L.tit, ...L.sup])].filter(id => !L.campo.includes(id) && !(L.rojas || []).includes(id))).slice().sort(byDor);
  const slots = () => { const ok = avail(); return Array.from({ length: n }, (_, i) => ok.includes(L.pz.ids[i]) ? L.pz.ids[i] : null); };
  const plans = () => { const ids = slots(), bn = bench(), out = {}; if (!live) return out;
    Object.entries(L.pz.plan).forEach(([i, id]) => { if (ids[+i] != null && bn.includes(id) && !Object.values(out).includes(id)) out[+i] = id; }); return out; };
  const face = q => q.foto ? `<span class="pz-f"><img src="${esc(q.foto)}" alt=""></span>` : q.dorsal ? `<span class="pz-f num">${q.dorsal}</span>` : `<span class="pz-f none">${ic('user')}</span>`;
  const them = L.rival;
  const d = document.createElement('div');
  d.className = 'pz'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', `Alineación contra ${nice(p.rival)}`);
  const back = document.activeElement;
  const pzClock = () => L.fase === 'juego' ? lvClock(L) : L.fase === 'pausa' ? `${lvClock(L)} · Descanso` : 'Final';
  const tick = setInterval(() => { const c = d.querySelector('#pz-clock'); if (c && L.fase === 'juego') c.textContent = lvClock(L); }, 1000);
  const close = () => { clearInterval(tick); d.remove(); lockScroll(); document.removeEventListener('keydown', key);
    if (L.form !== form0 || dirty) render();   /* la tarjeta Formación de debajo enseña la nueva */
    else if (back && back.focus) back.focus({ preventScroll: true }); };
  const key = ev => { if (ev.key === 'Escape' && !document.querySelector('.modal')) close(); };
  const place = (i, id) => { const arr = slots(), cur = arr[i]; delete L.pz.plan[i];
    if (id === null) arr[i] = null; else { const was = arr.indexOf(id); if (was >= 0) { arr[was] = cur; delete L.pz.plan[was]; } arr[i] = id; }   /* si ya estaba en otro hueco, se cambian */
    L.pz.ids = arr; save(); };
  const draw = () => {
    const ids = slots(), free = avail().filter(id => !ids.includes(id)).sort(byDor), bn = bench(), pp = plans();
    if (sel != null && !free.includes(sel) && !ids.includes(sel)) sel = null;
    d.innerHTML = `<div class="pz-in">
      ${gameCard(e, p, false).replace(/ data-match="[^"]*" role="button" tabindex="0" aria-label="[^"]*"/, '').replace('class="gm"', 'class="gm pz-gm"')
        .replace('</small></div>', `</small><button type="button" class="iconbtn" id="pz-x" aria-label="Cerrar la pizarra">${ic('x')}</button></div>`)}
      <div class="pz-body">${formsOf(team).length ? `<div class="dd pz-fm"><button type="button" class="dd-b" id="pz-fmb" aria-haspopup="listbox" aria-expanded="false" aria-label="Formación: ${esc(form)}. Toca para cambiarla">${esc(form)}</button>
          <ul class="dd-l" id="pz-fml" role="listbox" aria-label="Formación (fútbol ${modOf(team)})" hidden>${formsOf(team).map(x =>
            `<li><button type="button" role="option" data-fm="${x}" aria-selected="${x === form}">${x}${x === form ? ic('check') : ''}</button></li>`).join('')}</ul></div>` : ''}
      <div class="pz-field${n > 8 ? ' f11' : ''}" role="group" aria-label="Campo">
        <i class="pz-mid"></i><i class="pz-circle"></i><i class="pz-area top"></i><i class="pz-area bot"></i>
        ${spots.map((sp, i) => { const id = ids[i], pin = pp[i], q = pin != null ? pl(pin) : id != null ? pl(id) : null;
          return `<button type="button" class="pz-s${i ? '' : ' gk'}${q ? '' : ' hole'}${pin != null ? ' plan' : ''}${sel != null ? ' wait' : ''}" data-pz="${i}" style="left:${sp.x}%;top:${sp.y}%" aria-label="${i ? 'Hueco ' + i : 'Portero'}: ${pin != null ? `cambio previsto, entraría ${esc(q.n)} por ${esc(pl(id).n)}` : q ? esc(q.n) : 'vacío'}">
            ${q ? face(q) : `<span class="pz-f add">${ic('plus')}</span>`}<b>${pin != null ? ic('swap') : ''}${q ? dorTxt(q) + pn(q.n) : i ? 'Libre' : 'Portero'}</b></button>`; }).join('')}
      </div>
      <div class="pz-side">
        <h3>${L.fase === 'previa' ? 'Titulares por colocar' : 'En el campo, por colocar'} · ${free.length}</h3>
        ${free.length ? `<div class="pz-free">${free.map(id => `<button type="button" class="pz-chip${sel === id ? ' on' : ''}" data-pzp="${id}" aria-pressed="${sel === id}">${face(pl(id))}<b>${dorTxt(pl(id))}${pn(pl(id).n)}</b></button>`).join('')}</div>`
          : `<p class="muted" style="margin:0">${avail().length ? 'Todos colocados. Toca a uno del campo para cambiarlo o quitarlo.' : L.fase === 'previa' ? 'Primero elige a los titulares.' : 'No hay nadie en el campo.'}</p>`}
        <h3>Banquillo · ${bn.length}</h3>
        ${bn.length ? `<div class="pz-free">${bn.map(id => `<span class="pz-chip off">${face(pl(id))}<b>${dorTxt(pl(id))}${pn(pl(id).n)}</b></span>`).join('')}</div>` : '<p class="muted" style="margin:0">No hay nadie en el banquillo.</p>'}
        <div class="pz-btns"><button type="button" class="btn blue block" id="pz-wa"${ids.some(x => x != null) ? '' : ' disabled'}>${ic('send')} Enviar por WhatsApp</button>
        ${ids.some(x => x != null) ? `<button type="button" class="btn ghost block" id="pz-clr">${ic('undo')} Vaciar la pizarra</button>` : ''}</div></div></div></div>`;
    d.querySelector('#pz-x').onclick = close;
    /* Con el partido empezado, en la tarjeta va el resultado y el cronómetro en vez de la hora */
    const mid = d.querySelector('.pz-gm .gm-s > :nth-child(2)');
    if (mid && L.fase !== 'previa') { const [a, b] = L.casa ? [L.nos, L.ellos] : [L.ellos, L.nos];
      mid.outerHTML = `<span class="pz-live"><span class="gtime" aria-label="Resultado ${a} a ${b}">${a}–${b}</span><small id="pz-clock" role="timer">${pzClock()}</small></span>`; }
    /* Cambiar la formación: los jugadores siguen en el mismo orden y pasan a las posiciones nuevas */
    /* Desplegable de formación: se abre al tocarlo y se cierra al elegir, al tocar fuera o con Escape */
    const fb = d.querySelector('#pz-fmb'), fl = d.querySelector('#pz-fml');
    if (fb) {
      const shut = () => { fl.hidden = true; fb.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', out, true); };
      const out = ev => { if (!ev.target.closest('.dd')) shut(); };
      fb.onclick = () => { if (!fl.hidden) return shut();
        fl.hidden = false; fb.setAttribute('aria-expanded', 'true'); document.addEventListener('pointerdown', out, true);
        (fl.querySelector('[aria-selected="true"]') || fl.querySelector('button')).focus({ preventScroll: true }); };
      fl.onkeydown = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); shut(); fb.focus(); } };
      fl.querySelectorAll('[data-fm]').forEach(b => b.onclick = () => { shut();
        if (b.dataset.fm !== form) { form = L.form = b.dataset.fm; spots = pzSpots(form); n = spots.length; save(); draw(); }
        const again = d.querySelector('#pz-fmb'); if (again) again.focus({ preventScroll: true }); });
    }
    if (d.querySelector('#pz-clr')) d.querySelector('#pz-clr').onclick = () => { L.pz.ids = []; sel = null; save(); draw(); };
    d.querySelector('#pz-wa').onclick = () => shareImage({ title: 'Alineación', wait: 'Preparando la imagen…', build: () => pzPoster(team, L, players, e, p, plans()),
      name: fileName('alineacion', team, p.fecha), alt: `Alineación del ${team} contra ${them}`, msg: '', what: 'la imagen' });
    d.querySelectorAll('[data-pzp]').forEach(b => b.onclick = () => { const id = +b.dataset.pzp; sel = sel === id ? null : id; draw();
      const again = d.querySelector(`[data-pzp="${id}"]`); if (again) again.focus({ preventScroll: true }); });
    d.querySelectorAll('[data-pz]').forEach(b => b.onclick = async () => {
      const i = +b.dataset.pz, cur = ids[i];
      if (sel != null) { place(i, sel); sel = null; }
      else if (live && cur != null) {
        /* Directo: probar un cambio sin apuntarlo, o apuntarlo ya como sustitución */
        const pin = pp[i];
        if (pin != null) {
          const c = await choose(`Cambio previsto: entra ${pl(pin).n}`, `Sale ${pl(cur).n}`, [['now', 'Hacer el cambio ahora', 'check', 'blue'], ['drop', 'Quitar el cambio previsto', 'x', 'ghost']]);
          if (!c) return;
          if (c === 'now') { onSub(cur, pin); dirty = true; } delete L.pz.plan[i]; save();
        } else {
          const c = await choose(pl(cur).n, i ? 'En el campo' : 'Portero', [['try', 'Probar un cambio', 'swap', 'blue'], ['move', 'Cambiar de sitio o quitar de la pizarra', 'pen', 'ghost']]);
          if (!c) return;
          if (c === 'move') { const id = await pickSlot(i ? 'Elige al jugador de este hueco' : 'Elige al portero', true, free, players); if (id === undefined) return; place(i, id); }
          else {
            const taken = Object.values(pp), inn = await pickPlayer('¿Quién entraría?', `Sale ${pl(cur).n}`, bn.filter(x => !taken.includes(x)), players);
            if (inn == null) return;
            const c2 = await choose('¿Lo guardas como sustitución?', `Entra ${pl(inn).n} y sale ${pl(cur).n}`, [['save', 'Sí, hacer el cambio ahora', 'check', 'blue'], ['plan', 'No, solo probarlo en la pizarra', 'pen', 'ghost']]);
            if (!c2) return;
            if (c2 === 'save') { onSub(cur, inn); dirty = true; delete L.pz.plan[i]; } else L.pz.plan[i] = inn;
            save();
          }
        }
      }
      else { const id = await pickSlot(i ? 'Elige al jugador de este hueco' : 'Elige al portero', cur != null, free, players);   /* solo los que aún no están en el campo */
        if (id === undefined) return; place(i, id); }
      draw(); const again = d.querySelector(`[data-pz="${i}"]`); if (again) again.focus({ preventScroll: true });
    });
  };
  document.addEventListener('keydown', key);
  document.body.append(d); lockScroll(); draw(); d.querySelector('#pz-x').focus({ preventScroll: true });
}
/* Imagen de la alineación para mandar por WhatsApp: escudos y partido arriba, el campo con cada jugador y el banquillo abajo */
async function pzPoster(team, L, players, e, p, plan = {}) {
  await Promise.all(['800 60px Outfit', '700 40px Outfit', '500 30px Outfit'].map(f => document.fonts.load(f).catch(() => {})));
  const form = L.form || formsOf(team)[0] || '', spots = pzSpots(form);
  const pl = id => players.find(x => x.id === id) || { id, n: 'Jugador', dorsal: null };
  const ok = (L.fase === 'previa' ? L.tit : L.campo).filter(id => !(L.rojas || []).includes(id));
  const ids = spots.map((_, i) => ok.includes((L.pz || { ids: [] }).ids[i]) ? L.pz.ids[i] : null);
  const bench = (L.fase === 'previa' ? L.sup : [...new Set([...L.tit, ...L.sup])].filter(id => !L.campo.includes(id))).filter(id => !ids.includes(id))
    .sort((a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99));
  const W = 1080, PAD = 48, HEAD = 380, FMH = form ? 84 + 24 : 0, FW = W - PAD * 2, FH = Math.round(FW * 90 / 68), BENCH = bench.length ? 70 + Math.ceil(bench.length / 3) * 100 : 0;
  const H = PAD + HEAD + 24 + FMH + FH + (BENCH ? 24 + BENCH : 0) + PAD;
  const cv = document.createElement('canvas'), x = cv.getContext('2d'); cv.width = W; cv.height = H;
  const BLUE = '#0034DF', GOLD = '#FDCB2B', GRASS = '#E9F6EE', INK = '#0B0B0B', MUTED = '#5B6582', SOFT = '#E6EBFD';   /* campo claro como el dibujo de la formación */
  const font = (w, px) => `${w} ${px}px Outfit, system-ui, sans-serif`;
  const text = (t, tx, y, w, px, color, maxW, align = 'left', fit) => { x.font = font(w, px);
    if (fit) while (px > fit && x.measureText(t).width > maxW) x.font = font(w, --px);
    if (x.measureText(t).width > maxW) { while (t.length > 1 && x.measureText(t + '…').width > maxW) t = t.slice(0, -1); t += '…'; }
    x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(t, tx, y); return x.measureText(t).width; };
  const path = (rx, ry, rw, rh, rad) => { rad = Math.min(rad, rh / 2, rw / 2); x.beginPath(); x.moveTo(rx + rad, ry); x.arcTo(rx + rw, ry, rx + rw, ry + rh, rad); x.arcTo(rx + rw, ry + rh, rx, ry + rh, rad); x.arcTo(rx, ry + rh, rx, ry, rad); x.arcTo(rx, ry, rx + rw, ry, rad); x.closePath(); };
  const rr = (rx, ry, rw, rh, rad, c) => { path(rx, ry, rw, rh, rad); x.fillStyle = c; x.fill(); };
  const crest = await loadImg(crestBig()), rival = crestOf(e, p.rival) ? await loadImg(crestOf(e, p.rival)) : null;
  const photos = {}; await Promise.all([...ids, ...bench, ...Object.values(plan)].filter(id => id != null && pl(id).foto).map(async id => { photos[id] = await loadImg(pl(id).foto); }));
  const logo = (img, cx, cy, sz, name) => { if (img) { const k = Math.min(sz / img.width, sz / img.height); x.drawImage(img, cx - img.width * k / 2, cy - img.height * k / 2, img.width * k, img.height * k); }
    else { x.beginPath(); x.arc(cx, cy, sz / 2, 0, Math.PI * 2); x.fillStyle = INK; x.fill(); text(initials(nice(name).replace(/^[A-Z.]+\s/, '').replace(/"/g, '')), cx, cy + 2, 800, 36, '#FFFFFF', sz, 'center'); } };
  /* Cara del jugador: foto, si no dorsal, si no el icono de persona */
  const face = (id, cx, cy, r, bg = BLUE, fg = '#FFFFFF') => { const q = pl(id);
    x.beginPath(); x.arc(cx, cy, r + 4, 0, Math.PI * 2); x.fillStyle = '#FFFFFF'; x.fill();
    if (photos[id]) { x.save(); x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.clip(); const im = photos[id], k = Math.max(2 * r / im.width, 2 * r / im.height);
      x.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k); x.restore(); return; }
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fillStyle = bg; x.fill();
    if (q.dorsal) text(String(q.dorsal), cx, cy + 2, 800, r * 0.95, fg, 2 * r, 'center');
    else { x.strokeStyle = fg; x.lineWidth = r * 0.14; x.beginPath(); x.arc(cx, cy - r * 0.22, r * 0.3, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.arc(cx, cy + r * 0.72, r * 0.58, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); } };
  x.fillStyle = '#F3F5F9'; x.fillRect(0, 0, W, H);
  /* Cabecera: la misma tarjeta del partido que se ve en la pantalla */
  rr(PAD, PAD, FW, HEAD, 48, '#FFFFFF');   /* sin sombra en la imagen */
  x.font = font(700, 30); const pw = Math.min(x.measureText(team).width, 420) + 48;
  rr(PAD + 36, PAD + 32, pw, 60, 30, SOFT); text(team, PAD + 60, PAD + 63, 700, 30, BLUE, 420);
  const res = p.goles ? outcome(p) : null;
  text(`${dateLbl(p.fecha)}${p.hora && res ? ' · ' + p.hora : ''} · J${p.j}`, PAD + FW - 36, PAD + 63, 500, 28, MUTED, FW - pw - 120, 'right');
  const [lImg, rImg, lName, rName] = L.casa ? [crest, rival, 'Aznalcóllar', nice(p.rival)] : [rival, crest, nice(p.rival), 'Aznalcóllar'];
  const lx = PAD + FW * 0.2, rx2 = PAD + FW * 0.8, cy0 = PAD + 178;
  logo(lImg, lx, cy0, 120, lName); logo(rImg, rx2, cy0, 120, rName);
  text(lName, lx, cy0 + 96, 700, 32, INK, 330, 'center'); text(rName, rx2, cy0 + 96, 700, 32, INK, 330, 'center');
  if (L.fase && L.fase !== 'previa') {   /* en directo: el resultado de ahora y el cronómetro, como en la pantalla */
    const [a, b] = L.casa ? [L.nos, L.ellos] : [L.ellos, L.nos];
    text(`${a}–${b}`, W / 2, cy0 - 10, 800, 76, INK, 260, 'center');
    text(L.fase === 'juego' ? lvClock(L) : L.fase === 'pausa' ? `${lvClock(L)} · Descanso` : 'Final', W / 2, cy0 + 50, 800, 30, BLUE, 260, 'center'); }
  else if (res) { const sc = scoreTxt(p); x.font = font(800, 46); const sw = x.measureText(sc).width + 52;
    rr(W / 2 - sw / 2, cy0 - 38, sw, 76, 20, res === 'G' ? '#12A15A' : res === 'P' ? '#E23B4E' : '#8A93A8'); text(sc, W / 2, cy0 + 2, 800, 46, '#FFFFFF', sw, 'center'); }
  else if (p.hora) text(p.hora, W / 2, cy0 + 4, 800, 76, INK, 260, 'center');
  else text('Hora por confirmar', W / 2, cy0 + 4, 700, 28, MUTED, 220, 'center');
  text(`${L.casa ? 'Local' : 'Visitante'}${placeOf(p) ? ' · ' + placeOf(p) : ''}`, W / 2, PAD + HEAD - 40, 500, 28, MUTED, FW - 72, 'center');
  /* La formación, en una barra blanca sin sombra */
  if (form) { rr(PAD, PAD + HEAD + 24, FW, 84, 28, BLUE); text(`Formación: ${form}`, PAD + 36, PAD + HEAD + 24 + 44, 700, 34, '#FFFFFF', FW - 72); }
  /* Campo */
  const fx = PAD, fy = PAD + HEAD + 24 + FMH;
  rr(fx, fy, FW, FH, 28, GRASS); path(fx, fy, FW, FH, 28); x.strokeStyle = '#A9D5B7'; x.lineWidth = 6; x.stroke();
  x.strokeStyle = '#BFC6D4'; x.lineWidth = 4;
  x.beginPath(); x.moveTo(fx, fy + FH / 2); x.lineTo(fx + FW, fy + FH / 2); x.stroke();
  x.beginPath(); x.arc(fx + FW / 2, fy + FH / 2, FW * 0.11, 0, Math.PI * 2); x.stroke();
  x.strokeRect(fx + FW * 0.25, fy, FW * 0.5, FH * 0.13); x.strokeRect(fx + FW * 0.25, fy + FH * 0.87, FW * 0.5, FH * 0.13);
  const R = spots.length > 8 ? 54 : 70, PW = spots.length > 8 ? 150 : 220;   /* bolas grandes; en fútbol 11 algo menos para que quepan */
  spots.forEach((sp, i) => { const cx = fx + FW * sp.x / 100, cy = fy + FH * sp.y / 100, id = ids[i];
    if (id == null) { x.setLineDash([10, 8]); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.strokeStyle = '#8E97A8'; x.lineWidth = 4; x.stroke(); x.setLineDash([]); return; }
    /* Un cambio previsto (solo probado en la pizarra) sale en dorado con el que entraría */
    const pin = plan[i], who = pin != null ? pin : id, col = pin != null ? GOLD : i ? BLUE : INK, ink = pin != null ? INK : '#FFFFFF';
    if (pin != null) { x.setLineDash([12, 8]); x.beginPath(); x.arc(cx, cy, R + 12, 0, Math.PI * 2); x.strokeStyle = GOLD; x.lineWidth = 5; x.stroke(); x.setLineDash([]); }
    face(who, cx, cy, R, col, ink);
    x.font = font(700, 28); let nm = dorTxt(pl(who)) + pl(who).n; if (x.measureText(nm).width > PW) nm = dorTxt(pl(who)) + shortName(pl(who).n); const tw = Math.min(x.measureText(nm).width, PW) + 28;
    rr(cx - tw / 2, cy + R + 12, tw, 42, 21, col); text(nm, cx, cy + R + 34, 700, 28, ink, PW, 'center'); });
  /* Banquillo */
  if (BENCH) { const by = fy + FH + 24; text(`Banquillo · ${bench.length}`, PAD, by + 26, 800, 32, INK, FW);
    /* fichas tan altas como la barra de la formación */
    const cw = FW / 3; bench.forEach((id, k) => { const cx = PAD + (k % 3) * cw, cy = by + 70 + Math.floor(k / 3) * 100 + 42;
      rr(cx, cy - 42, cw - 12, 84, 42, '#FFFFFF'); face(id, cx + 44, cy, 30); x.font = font(700, 28);
      text(dorTxt(pl(id)) + (x.measureText(dorTxt(pl(id)) + pl(id).n).width > cw - 110 ? shortName(pl(id).n) : pl(id).n), cx + 86, cy + 1, 700, 28, INK, cw - 110); }); }
  return new Promise(ok2 => cv.toBlob(b => ok2(b), 'image/png'));
}
/* Ventana con varias opciones en botones: devuelve el valor elegido, o undefined si se cierra */
function choose(title, sub, opts) {
  return new Promise(done => {
    let pick;
    const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${esc(title)}</h2>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
        <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
      <div class="stack">${opts.map(([v, label, icon, cls]) => `<button type="button" class="btn ${cls || 'ghost'} block" data-ch="${v}">${ic(icon)} ${esc(label)}</button>`).join('')}</div>`, 'dialog', () => done(pick));
    m.el.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { pick = b.dataset.ch; m.close(false); });
    m.el.querySelector('[data-ch]').focus();
  });
}
/* Elegir jugador para un hueco de la pizarra: devuelve su id, null para dejar el hueco vacío, o undefined si se cierra */
function pickSlot(title, filled, ids, players) {
  return new Promise(done => {
    let pick;
    const pl = id => players.find(x => x.id === id) || { n: 'Jugador', dorsal: null };
    const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${esc(title)}</h2></div>
        <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
      ${ids.length ? `<div class="lv-pick">${ids.map(id => `<button type="button" class="lv-pk" data-pk="${id}">${pnum(pl(id), 'num', '–')}<b title="${esc(pl(id).n)}">${pn(pl(id).n)}</b></button>`).join('')}</div>`
        : `<p class="muted" style="margin:0">${filled ? 'Todos los jugadores ya están en el campo.' : 'No hay ningún jugador para elegir.'}</p>`}
      ${filled ? `<button type="button" class="btn ghost block" data-pk="">${ic('minus')} Dejar el hueco vacío</button>` : ''}`, 'dialog', () => done(pick));
    m.el.classList.add('rqd');
    m.el.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { pick = b.dataset.pk === '' ? null : +b.dataset.pk; m.close(false); });
    (m.el.querySelector('[data-pk]') || m.el.querySelector('[data-v]')).focus();
  });
}
function pickPlayer(title, sub, ids, players) {
  return new Promise(done => {
    let pick = null;
    const pl = id => players.find(x => x.id === id) || { n: 'Jugador', dorsal: null };
    const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${esc(title)}</h2>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
        <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
      ${ids.length ? `<div class="lv-pick">${ids.map(id => `<button type="button" class="lv-pk" data-pk="${id}">${pnum(pl(id), 'num', '–')}<b title="${esc(pl(id).n)}">${pn(pl(id).n)}</b></button>`).join('')}</div>`
        : '<p class="muted" style="margin:0">No hay ningún jugador para elegir.</p>'}`, 'dialog', () => done(pick));
    m.el.classList.add('rqd');
    m.el.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { pick = +b.dataset.pk; m.close(false); });
    (m.el.querySelector('[data-pk]') || m.el.querySelector('[data-v]')).focus();
  });
}
function confirmar(title, text, label) {
  return new Promise(done => {
    const m = modal(`<h2 id="mdl-t">${esc(title)}</h2><p>${esc(text)}</p>
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Cancelar</button><button type="button" class="btn blue" data-v="1">${ic('check')} ${esc(label)}</button></div>`, 'alertdialog', done);
    m.el.querySelector('[data-v="1"]').focus();
  });
}
/* Cómo fue un gol (a favor o en contra), para ver después qué hay que corregir. Todo es opcional */
const COMO = [['tipo', 'Jugada', ['Jugada combinada', 'Jugada individual', 'Contraataque', 'Córner', 'Falta directa', 'Falta lateral', 'Penalti', 'Saque de banda', 'Pérdida de balón', 'Rebote', 'En propia puerta']],
  ['remate', 'Remate', ['Pierna derecha', 'Pierna izquierda', 'Cabeza']], ['zona', 'Desde', ['Dentro del área', 'Fuera del área']]];
const comoTxt = c => c ? COMO.map(([k]) => c[k]).filter(Boolean).join(' · ').toLowerCase().replace(/^./, x => x.toUpperCase()) : '';
function askComo(title, sub, prev) {
  return new Promise(done => {
    const c = { ...(prev || {}) };
    const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${esc(title)}</h2><small>${esc(sub)}</small></div>
        <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
      <p class="muted" style="margin:0">Elige lo que sepas. Sirve para ver después qué hay que trabajar.</p>
      ${COMO.map(([k, l, ops]) => `<div class="como-g" role="group" aria-label="${l}"><b>${l}</b><div class="como-ch">${ops.map(o => `<button type="button" class="chip" data-ck="${k}" data-cv="${esc(o)}" aria-pressed="${c[k] === o}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Saltar</button><button type="button" class="btn blue" id="como-ok">${ic('check')} Guardar</button></div>`, 'dialog', v => done(v === 'ok' ? c : null));
    m.el.classList.add('rqd');
    m.el.querySelectorAll('[data-ck]').forEach(b => b.onclick = () => {
      const k = b.dataset.ck, v = b.dataset.cv; c[k] = c[k] === v ? undefined : v;
      m.el.querySelectorAll(`[data-ck="${k}"]`).forEach(x => x.setAttribute('aria-pressed', x.dataset.cv === c[k]));
    });
    m.el.querySelector('#como-ok').onclick = () => { m.close('ok'); };
    m.el.querySelector('#como-ok').focus();
  });
}
/* Lo que ha pasado, del último al primero */
const LV_EDIT = ['gol', 'golr', 'ama', 'roja', 'cambio'];
const lvTxt = (L, nm, x) => x.t === 'ini' ? `Empieza la ${parteLbl(x.parte)}` : x.t === 'fin' ? (x.parte < L.partes ? `Final de la ${parteLbl(x.parte)}` : 'Final del partido')
  : x.t === 'gol' ? `Gol de ${nm(x.id)}` : x.t === 'golr' ? `Gol del ${L.rival}` : x.t === 'ama' ? `Tarjeta amarilla a ${nm(x.id)}`
  : x.t === 'roja' ? `Tarjeta roja a ${nm(x.id)}${x.doble ? ' (segunda amarilla)' : ''}` : `Entra ${nm(x.in)} y sale ${nm(x.out)}`;
const lvIcon = x => x.t === 'gol' || x.t === 'golr' ? 'ball' : x.t === 'ama' || x.t === 'roja' ? 'card' : x.t === 'cambio' ? 'swap' : 'whistle';
function lvTimeline(L, nm, edit) {
  const txt = x => lvTxt(L, nm, x), icon = lvIcon;
  if (!L.ev.length) return '<p class="muted" style="margin:0">Todavía no ha pasado nada.</p>';
  const row = x => `<span class="lv-mn">${x.min}'</span><span class="lv-ic" aria-hidden="true">${ic(icon(x))}</span><span class="grow">${esc(txt(x))}${comoTxt(x.como) ? `<small class="lv-como">${esc(comoTxt(x.como))}</small>` : ''}</span>`;
  return `${edit ? '<p class="muted lv-hint">Toca un apunte para corregirlo o borrarlo.</p>' : ''}<ol class="lv-tl">${L.ev.map((x, i) => [x, i]).reverse().map(([x, i]) => `<li class="lv-x ${x.t}">${edit && LV_EDIT.includes(x.t)
    ? `<button type="button" class="lv-xb" data-evi="${i}" aria-label="Corregir: ${esc(txt(x))}, minuto ${x.min}">${row(x)}<span class="lv-pen" aria-hidden="true">${ic('pen')}</span></button>` : row(x)}</li>`).join('')}</ol>`;
}
/* Deshacer del directo: elegir qué apunte borrar. Devuelve el índice en L.ev, o undefined si se cierra.
   El último pitido (empezar o terminar una parte) sólo se puede quitar si es lo último que se hizo */
function lvUndoOpts(L) {
  const o = L.ev.map((x, i) => [x, i]).filter(([x]) => LV_EDIT.includes(x.t)).map(([, i]) => i);
  const k = L.ev.length - 1, last = L.ev[k], top = L.hist && L.hist[L.hist.length - 1];
  if (last && !LV_EDIT.includes(last.t) && top) {
    try { if (JSON.stringify(JSON.parse(top).ev) === JSON.stringify(L.ev.slice(0, k))) o.push(k); } catch (_) {}
  }
  return o.sort((a, b) => b - a);
}
function lvUndoPick(L, nm) {
  return new Promise(done => {
    let pick;
    const row = i => { const x = L.ev[i]; return `<li class="lv-x ${x.t}"><button type="button" class="lv-xb" data-ui="${i}" aria-label="Borrar: ${esc(lvTxt(L, nm, x))}, minuto ${x.min}"><span class="lv-mn">${x.min}'</span><span class="lv-ic" aria-hidden="true">${ic(lvIcon(x))}</span><span class="grow">${esc(lvTxt(L, nm, x))}</span><span class="lv-pen" aria-hidden="true">${ic('trash')}</span></button></li>`; };
    const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">Deshacer</h2><small>¿Qué quieres borrar?</small></div>
        <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
      <ol class="lv-tl">${lvUndoOpts(L).map(row).join('')}</ol>`, 'dialog', () => done(pick));
    m.el.classList.add('rqd');
    m.el.querySelectorAll('[data-ui]').forEach(b => b.onclick = () => { pick = +b.dataset.ui; m.close(false); });
    m.el.querySelector('[data-ui]').focus();
  });
}
/* Rehace el estado (campo, minutos, marcador, expulsados) a partir de los apuntes, después de corregir alguno.
   Cada apunte guarda su segundo de partido (s) y su parte (p); los del descanso llevan b. Devuelve false si algo no cuadra */
const lvRank = x => x.t === 'ini' ? 0 : x.b ? 3 : x.t === 'fin' ? 2 : 1;
function lvRebuild(L) {
  L.ev.forEach((x, i) => { x._i = i; if (x.p == null) x.p = x.parte || 1; if (x.s == null) x.s = Math.max(0, (parseInt(x.min, 10) || 0) * 60 - 30); });
  L.ev.sort((a, b) => a.p - b.p || lvRank(a) - lvRank(b) || a.s - b.s || a._i - b._i);
  L.ev.forEach(x => delete x._i);
  let campo = [...L.tit], on = false, ok = true;
  const seg = {}, desde = {}, rojas = [];
  const out = (id, s) => { if (on) seg[id] = (seg[id] || 0) + s - (desde[id] || 0); };
  let nos = 0, ellos = 0;
  for (const x of L.ev) {
    if (x.t === 'ini') { on = true; campo.forEach(id => { desde[id] = x.s; }); }
    else if (x.t === 'fin') { campo.forEach(id => out(id, x.s)); on = false; }
    else if (x.t === 'gol') nos++;
    else if (x.t === 'golr') ellos++;
    else if (x.t === 'cambio') {
      if (!campo.includes(x.out) || campo.includes(x.in) || rojas.includes(x.in)) { ok = false; continue; }
      out(x.out, x.s); desde[x.in] = x.s; campo = campo.map(id => id === x.out ? x.in : id);
    } else if (x.t === 'roja' && !rojas.includes(x.id)) {
      if (campo.includes(x.id)) { out(x.id, x.s); campo = campo.filter(id => id !== x.id); }
      rojas.push(x.id);
    }
  }
  Object.assign(L, { campo, seg, desde, rojas, nos, ellos });
  return ok;
}
/* Ventana para corregir o borrar un apunte del directo */
function lvEdit(team, f, L, i, players, after) {
  const x = L.ev[i], pl = id => players.find(y => y.id === id) || { n: 'Jugador', dorsal: null };
  const ids = [...new Set([...L.tit, ...L.sup])].sort((a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99));
  const opts = sel => ids.map(id => `<option value="${id}" ${id === sel ? 'selected' : ''}>${pl(id).dorsal ? pl(id).dorsal + ' · ' : ''}${esc(pl(id).n)}</option>`).join('');
  const lo = (x.p - 1) * L.min + 1, hi = x.p * L.min + 15;
  const num = String(x.min).split('+').reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
  const name = { gol: 'Gol nuestro', golr: 'Gol del rival', ama: 'Tarjeta amarilla', roja: 'Tarjeta roja', cambio: 'Cambio' }[x.t];
  const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${name}</h2><small>Corregir · ${x.b ? 'en el descanso' : parteLbl(x.p)}</small></div>
      <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
    <form id="lvef" class="stack" novalidate>
      ${x.b ? '' : `<label class="f" for="lve-m">Minuto<input type="number" id="lve-m" inputmode="numeric" min="${lo}" max="${hi}" value="${num}"></label>`}
      ${x.t === 'cambio' ? `<label class="f" for="lve-o">Sale<select id="lve-o">${opts(x.out)}</select></label><label class="f" for="lve-i">Entra<select id="lve-i">${opts(x.in)}</select></label>`
        : x.t === 'golr' ? '' : `<label class="f" for="lve-p">Jugador<select id="lve-p">${opts(x.id)}</select></label>`}
      ${x.t === 'gol' || x.t === 'golr' ? `<button type="button" class="btn outline block" id="lvecomo">${ic('pen')} ${comoTxt(x.como) ? 'Cambiar cómo fue el gol' : 'Apuntar cómo fue el gol'}</button>` : ''}
      <p id="lveerr" class="err" role="alert" hidden></p>
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Cancelar</button><button type="submit" class="btn blue">${ic('check')} Guardar</button></div>
    </form>
    <button type="button" class="btn red block" id="lvedel">${ic('trash')} Borrar este apunte</button>`, 'dialog', () => {});
  m.el.classList.add('rqd');
  const err = t => { m.el.querySelector('#lveerr').textContent = t; m.el.querySelector('#lveerr').hidden = false; };
  /* Aplica el cambio; si deja el partido sin cuadrar (p. ej. sale alguien que no estaba en el campo), se deshace */
  const apply = (fn, msg) => {
    const prev = JSON.stringify(lvStrip(L)); lvSnap(L); fn();
    if (!lvRebuild(L)) { const h = L.hist; h.pop(); Object.keys(L).forEach(k => delete L[k]); Object.assign(L, JSON.parse(prev), { hist: h }); return err('Así no cuadra con los demás cambios del partido. Revisa quién estaba en el campo en ese momento.'); }
    m.close(false); after(msg);
  };
  m.el.querySelector('#lvef').onsubmit = ev => {
    ev.preventDefault();
    let mm = null;
    if (!x.b) { mm = +m.el.querySelector('#lve-m').value; if (!(mm >= lo && mm <= hi)) return err(`En la ${parteLbl(x.p)} el minuto va del ${lo} al ${x.p * L.min} (o un poco más si hubo añadido).`); }
    const o = x.t === 'cambio' ? +m.el.querySelector('#lve-o').value : null, n = x.t === 'cambio' ? +m.el.querySelector('#lve-i').value : null;
    if (x.t === 'cambio' && o === n) return err('El que sale y el que entra tienen que ser distintos.');
    apply(() => {
      if (mm != null) {
        const ini = L.ev.find(y => y.t === 'ini' && y.p === x.p), fin = L.ev.find(y => y.t === 'fin' && y.p === x.p);
        const a = ini ? ini.s : (x.p - 1) * L.min * 60, z = fin ? fin.s : L.fase === 'juego' && L.parte === x.p ? lvCap(L) : a + L.min * 60;
        x.s = Math.min(z, Math.max(a, a + (mm - lo) * 60 + 30));
        x.min = mm > x.p * L.min ? `${x.p * L.min}+${mm - x.p * L.min}` : String(mm);
      }
      if (x.t === 'cambio') { x.out = o; x.in = n; } else if (x.t !== 'golr') x.id = +m.el.querySelector('#lve-p').value;
    }, 'Apunte corregido');
  };
  const cb = m.el.querySelector('#lvecomo');
  if (cb) cb.onclick = async () => { m.close(false); const c = await askComo(name, `Minuto ${x.min}`, x.como); if (c) { lvSnap(L); x.como = c; after('Guardado cómo fue el gol'); } };
  m.el.querySelector('#lvedel').onclick = async () => {
    m.close(false);
    if (!(await ask('¿Borrar este apunte?', `Se quitará “${name}” del minuto ${x.min}.`, 'Sí, borrar'))) return;
    const prev = JSON.stringify(lvStrip(L)); lvSnap(L); L.ev.splice(L.ev.indexOf(x), 1);
    if (!lvRebuild(L)) { const h = L.hist; h.pop(); Object.keys(L).forEach(k => delete L[k]); Object.assign(L, JSON.parse(prev), { hist: h }); return say('No se puede borrar: los cambios de después dependen de él. Borra antes esos cambios.'); }
    after('Apunte borrado');
  };
  (m.el.querySelector('#lve-m') || m.el.querySelector('select') || m.el.querySelector('[data-v]')).focus();
}
/* Añadir un apunte a un acta ya terminada (gol, gol del rival, cambio o tarjeta): el marcador, los minutos y las estadísticas se recalculan */
function lvAddGoal(team, f, L, t, players, after) {
  const pl = id => players.find(y => y.id === id) || { n: 'Jugador', dorsal: null };
  const ids = [...new Set([...L.tit, ...L.sup])].sort((a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99));
  const opts = sel => ids.map(id => `<option value="${id}"${id === sel ? ' selected' : ''}>${pl(id).dorsal ? pl(id).dorsal + ' · ' : ''}${esc(pl(id).n)}</option>`).join('');
  const full = L.partes * L.min, name = { gol: 'Gol nuestro', golr: 'Gol del rival', cambio: 'Cambio', tarjeta: 'Tarjeta' }[t];
  const sub = L.sup.slice().sort((a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99))[0];
  const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">${name}</h2><small>Añadir al acta</small></div>
      <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
    <form id="lvaf" class="stack" novalidate>
      <label class="f" for="lva-m">Minuto<input type="number" id="lva-m" inputmode="numeric" min="1" max="${full + 15}" placeholder="Del 1 al ${full}"></label>
      ${t === 'gol' ? `<label class="f" for="lva-p">¿Quién marcó?<select id="lva-p">${opts()}</select></label>` : ''}
      ${t === 'tarjeta' ? `<label class="f" for="lva-c">Tarjeta<select id="lva-c"><option value="ama">Amarilla</option><option value="roja">Roja</option></select></label><label class="f" for="lva-p">¿A quién?<select id="lva-p">${opts()}</select></label>` : ''}
      ${t === 'cambio' ? `<label class="f" for="lva-o">Sale<select id="lva-o">${opts(L.tit.slice().sort((a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99))[0])}</select></label><label class="f" for="lva-i">Entra<select id="lva-i">${opts(sub)}</select></label>` : ''}
      <p id="lvaerr" class="err" role="alert" hidden></p>
      <div class="btn-row"><button type="button" class="btn ghost" data-v="0">Cancelar</button><button type="submit" class="btn blue">${ic('check')} Añadir</button></div>
    </form>`, 'dialog', () => {});
  m.el.classList.add('rqd');
  const err = txt => { const e = m.el.querySelector('#lvaerr'); e.textContent = txt; e.hidden = false; };
  const val = sel => +m.el.querySelector(sel).value;
  m.el.querySelector('#lvaf').onsubmit = async ev => {
    ev.preventDefault();
    const mm = val('#lva-m');
    if (!(mm >= 1 && mm <= full + 15)) return err(`Escribe el minuto, del 1 al ${full}.`);
    const p = Math.min(L.partes, Math.ceil(mm / L.min)), lo = (p - 1) * L.min + 1;
    const ini = L.ev.find(y => y.t === 'ini' && y.p === p), fin = L.ev.find(y => y.t === 'fin' && y.p === p);
    const a = ini ? ini.s : (p - 1) * L.min * 60, z = fin ? fin.s : a + L.min * 60;
    const x = { t, p, s: Math.min(z, Math.max(a, a + (mm - lo + 1) * 60)), min: mm > p * L.min ? `${p * L.min}+${mm - p * L.min}` : String(mm) };
    if (t === 'gol') x.id = val('#lva-p');
    if (t === 'tarjeta') { x.t = m.el.querySelector('#lva-c').value; x.id = val('#lva-p'); }
    if (t === 'cambio') { x.out = val('#lva-o'); x.in = val('#lva-i'); if (x.out === x.in) return err('El que sale y el que entra tienen que ser distintos.'); }
    /* Si no cuadra con el resto (p. ej. sale alguien que no estaba en el campo), no se apunta */
    const prev = JSON.stringify(lvStrip(L));
    lvSnap(L); L.ev.push(x);
    if (!lvRebuild(L)) { const h = L.hist; h.pop(); Object.keys(L).forEach(k => delete L[k]); Object.assign(L, JSON.parse(prev), { hist: h }); return err('Así no cuadra: en ese minuto el que sale tiene que estar en el campo y el que entra, en el banquillo.'); }
    m.close(false);
    if (t === 'gol' || t === 'golr') { const c = await askComo(t === 'gol' ? `¿Cómo fue el gol de ${pl(x.id).n}?` : '¿Cómo nos marcaron?', `Minuto ${x.min}`); if (c) x.como = c; }
    after(t === 'gol' ? `Gol de ${pl(x.id).n} añadido. Marcador actualizado.` : t === 'golr' ? 'Gol del rival añadido. Marcador actualizado.'
      : t === 'cambio' ? `Cambio añadido: entra ${pl(x.in).n}. Minutos actualizados.` : `Tarjeta ${x.t === 'ama' ? 'amarilla' : 'roja'} a ${pl(x.id).n} añadida.`);
  };
  m.el.querySelector('#lva-m').focus();
}
/* Rellenar en diferido: el partido queda acabado con la duración completa, y luego se añaden goles, cambios y tarjetas */
function lvDiferido(L) {
  L.ev = L.ev.filter(x => x.t !== 'ini' && x.t !== 'fin');
  for (let p = 1; p <= L.partes; p++) {
    L.ev.push({ t: 'ini', parte: p, min: String((p - 1) * L.min), s: (p - 1) * L.min * 60, p });
    L.ev.push({ t: 'fin', parte: p, min: String(p * L.min), s: p * L.min * 60, p });
  }
  L.parte = L.partes; L.fase = 'fin'; L.ini = null; L.acc = L.partes * L.min * 60; L.diferido = true;
  lvRebuild(L);
}
/* Borrar el directo entero: vuelve a "sin empezar" y quita los minutos y goles que guardó de ese partido */
async function lvDelete(team, f) {
  if (!(await ask('¿Borrar el directo?', 'Se borra todo lo apuntado en este partido (titulares, goles, tarjetas, cambios y minutos) y queda como si no se hubiera empezado.', 'Sí, borrar'))) return;
  const ids = S.teams[team].players.filter(x => statOf(x.id, f)).map(x => x.id);
  try { if (API()) { if (!(S.live && S.directoOff)) await API().borrarDirecto(team, f); if (ids.length && statsOn()) await API().estadisticas(f, [], ids); } }
  catch (_) { return say('No se ha podido borrar. Revisa la conexión.'); }
  try { localStorage.removeItem(lvKey(team, f)); } catch (_) {}
  delete S.actas[`${team} ${f}`]; ids.forEach(id => { delete S.stats[id][f]; });
  S.lv = null; clearInterval(S.lvTick); render(); say('Directo borrado. El partido vuelve a estar sin empezar.');
}
/* Minutos y goles que pasan a las estadísticas al acabar */
function lvRows(L) {
  const ids = [...new Set([...L.tit, ...L.ev.filter(x => x.t === 'cambio').map(x => x.in)])];
  return ids.map(id => ({ id, m: Math.max(1, Math.round((L.seg[id] || 0) / 60)), g: lvGoals(L, id) }));
}
async function lvToStats(team, f, L) {
  const filas = lvRows(L), t = S.teams[team];
  const quitar = t.players.filter(x => statOf(x.id, f) && !filas.some(r => r.id === x.id)).map(x => x.id);
  if (API()) await API().estadisticas(f, filas, quitar);
  filas.forEach(r => { (S.stats[r.id] = S.stats[r.id] || {})[f] = { m: r.m, g: r.g }; });
  quitar.forEach(id => { delete S.stats[id][f]; });
}
function lvScreen(team, back) {
  const e = EQ[team], t = S.teams[team], p = e && e.partidos.find(x => x.fecha === S.lvDate && !x.descansa);
  if (!p) return { kicker: 'Directo', title: esc(team), back, body: emptyPage('cal', 'No encontramos ese partido', 'Vuelve atrás y elige otro partido.') };
  const k = `${team} ${p.fecha}`;
  if (!S.lv || S.lv.k !== k) S.lv = { k, L: lvLoad(team, p) };
  const L = S.lv.L, f = p.fecha;
  const pl = id => { const x = t.players.find(y => y.id === id); return x ? { ...x, dorsal: lvDor(L, x) } : { id, n: 'Jugador', dorsal: null }; };
  const nm = id => pl(id).n;
  const byDor = (a, b) => (pl(a).dorsal || 99) - (pl(b).dorsal || 99) || pl(a).n.localeCompare(pl(b).n, 'es');
  const save = () => lvSave(team, f, L);
  const us = 'Aznalcóllar', them = L.rival;
  const score = `<div class="lv-sc"><b title="${esc(L.casa ? us : them)}">${esc(L.casa ? us : them)}</b><span class="lv-g">${L.casa ? L.nos : L.ellos}<i>–</i>${L.casa ? L.ellos : L.nos}</span><b title="${esc(L.casa ? them : us)}">${esc(L.casa ? them : us)}</b></div>`;
  const tag = `${dateLbl(f)}${p.hora ? ' · ' + p.hora : ''} · ${L.casa ? 'Local' : 'Visitante'}${L.form ? ' · ' + L.form : ''}`;
  const kicker = `${L.fase === 'previa' ? 'Rellenar datos' : 'Directo'} · ${esc(team)}`, title = `vs ${esc(them)}`;

  /* --- Antes de empezar: hace falta la convocatoria, y de ella salen titulares y suplentes --- */
  /* Un partido ya jugado sin convocatoria se rellena con toda la plantilla */
  const cv = S.conv[convKey(team, p)] || (f < TODAY ? { ids: t.players.map(x => x.id), todos: true } : null);
  if (L.fase === 'previa' && !cv) {
    const canConv = S.role === 'coach' && p === nextMatch(e);
    return { kicker, title, back,
      body: emptyPage('list', 'Primero, la convocatoria', canConv ? 'Para rellenar los datos del partido hace falta su convocatoria. Hazla y vuelve aquí para elegir titulares y suplentes.'
        : 'Para rellenar los datos del partido hace falta su convocatoria. La hace el entrenador del equipo desde su app.', '',
        canConv ? `<button type="button" class="btn blue" id="lvconv">${ic('list')} Hacer la convocatoria</button>` : ''),
      bind() { if ($('#lvconv')) $('#lvconv').onclick = () => { S.team = team; S.convLv = { team, fecha: p.fecha, from: S.lvFrom }; go('team', 'conv'); }; } };
  }
  if (L.fase === 'previa') {
    /* Si la convocatoria ha cambiado, solo cuentan los convocados */
    L.tit = L.tit.filter(id => cv.ids.includes(id)); L.sup = [...new Set([...L.sup.filter(id => cv.ids.includes(id)), ...cv.ids.filter(id => !L.tit.includes(id) && !L.sup.includes(id))])];
    const tmax = modOf(team);
    /* Dos grupos: se toca a un jugador para ponerle el dorsal o pasarlo de uno a otro. El dorsal es obligatorio para seguir */
    const tile = (id, tit) => { const q = pl(id); return `<button type="button" class="lv-tile${q.dorsal ? '' : ' nod'}" data-lvp="${id}" aria-label="${esc(q.n)}, ${tit ? 'titular' : 'suplente'}, ${q.dorsal ? 'dorsal ' + q.dorsal : 'sin dorsal'}. Toca para poner el dorsal o pasarlo a ${tit ? 'suplente' : 'titular'}">
      ${pnum(q, 'num', '?')}<b title="${esc(q.n)}">${pn(q.n)}</b><small>${q.dorsal ? 'Dorsal ' + q.dorsal : 'Falta el dorsal'}</small></button>`; };
    const sinDor = () => [...L.tit, ...L.sup].filter(id => !pl(id).dorsal);
    const faltaDor = () => { const k = sinDor().length; return k ? `Falta el dorsal de ${k === 1 ? '1 jugador' : k + ' jugadores'}: tócalos para ponerlo.` : ''; };
    const dorsal = id => {
      const tit = L.tit.includes(id), q = pl(id);
      const taken = new Map([...L.tit, ...L.sup].filter(x => x !== id && pl(x).dorsal).map(x => [+pl(x).dorsal, x]));
      const m = modal(`<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2" title="${esc(q.n)}">${pn(q.n)}</h2><small>${tit ? 'Titular' : 'Suplente'}</small></div>
          <button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
        <h3 class="lv-dh">Dorsal en este partido</h3>
        <div class="lv-dors" role="group" aria-label="Dorsal">${Array.from({ length: 30 }, (_, i) => i + 1).map(n => `<button type="button" class="lv-dn${+q.dorsal === n ? ' on' : ''}" data-dn="${n}" aria-pressed="${+q.dorsal === n}"${taken.has(n) ? ` disabled aria-label="${n}: lo lleva ${esc(nm(taken.get(n)))}"` : ''}>${n}</button>`).join('')}</div>
        <form class="lv-dother" novalidate><label class="f" for="lv-dno">Otro número<input type="number" id="lv-dno" inputmode="numeric" min="1" max="99" value="${q.dorsal > 30 ? q.dorsal : ''}"></label>
          <button type="submit" class="btn outline">${ic('check')} Poner</button></form>
        <p class="err" id="lv-dne" role="alert" hidden></p>
        <button type="button" class="btn blue block" id="lv-mv">${ic('swap')} ${tit ? 'Pasar a suplentes' : 'Pasar a titulares'}</button>`, 'dialog', () => {});
      m.el.classList.add('rqd');
      const err = t => { const x = m.el.querySelector('#lv-dne'); x.textContent = t; x.hidden = false; };
      const after = () => { save(); m.close(false); grids(); const again = document.querySelector(`[data-lvp="${id}"]`); if (again) again.focus({ preventScroll: true }); };
      const put = n => {
        if (!(n >= 1 && n <= 99)) return err('Pon un número del 1 al 99.');
        if (taken.has(n)) return err(`El ${n} ya lo lleva ${nm(taken.get(n))}.`);
        L.dor = { ...(L.dor || {}), [id]: n }; after();
      };
      m.el.querySelectorAll('[data-dn]').forEach(b => b.onclick = () => put(+b.dataset.dn));
      m.el.querySelector('.lv-dother').onsubmit = ev => { ev.preventDefault(); put(+m.el.querySelector('#lv-dno').value); };
      m.el.querySelector('#lv-mv').onclick = () => {
        if (!tit && L.tit.length >= tmax) return err(`Ya tienes los ${tmax} titulares. Pasa antes a un titular a suplente.`);
        if (tit) { L.tit = L.tit.filter(x => x !== id); L.sup.push(id); } else { L.sup = L.sup.filter(x => x !== id); L.tit.push(id); }
        after();
      };
      (m.el.querySelector('.lv-dn.on') || m.el.querySelector('.lv-dn:not(:disabled)') || m.el.querySelector('[data-v]')).focus();
    };
    const holes = n => Array.from({ length: n }, () => `<span class="lv-tile hole" aria-hidden="true"><span class="num"></span><b>Libre</b><small>Hueco</small></span>`).join('');
    const grids = () => {
      const tt = L.tit.slice().sort(byDor), ss = L.sup.slice().sort(byDor);
      $('#lvT').innerHTML = tt.map(id => tile(id, true)).join('') + holes(Math.max(0, tmax - tt.length));
      $('#lvS').innerHTML = ss.length ? ss.map(id => tile(id, false)).join('') : '<p class="muted" style="margin:0">No queda nadie en el banquillo.</p>';
      $('#lvTn').textContent = `${L.tit.length} de ${tmax}`; $('#lvSn').textContent = L.sup.length;
      $('#lvTn').className = L.tit.length === tmax ? 'pill' : 'pill gold';
      /* La pizarra solo se abre con los titulares ya elegidos y todos los dorsales puestos */
      if ($('#lvpz')) { const falta = tmax - L.tit.length, msg = falta > 0 ? `Primero elige a los ${tmax} titulares abajo (${falta === 1 ? 'falta 1' : 'faltan ' + falta}).` : faltaDor();
        $('#lvpz').disabled = !!msg; $('#lvpzn').hidden = !msg; $('#lvpzn').textContent = msg; }
      if ($('#lverr') && !$('#lverr').hidden && !faltaDor() && L.tit.length) $('#lverr').hidden = true;
      document.querySelectorAll('[data-lvp]').forEach(b => b.onclick = () => dorsal(+b.dataset.lvp));
    };
    return { kicker, title, back,
      body: `<div class="split"><div class="stack">
        <section class="card match" aria-label="Partido"><span class="tag">${tag}</span>${score}
          <small class="cv-place">${ic('clock')} ${L.partes} partes de ${L.min} minutos · ${cv.todos ? 'toda la plantilla' : cv.ids.length + ' convocados'}</small></section>
        ${formsOf(team).length ? `<section class="card fm" aria-labelledby="h-lvfm"><div class="card-h"><h2 id="h-lvfm">Formación</h2><span class="pill${L.form ? '' : ' gold'}" id="lvfmn">${L.form ? esc(L.form) : 'Sin elegir'}</span></div>
          <div class="fm-body"><div id="lvfmp">${formPitch(L.form || formsOf(team)[0])}</div><div class="chips fm-chips" role="radiogroup" aria-label="Formación (fútbol ${modOf(team)})">${formsOf(team).map(x =>
            `<label class="chip"><input type="radio" name="lvfm" value="${x}"${L.form === x ? ' checked' : ''}> ${x}</label>`).join('')}</div></div>
          <p class="muted" style="margin:0">Fútbol ${modOf(team)}: sin contar al portero. Sale luego en las estadísticas.</p>
          <button type="button" class="btn outline block" id="lvpz">${ic('team')} Colocar a los titulares en el campo</button>
          <p class="muted" id="lvpzn" style="margin:0" hidden></p></section>` : ''}
        <p class="muted" style="margin:0">Toca a un jugador para ponerle el dorsal o cambiarlo de grupo. Se guarda solo.</p>
        <section class="card lv-team tit" aria-labelledby="h-lvT"><div class="card-h"><h2 id="h-lvT">Titulares</h2><span class="pill" id="lvTn"></span></div><div class="lv-tiles" id="lvT"></div></section>
        <section class="card lv-team" aria-labelledby="h-lvS"><div class="card-h"><h2 id="h-lvS">Suplentes</h2><span class="pill blue" id="lvSn"></span></div><div class="lv-tiles" id="lvS"></div></section></div>
        <form id="lvf" class="card stack st-save" novalidate aria-labelledby="h-lvs"><h2 id="h-lvs" style="margin:0;font-size:1.1rem">¿Cómo lo quieres rellenar?</h2>
          ${f >= TODAY ? `<p class="muted" style="margin:0"><b>En directo:</b> pulsa “Iniciar el directo” cuando el árbitro pite el comienzo y ve apuntando goles, cambios y tarjetas.</p>
          <button type="submit" class="btn blue block">${ic('play')} Iniciar el directo</button>` : ''}
          <p class="muted" style="margin:0"><b>Después del partido:</b> con lo que hayas apuntado en la libreta. Pon goles, cambios y tarjetas con su minuto.</p>
          <button type="button" class="btn ${f >= TODAY ? 'outline' : 'blue'} block" id="lvdif">${ic('pen')} Rellenar tras el partido</button>
          <p id="lverr" class="err" role="alert" hidden></p></form></div>`,
      bind() {
        grids();
        if ($('#lvpz')) $('#lvpz').onclick = () => L.tit.length === tmax && !sinDor().length && pizarra(team, L, lvPlayers(L, t.players), save, e, p);
        document.querySelectorAll('[name=lvfm]').forEach(r => r.onchange = () => { L.form = r.value; save();
          $('#lvfmp').innerHTML = formPitch(L.form); $('#lvfmn').textContent = L.form; $('#lvfmn').className = 'pill'; });
        $('#lvdif').onclick = async () => {
          if (!L.tit.length) { $('#lverr').textContent = 'Elige al menos a un titular: toca a un jugador de los suplentes.'; $('#lverr').hidden = false; return; }
          if (faltaDor()) { $('#lverr').textContent = faltaDor(); $('#lverr').hidden = false; return; }
          lvSnap(L); lvDiferido(L); L.hist = []; save();
          try { await lvToStats(team, f, L); } catch (_) {}
          render(); say('Listo. Ahora añade los goles, cambios y tarjetas con su minuto.');
        };
        $('#lvf').onsubmit = ev => {
          ev.preventDefault();
          if (!L.tit.length) { $('#lverr').textContent = 'Elige al menos a un titular: toca a un jugador de los suplentes.'; $('#lverr').hidden = false; return; }
          if (faltaDor()) { $('#lverr').textContent = faltaDor(); $('#lverr').hidden = false; return; }
          if (f < TODAY) return;
          lvSnap(L); L.parte = 1; L.fase = 'juego'; L.ini = Date.now(); L.campo = [...L.tit].sort(byDor); L.campo.forEach(id => { L.desde[id] = 0; });
          L.ev.push({ t: 'ini', parte: 1, min: '0', s: 0, p: 1 }); save(); render(); say('¡Empieza el partido!');
        };
      } };
  }

  /* --- Partido acabado: el acta --- */
  if (L.fase === 'fin') {
    const rows = lvRows(L).sort((a, b) => b.m - a.m || byDor(a.id, b.id));
    return { kicker: `Acta · ${esc(team)}`, title, back,
      body: `<div class="split"><div class="stack">
        <section class="card match" aria-label="Resultado"><span class="tag">${tag} · Final</span>${score}</section>
        ${card('h-lvm', 'Minutos y goles', rows.length ? `<div class="st-head lv-h" aria-hidden="true"><span>Jugador</span><span></span><span>Min.</span><span>Goles</span></div><div class="st-list">${rows.map(r => `<div class="st-row lv-row">${pnum(pl(r.id), 'k', '–')}
          <span class="st-n"><b title="${esc(pl(r.id).n)}">${pn(pl(r.id).n)}</b><small>${L.tit.includes(r.id) ? 'Titular' : 'Suplente'}</small></span><span></span><span>${r.m}'</span><span>${r.g}</span></div>`).join('')}</div>
          <p class="muted st-foot">Ya están sumados a las estadísticas de cada jugador.</p>` : '<p class="muted" style="margin:0">No jugó nadie.</p>')}
        <div class="btn-row lv-add"><button type="button" class="btn blue" data-lvadd="gol">${ic('plus')} Gol nuestro</button><button type="button" class="btn outline" data-lvadd="golr">${ic('plus')} Gol del rival</button></div>
        <div class="btn-row lv-add"><button type="button" class="btn outline" data-lvadd="cambio">${ic('swap')} Cambio</button><button type="button" class="btn outline" data-lvadd="tarjeta">${ic('card')} Tarjeta</button></div>
        <button type="button" class="btn outline block" id="lvfix">${ic('pen')} Corregir minutos y goles</button>
        <button type="button" class="btn red block" id="lvdel">${ic('trash')} ${L.diferido ? 'Borrar el acta' : 'Borrar el directo'}</button></div>
        ${card('h-lvt', 'Lo que pasó', lvTimeline(L, nm, true))}</div>`,
      bind() {
        $('#lvfix').onclick = () => { S.stDate = f; S.stDraft = null; go('team', S.role === 'coach' ? 'st' : 'st:' + team); };
        $('#lvdel').onclick = () => lvDelete(team, f);
        document.querySelectorAll('[data-lvadd]').forEach(b => b.onclick = () => lvAddGoal(team, f, L, b.dataset.lvadd, lvPlayers(L, t.players), async msg => {
          save(); try { await lvToStats(team, f, L); } catch (_) {} render(); say(msg);
        }));
        /* Corregir un apunte del acta: se vuelven a calcular los minutos y goles de las estadísticas */
        document.querySelectorAll('[data-evi]').forEach(b => b.onclick = () => lvEdit(team, f, L, +b.dataset.evi, lvPlayers(L, t.players), async msg => {
          save(); try { await lvToStats(team, f, L); } catch (_) {} render(); say(msg);
        }));
      } };
  }

  /* --- En juego o en el descanso --- */
  const banca = () => [...new Set([...L.tit, ...L.sup])].filter(id => !L.campo.includes(id) && !L.rojas.includes(id)).sort(byDor);
  const playing = L.fase === 'juego', last = L.parte >= L.partes;
  const ctl = playing ? `<button type="button" class="btn gold block" id="lvend">${ic('stop')} ${last ? 'Finalizar partido' : `Finalizar ${parteLbl(L.parte)}`}</button>`
    : `<button type="button" class="btn gold block" id="lvgo">${ic('play')} Iniciar ${parteLbl(L.parte + 1)}</button>`;
  const prow = (id, field) => `<div class="lv-p">${pnum(pl(id), 'k', '–')}<b class="st-n" title="${esc(pl(id).n)}">${pn(pl(id).n)}</b>
    <span class="lv-tags">${'<i class="lv-c ama" title="Tarjeta amarilla"></i>'.repeat(Math.min(lvYellow(L, id), 1))}${L.rojas.includes(id) ? '<i class="lv-c roja" title="Tarjeta roja"></i>' : ''}${lvGoals(L, id) ? `<span class="lv-gl">${ic('ball')}${lvGoals(L, id) > 1 ? lvGoals(L, id) : ''}</span>` : ''}</span>
    <span class="lv-m" data-lvm="${id}">${lvMins(L, id)}'</span></div>`;
  const actions = [['gol', 'ball', 'Gol nuestro'], ['golr', 'ball', 'Gol del rival'], ['cambio', 'swap', 'Cambio'], ['ama', 'card', 'Amarilla'], ['roja', 'card', 'Roja']];
  return { kicker, title, back,
    body: `<div class="split"><div class="stack">
      <section class="card match lv-top" aria-label="Marcador"><div class="lv-ph"><span class="tag">${playing ? parteLbl(L.parte) : last ? 'Final' : 'Descanso'}</span><span class="lv-clock" id="lv-clock" role="timer" aria-label="Tiempo de partido">${lvClock(L)}</span></div>
        ${score}${ctl}</section>
      <div class="lv-acts">${actions.map(([a, i, l]) => `<button type="button" class="lv-a ${a}" data-lva="${a}"><span class="lv-ai" aria-hidden="true">${ic(i)}</span><span>${l}</span></button>`).join('')}
        <button type="button" class="lv-a undo" id="lvundo"${lvUndoOpts(L).length ? '' : ' disabled'}><span class="lv-ai" aria-hidden="true">${ic('undo')}</span><span>Deshacer</span></button></div>
      ${card('h-lvc', `En el campo · ${L.campo.length}`, L.campo.length ? L.campo.slice().sort(byDor).map(id => prow(id, true)).join('') : '<p class="muted" style="margin:0">No hay nadie en el campo.</p>', '',
        formsOf(team).length && L.campo.length ? `<button type="button" class="more" id="lvpz2">${ic('team')} Pizarra</button>` : '')}
      ${card('h-lvb', `Banquillo · ${banca().length}`, banca().length ? banca().map(id => prow(id, false)).join('') : '<p class="muted" style="margin:0">No hay nadie en el banquillo.</p>')}
      ${L.rojas.length ? card('h-lvr', 'Expulsados', L.rojas.map(id => prow(id, false)).join('')) : ''}
      <button type="button" class="btn red block" id="lvdel">${ic('trash')} Borrar el directo</button></div>
      ${card('h-lvt', 'Lo que ha pasado', lvTimeline(L, nm, true))}</div>`,
    bind() {
      clearInterval(S.lvTick);
      /* Una sustitución: sale uno del campo y entra uno del banquillo (desde el botón Cambio o desde la pizarra) */
      const subNow = (out, inn) => {
        const mn = lvMin(L), at = playing ? { s: lvCap(L), p: L.parte } : { s: L.acc, p: L.parte, b: true };
        lvSnap(L);
        if (playing) { const c = lvCap(L); L.seg[out] = (L.seg[out] || 0) + c - (L.desde[out] || 0); L.desde[inn] = c; } else L.desde[inn] = L.acc;
        L.campo = L.campo.map(x => x === out ? inn : x);
        if (L.pz) L.pz.ids = L.pz.ids.map(x => x === out ? inn : x);   /* en la pizarra, el que entra ocupa el sitio del que sale */
        L.ev.push({ t: 'cambio', out, in: inn, min: mn, ...at }); save();
      };
      if ($('#lvpz2')) $('#lvpz2').onclick = () => pizarra(team, L, lvPlayers(L, t.players), save, e, p, subNow);
      if (playing) {
        S.lvTick = setInterval(() => {
          if (!$('#lv-clock')) return clearInterval(S.lvTick);
          $('#lv-clock').textContent = lvClock(L);
          document.querySelectorAll('[data-lvm]').forEach(x => { x.textContent = lvMins(L, +x.dataset.lvm) + "'"; });
        }, 1000);
        try { if ('wakeLock' in navigator && !S.lvLock) navigator.wakeLock.request('screen').then(l => { S.lvLock = l; l.onrelease = () => { S.lvLock = null; }; }).catch(() => {}); } catch (_) {}
      }
      const done = msg => { save(); render(); if (msg) say(msg); };
      $('#lvdel').onclick = () => lvDelete(team, f);
      document.querySelectorAll('[data-evi]').forEach(b => b.onclick = () => lvEdit(team, f, L, +b.dataset.evi, lvPlayers(L, t.players), done));
      if ($('#lvgo')) $('#lvgo').onclick = () => {
        lvSnap(L); L.parte++; L.fase = 'juego'; L.ini = Date.now(); L.campo.forEach(id => { L.desde[id] = L.acc; });
        L.ev.push({ t: 'ini', parte: L.parte, min: String((L.parte - 1) * L.min), s: L.acc, p: L.parte }); done(`Empieza la ${parteLbl(L.parte)}`);
      };
      if ($('#lvend')) $('#lvend').onclick = async () => {
        if (last && !(await confirmar('¿Finalizar el partido?', 'Se guardan el resultado, los minutos y los goles de cada jugador en las estadísticas.', 'Sí, finalizar'))) return;
        lvSnap(L);
        const c = lvCap(L), mn = lvMin(L);
        L.campo.forEach(id => { L.seg[id] = (L.seg[id] || 0) + c - (L.desde[id] || 0); });
        L.acc = c; L.ini = null; L.fase = last ? 'fin' : 'pausa';
        L.ev.push({ t: 'fin', parte: L.parte, min: mn, s: c, p: L.parte });
        if (!last) return done(`Final de la ${parteLbl(L.parte)}`);
        try { await lvToStats(team, f, L); L.hist = []; done('Partido finalizado. Minutos y goles guardados en las estadísticas.'); }
        catch (_) { done('Partido finalizado. Las estadísticas no se han podido guardar: usa “Corregir minutos y goles”.'); }
      };
      $('#lvundo').onclick = async () => {
        if (!lvUndoOpts(L).length) return;
        const i = await lvUndoPick(L, nm); if (i == null) return;
        const x = L.ev[i], what = `${x.min}' · ${lvTxt(L, nm, x)}`;
        if (!await ask('¿Borrar esta acción?', what, 'Sí, borrar')) return;
        if (L.ev[i] !== x) return;
        /* Un pitido se quita volviendo a como estaba justo antes; lo demás se borra y se rehace el partido */
        if (!LV_EDIT.includes(x.t)) {
          const prev = L.hist.pop(), h = L.hist; Object.keys(L).forEach(k => delete L[k]); Object.assign(L, JSON.parse(prev), { hist: h });
          return done('Acción borrada');
        }
        const prev = JSON.stringify(lvStrip(L)); lvSnap(L); L.ev.splice(i, 1);
        if (!lvRebuild(L)) { const h = L.hist; h.pop(); Object.keys(L).forEach(k => delete L[k]); Object.assign(L, JSON.parse(prev), { hist: h }); return say('No se puede borrar: los cambios de después dependen de él. Borra antes esos cambios.'); }
        done('Acción borrada');
      };
      document.querySelectorAll('[data-lva]').forEach(b => b.onclick = async () => {
        const a = b.dataset.lva, mn = lvMin(L), at = playing ? { s: lvCap(L), p: L.parte } : { s: L.acc, p: L.parte, b: true };
        /* Después de apuntar un gol se pregunta cómo fue (se puede saltar) */
        const como = async (x, title) => { const c = await askComo(title, `Minuto ${mn}`); if (c) { x.como = c; save(); render(); } };
        if (a === 'golr') { lvSnap(L); L.ellos++; const x = { t: 'golr', min: mn, ...at }; L.ev.push(x); done(`Gol del ${them} en el minuto ${mn}`); return como(x, '¿Cómo nos han marcado?'); }
        if (a === 'gol') {
          const id = await pickPlayer('¿Quién ha marcado?', `Minuto ${mn}`, L.campo.slice().sort(byDor), lvPlayers(L, t.players)); if (id == null) return;
          lvSnap(L); L.nos++; const x = { t: 'gol', id, min: mn, ...at }; L.ev.push(x); done(`Gol de ${pl(id).n} en el minuto ${mn}`); return como(x, `¿Cómo ha sido el gol de ${pl(id).n}?`);
        }
        if (a === 'ama' || a === 'roja') {
          const id = await pickPlayer(a === 'ama' ? '¿A quién le sacan amarilla?' : '¿A quién le sacan roja?', `Minuto ${mn}`, [...L.campo.slice().sort(byDor), ...banca()], lvPlayers(L, t.players)); if (id == null) return;
          lvSnap(L);
          const doble = a === 'ama' && lvYellow(L, id) >= 1;
          L.ev.push({ t: 'ama' === a ? 'ama' : 'roja', id, min: mn, ...at });
          if (a === 'roja' || doble) {
            if (doble) L.ev.push({ t: 'roja', id, min: mn, doble: true, ...at });
            if (L.campo.includes(id)) { if (playing) L.seg[id] = (L.seg[id] || 0) + lvCap(L) - (L.desde[id] || 0); L.campo = L.campo.filter(x => x !== id); }
            L.rojas.push(id);
          }
          return done(`${a === 'ama' && !doble ? 'Amarilla' : 'Roja'} a ${pl(id).n} en el minuto ${mn}`);
        }
        if (a === 'cambio') {
          const out = await pickPlayer('¿Quién sale?', `Cambio · minuto ${mn}`, L.campo.slice().sort(byDor), lvPlayers(L, t.players)); if (out == null) return;
          const inn = await pickPlayer('¿Quién entra?', `Sale ${pl(out).n}`, banca(), lvPlayers(L, t.players)); if (inn == null) return;
          subNow(out, inn); return done(`Entra ${pl(inn).n} y sale ${pl(out).n}`);
        }
      });
    } };
}

/* ---------- FICHA DEL PARTIDO ---------- */
/* Todo lo de un partido en un sitio: resultado, convocatoria con titulares y suplentes,
   goles minuto a minuto (con cómo fue cada uno) y los minutos y goles de cada jugador */
function openFicha(team, fecha) { S.fpFrom = S.tab; S.fpSub = S.sub; S.fpDate = fecha; S.fpView = 'res'; if (S.role === 'coach') S.team = team; go('team', S.role === 'coach' ? 'fp' : 'fp:' + team); }
/* Hay ficha si el partido ya se ha jugado o se hizo el directo */
const fichaAvail = (e, p) => !e.externo && !!S.teams[e.nombre] && !p.descansa && (!!p.goles || (actaOf(e.nombre, p.fecha) || {}).fase === 'fin');
function fpScreen(team, back) {
  const e = EQ[team], t = S.teams[team], p = e && e.partidos.find(x => x.fecha === S.fpDate && !x.descansa);
  if (!p) return { kicker: 'Ficha del partido', title: esc(team), back, body: emptyPage('cal', 'No encontramos ese partido', 'Vuelve atrás y elige otro partido.') };
  const f = p.fecha, a = actaOf(team, f), A = a && a.fase === 'fin' ? a : null, cv = S.conv[convKey(team, p)];
  const pl = id => { const x = t.players.find(y => y.id === id); return x ? (A ? { ...x, dorsal: lvDor(A, x) } : x) : { id, n: 'Jugador', dorsal: null }; };
  const byDor = (x, y) => (pl(x).dorsal || 99) - (pl(y).dorsal || 99) || pl(x).n.localeCompare(pl(y).n, 'es');
  const goles = p.goles || (A ? (p.casa ? [A.nos, A.ellos] : [A.ellos, A.nos]) : null);
  const res = goles ? outcome({ ...p, goles }) : null, rv = nice(p.rival);
  const sc = `<div class="lv-sc"><b title="${esc(p.casa ? 'Aznalcóllar' : rv)}">${esc(p.casa ? 'Aznalcóllar' : rv)}</b><span class="lv-g">${goles ? `${goles[0]}<i>–</i>${goles[1]}` : '–'}</span><b title="${esc(p.casa ? rv : 'Aznalcóllar')}">${esc(p.casa ? rv : 'Aznalcóllar')}</b></div>`;
  const head = `<section class="card match" aria-label="Resultado"><span class="tag">${dateLbl(f)} · ${p.casa ? 'Local' : 'Visitante'}${res ? ' · ' + (res === 'G' ? 'Ganado' : res === 'P' ? 'Perdido' : 'Empatado') : ''}</span>${sc}</section>`;
  const view = S.fpView || 'res';
  const seg = `<div class="seg g-scope gm-seg fp-seg" role="group" aria-label="Qué ver del partido">${[['res', 'Convocatoria'], ['gol', 'Goles'], ['jug', 'Jugadores']].map(([k, l]) => `<button type="button" data-fpv="${k}" aria-pressed="${view === k}">${l}</button>`).join('')}</div>`;
  const prow = (id, right, sub) => `<div class="lv-p">${pnum(pl(id), 'k', '–')}<span class="st-n fp-n"><b title="${esc(pl(id).n)}">${pn(pl(id).n)}</b>${sub ? `<small>${sub}</small>` : ''}</span><span></span><span class="lv-m">${right}</span></div>`;
  let body = '';
  if (view === 'res') {
    const ids = cv ? cv.ids.filter(id => t.players.some(x => x.id === id)) : A ? [...A.tit, ...A.sup] : [];
    const tit = A ? A.tit.slice().sort(byDor) : [], sup = A ? ids.filter(id => !A.tit.includes(id)).sort(byDor) : ids.slice().sort(byDor);
    body = !ids.length ? `<section class="card stack notrain"><span class="ic">${ic('list')}</span><p style="margin:0">No se hizo la convocatoria de este partido en la app.</p></section>`
      : `${cv && (cv.hora || cv.lugar) ? `<section class="card fp-cit">${ic('clock')}<span><b>Citación</b><small>${esc([cv.hora, cv.lugar].filter(Boolean).join(' · '))}</small></span></section>` : ''}
        ${A ? card('h-fpt', `Titulares · ${tit.length}`, tit.map(id => prow(id, '', 'Titular')).join('')) + card('h-fps', `Suplentes · ${sup.length}`, sup.length ? sup.map(id => prow(id, '', 'Suplente')).join('') : '<p class="muted" style="margin:0">Sin suplentes.</p>')
          : card('h-fpc', `Convocados · ${ids.length}`, ids.slice().sort(byDor).map(id => prow(id, '', '')).join('') + '<p class="muted st-foot">Los titulares se apuntan con el directo del partido.</p>')}`;
  }
  if (view === 'gol') {
    const gs = A ? A.ev.filter(x => x.t === 'gol' || x.t === 'golr') : [];
    const other = A ? A.ev.filter(x => ['ama', 'roja', 'cambio'].includes(x.t)) : [];
    const nm = id => pl(id).n;
    const scorers = !A ? t.players.filter(x => (statOf(x.id, f) || {}).g).map(x => [x, statOf(x.id, f).g]) : [];
    body = A ? `${card('h-fpg', `Goles · ${gs.length}`, gs.length ? `<ol class="fp-gl">${gs.map(x => `<li class="fp-g ${x.t === 'gol' ? 'fav' : 'con'}"><span class="lv-mn">${x.min}'</span>
        <span class="grow"><b>${x.t === 'gol' ? 'Gol a favor' : 'Gol en contra'}</b><span class="fp-who">${esc(x.t === 'gol' ? `${nm(x.id)}${pl(x.id).dorsal ? ' · ' + pl(x.id).dorsal : ''}` : rv)}</span>
        <small>${comoTxt(x.como) ? esc(comoTxt(x.como)) : 'Sin apuntar cómo fue'}</small></span></li>`).join('')}</ol>` : '<p class="muted" style="margin:0">No hubo goles.</p>')}
      ${other.length ? card('h-fpo', 'Tarjetas y cambios', lvTimeline({ ...A, ev: other }, nm)) : ''}`
      : `${card('h-fpg', 'Goles', scorers.length ? scorers.map(([x, g]) => prow(x.id, `${g} gol${g === 1 ? '' : 'es'}`, '')).join('') : '<p class="muted" style="margin:0">No hay goleadores apuntados.</p>')}
        <p class="muted" style="margin:0">El minuto y cómo fue cada gol se apuntan con el directo del partido.</p>`;
  }
  if (view === 'jug') {
    const rows = t.players.filter(x => statOf(x.id, f)).map(x => ({ x, ...statOf(x.id, f) })).sort((u, v) => v.m - u.m || byDor(u.x.id, v.x.id));
    body = card('h-fpj', `Han jugado · ${rows.length}`, rows.length ? `<div class="st-head lv-h" aria-hidden="true"><span>Jugador</span><span></span><span>Min.</span><span>Goles</span></div><div class="st-list">${rows.map(r => `<div class="st-row lv-row">${pnum(r.x, 'k', '–')}
        <span class="st-n"><b title="${esc(r.x.n)}">${pn(r.x.n)}</b>${A ? `<small>${A.tit.includes(r.x.id) ? 'Titular' : 'Suplente'}</small>` : ''}</span><span></span><span>${r.m}'</span><span>${r.g}</span></div>`).join('')}</div>`
      : '<p class="muted" style="margin:0">Todavía no se han apuntado los minutos de este partido.</p>');
  }
  const btns = `<div class="fp-btns">${a ? `<button type="button" class="btn outline block" id="fplv">${ic(A ? 'list' : 'play')} ${A ? 'Ver acta del directo' : 'Seguir el directo'}</button>` : ''}
    ${goles && statsOn() ? `<button type="button" class="btn outline block" id="fpst">${ic('pen')} ${stFilled(team, f) ? 'Corregir minutos y goles' : 'Apuntar minutos y goles'}</button>` : ''}</div>`;
  return { kicker: `Ficha del partido · ${esc(team)}`, title: `vs ${esc(rv)}`, back,
    body: `<div class="split fp"><div class="stack">${head}${seg}${body}</div><div class="stack">${btns}</div></div>`,
    bind() {
      document.querySelectorAll('[data-fpv]').forEach(b => b.onclick = () => { S.fpView = b.dataset.fpv; render(); });
      if ($('#fplv')) $('#fplv').onclick = () => openLv(team, f);
      if ($('#fpst')) $('#fpst').onclick = () => { S.stDate = f; S.stDraft = null; go('team', S.role === 'coach' ? 'st' : 'st:' + team); };
    } };
}

/* ---------- CONVOCATORIA ---------- */
/* El entrenador elige quién va al próximo partido, la hora y el sitio de la citación, y puede mandarla por WhatsApp */
const convKey = (team, p) => `${team} ${p.fecha}`;
/* Convocados en orden: si todos tienen dorsal, por dorsal (de menor a mayor) y se muestra el dorsal;
   si no, por orden alfabético y numerados del 1 al total */
function convList(players, c) {
  const list = players.filter(x => c.ids.includes(x.id)), dorsales = list.length > 0 && list.every(x => x.dorsal);
  if (dorsales) return { dorsales, rows: list.sort((a, b) => a.dorsal - b.dorsal).map(x => ({ num: x.dorsal, n: x.n })) };
  return { dorsales, rows: list.sort((a, b) => a.n.localeCompare(b.n, 'es')).map((x, i) => ({ num: i + 1, n: x.n })) };
}
/* Cartel de la convocatoria: se dibuja en el propio móvil (sin servicios externos) con los escudos y los datos reales */
const loadImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
async function convPoster(team, p, c, players) {
  await Promise.all(['800 60px Outfit', '700 40px Outfit', '500 30px Outfit'].map(f => document.fonts.load(f).catch(() => {})));
  const e = EQ[team], { dorsales, rows: list } = convList(players, c), W = 1080, ROW = 68;
  const tableY = 744, rowsY = tableY + 150, notaH = c.nota ? 70 : 0, TOP = 122, H = rowsY + list.length * ROW + 30 + notaH + 48 - TOP;
  const cv = document.createElement('canvas'), x = cv.getContext('2d');
  cv.width = W; cv.height = H;
  const BLUE = '#0034DF', GOLD = '#FDCB2B', INK = '#0B0B0B', MUTED = '#5B6475', BG = '#F3F5FA';
  const font = (w, px) => `${w} ${px}px Outfit, system-ui, sans-serif`;
  // Texto en una línea: reduce la letra hasta que quepa en el ancho
  const text = (t, tx, y, w, px, color, maxW = W - 192, align = 'center') => {
    x.font = font(w, px); while (px > 14 && x.measureText(t).width > maxW) x.font = font(w, --px);
    x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(t, tx, y); return x.measureText(t).width;
  };
  const rr = (rx, ry, rw, rh, rad, color) => { x.beginPath(); x.moveTo(rx + rad, ry); x.arcTo(rx + rw, ry, rx + rw, ry + rh, rad); x.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
    x.arcTo(rx, ry + rh, rx, ry, rad); x.arcTo(rx, ry, rx + rw, ry, rad); x.closePath(); x.fillStyle = color; x.fill(); };
  const fitImg = (img, cx, cy, box) => { const k = Math.min(box / img.width, box / img.height); x.drawImage(img, cx - img.width * k / 2, cy - img.height * k / 2, img.width * k, img.height * k); };
  const src = crestOf(e, p.rival), [ours, theirs] = await Promise.all([loadImg(crestBig()), src ? loadImg(src) : null]);
  x.fillStyle = BG; x.fillRect(0, 0, W, H);
  x.translate(0, -TOP); // sin cabecera: la tarjeta del partido empieza arriba
  // Tarjeta del partido (como en "Partidos")
  rr(48, 170, W - 96, 430, 40, '#FFFFFF');
  x.font = font(700, 30); const pw = Math.min(x.measureText(team).width + 44, 560);
  rr(96, 214, pw, 56, 28, GOLD); text(team, 96 + pw / 2, 243, 700, 30, INK, pw - 44);
  text(`${dateLbl(p.fecha)} - J${p.j}`, W - 96, 243, 500, 30, MUTED, 380, 'right');
  const side = (img, name, mine, cx) => {
    if (img) fitImg(img, cx, 375, 150);
    else { x.beginPath(); x.arc(cx, 375, 70, 0, Math.PI * 2); x.fillStyle = '#C8102E'; x.fill(); text(initials(name.replace(/^[A-Z.]+\s/, '').replace(/"/g, '')), cx, 377, 800, 48, '#FFFFFF'); }
    text(mine ? 'Aznalcóllar' : name, cx, 495, 700, 34, INK, 360);
  };
  const us = [ours, 'Aznalcóllar', true], them = [theirs, nice(p.rival), false];
  side(...(p.casa ? us : them), 270); side(...(p.casa ? them : us), 810);
  if (p.hora) text(p.hora, W / 2, 385, 800, 76, INK, 240);
  else { text('Hora por', W / 2, 365, 600, 32, MUTED, 220); text('confirmar', W / 2, 403, 600, 32, MUTED, 220); }
  text(placeOf(p) ? placeOf(p).replace(/ · /g, ' - ') : 'Campo por confirmar', W / 2, 558, 500, 30, MUTED);
  // Citación
  rr(48, 624, W - 96, 96, 32, BLUE);
  text(`Citación: ${[c.hora, c.lugar].filter(Boolean).join(' - ')}`, W / 2, 673, 700, 36, '#FFFFFF');
  // Tabla de convocados
  rr(48, tableY, W - 96, H + TOP - tableY - 48, 40, '#FFFFFF');
  text('Convocados', 96, tableY + 60, 800, 40, INK, 500, 'left');
  text(list.length === 1 ? '1 jugador' : `${list.length} jugadores`, W - 96, tableY + 60, 500, 30, MUTED, 300, 'right');
  text(dorsales ? 'Dorsal' : 'Número', 140, tableY + 122, 600, 26, MUTED, 120);
  text('Jugador', 240, tableY + 122, 600, 26, MUTED, 300, 'left');
  list.forEach((q, i) => {
    const y = rowsY + i * ROW;
    if (i % 2 === 0) rr(72, y, W - 144, ROW, 18, BG);
    text(String(q.num), 140, y + ROW / 2, 800, 34, BLUE, 120);
    text(q.n, 240, y + ROW / 2, 500, 34, INK, W - 240 - 96, 'left');
  });
  if (c.nota) text(`Nota: ${c.nota}`, 96, rowsY + list.length * ROW + 30 + 30, 500, 30, MUTED, W - 192, 'left');
  return new Promise(ok => cv.toBlob(b => ok(b), 'image/png'));
}
function sharePoster(team, p, c, players) {
  return shareImage({ title: 'Cartel de la convocatoria', wait: 'Preparando el cartel…', build: () => convPoster(team, p, c, players), name: fileName('convocatoria', team, p.fecha),
    alt: `Cartel: convocatoria del ${team} contra ${nice(p.rival)}, ${c.ids.length} convocados`, msg: mapsMsg(p), what: 'el cartel' });
}
function convScreen() {
  const team = S.team, t = S.teams[team], e = EQ[team], p = e && nextMatch(e);
  const back = () => go('home');
  if (!p) return { kicker: 'Convocatoria', title: esc(team), back, body: emptyPage('cal', 'No hay próximo partido', 'Cuando haya un partido en el calendario podrás hacer la convocatoria.') };
  const k = convKey(team, p), saved = S.conv[k];
  const c = S.convDraft && S.convDraft.k === k ? S.convDraft : (S.convDraft = { k, ids: saved ? [...saved.ids] : [], hora: saved ? saved.hora : '', lugar: saved ? saved.lugar : '', nota: saved ? saved.nota : '' });
  const max = maxConv(team), many = t.players.length > max;
  /* Si hay más jugadores que el máximo de convocados, el botón solo sirve para quitar a todos */
  const allBtn = on => on || many ? `${ic('x')} Quitar a todos` : `${ic('check')} Convocar a todos`;
  const cnt = () => `${c.ids.length}<small style="font-size:1.2rem;opacity:.7"> / ${Math.min(max, t.players.length)}</small>`;
  const row = (x, i) => `<li><button type="button" class="player" data-cv="${x.id}" aria-pressed="${c.ids.includes(x.id)}">
    <span class="tick" aria-hidden="true">${ic('check')}</span>${pnum(x, 'num', i + 1)}<span class="pinfo"><span class="pname" title="${esc(x.n)}">${pn(x.n)}</span>
    <span class="pstate">${c.ids.includes(x.id) ? 'Convocado' : 'No va'}</span>${attPill(team, x.id)}</span></button></li>`;
  return {
    kicker: `Convocatoria · ${esc(team)}`, title: `vs ${esc(nice(p.rival))}`, back,
    body: `<div class="split"><div class="stack">
      <section class="card match" aria-label="Partido"><div class="att-top">
        <div><span class="tag">${dateLbl(p.fecha)}${p.hora ? ' · ' + p.hora : ' · Hora por confirmar'} · ${p.casa ? 'Local' : 'Visitante'}</span><div class="vs-time" style="margin-top:10px" id="cvn">${cnt()}</div><small>convocados · fútbol ${modOf(team)}, máximo ${max}</small></div>
        <button type="button" class="btn gold" id="cvall"${t.players.length ? '' : ' disabled'}${many && !c.ids.length ? ' hidden' : ''}>${allBtn(t.players.length && t.players.every(x => c.ids.includes(x.id)))}</button></div>
        ${placeOf(p) ? `<small class="cv-place">${ic('pin')} ${esc(placeOf(p))}</small>` : ''}</section>
      <p class="muted" style="margin:0">Toca a cada jugador para convocarlo o quitarlo.</p>
      ${t.players.length ? '' : `<p class="card muted" style="margin:0">Todavía no hay jugadores en este equipo. Añádelos en “Plantilla”.</p>`}
      <ul class="players">${t.players.map(row).join('')}</ul></div>
      <form id="cvf" class="card stack" novalidate aria-labelledby="h-cv"><h2 id="h-cv" style="margin:0;font-size:1.1rem">Citación</h2>
        <div class="row2"><label class="f" for="cvh">Hora<input type="time" id="cvh" required aria-required="true" value="${esc(c.hora || '')}"></label>
        <label class="f" for="cvl">Sitio<input type="text" id="cvl" required aria-required="true" maxlength="60" placeholder="P. ej. puerta del campo" value="${esc(c.lugar || '')}"></label></div>
        <label class="f" for="cvo">Nota (opcional)<textarea id="cvo" maxlength="300" placeholder="P. ej. traed la 2ª equipación">${esc(c.nota || '')}</textarea></label>
        <p id="cverr" class="err" role="alert" hidden></p>
        <button type="submit" class="btn blue block">${ic('check')} Guardar convocatoria</button>
        <button type="button" class="btn outline block" id="cvwa">${ic('send')} Enviar por WhatsApp</button>
      </form></div>`,
    bind() {
      const sync = () => { c.hora = $('#cvh').value; c.lugar = $('#cvl').value.trim(); c.nota = $('#cvo').value.trim();
        $('#cvn').innerHTML = cnt();
        $('#cvall').innerHTML = allBtn(allOn()); $('#cvall').hidden = many && !c.ids.length; };
      const allOn = () => t.players.length > 0 && t.players.every(x => c.ids.includes(x.id));
      const paint = b => { const on = c.ids.includes(+b.dataset.cv); b.setAttribute('aria-pressed', on); b.querySelector('.pstate').textContent = on ? 'Convocado' : 'No va'; };
      document.querySelectorAll('[data-cv]').forEach(b => b.onclick = () => {
        const id = +b.dataset.cv;
        if (!c.ids.includes(id) && c.ids.length >= max) return say(`En fútbol ${modOf(team)} se pueden convocar como mucho ${max} jugadores. Quita a alguno para añadir a otro.`);
        c.ids = c.ids.includes(id) ? c.ids.filter(x => x !== id) : [...c.ids, id]; paint(b); sync(); });
      $('#cvall').onclick = () => { c.ids = allOn() || many ? [] : t.players.map(x => x.id); document.querySelectorAll('[data-cv]').forEach(paint); sync(); };
      ['#cvh', '#cvl', '#cvo'].forEach(s => $(s).oninput = sync);
      const check = () => {
        sync(); $('#cvh').removeAttribute('aria-invalid'); $('#cvl').removeAttribute('aria-invalid');
        const bad = !c.ids.length ? ['Elige al menos a un jugador convocado.', null] : c.ids.length > max ? [`En fútbol ${modOf(team)} se pueden convocar como mucho ${max} jugadores. Quita a ${c.ids.length - max}.`, null] : !c.hora ? ['Pon la hora de la citación.', '#cvh'] : !c.lugar ? ['Pon el sitio de la citación.', '#cvl'] : null;
        $('#cverr').hidden = !bad; if (!bad) return true;
        $('#cverr').textContent = bad[0]; if (bad[1]) { $(bad[1]).setAttribute('aria-invalid', 'true'); $(bad[1]).focus(); }
        return false;
      };
      $('#cvwa').onclick = () => { if (check()) sharePoster(team, p, c, t.players); };
      $('#cvf').onsubmit = async ev => {
        ev.preventDefault();
        if (!check()) return;
        const val = { ids: [...c.ids], hora: c.hora, lugar: c.lugar, nota: c.nota };
        try { API() && await API().convocatoria(team, p.fecha, val); } catch (_) { $('#cverr').textContent = 'No se ha podido guardar. Revisa la conexión.'; $('#cverr').hidden = false; return; }
        S.conv[k] = val; S.convDraft = null;
        /* Si se vino desde el directo, se vuelve a él para elegir titulares */
        const lv = S.convLv; S.convLv = null;
        if (lv && lv.team === team && lv.fecha === p.fecha) { openLv(team, p.fecha); S.lvFrom = lv.from; return say(`Convocatoria guardada: ${val.ids.length} jugadores. Ya puedes elegir titulares y suplentes.`); }
        go('home'); say(`Convocatoria guardada: ${val.ids.length} jugadores. Para mandarla por WhatsApp, vuelve a abrir la convocatoria.`);
      };
    }
  };
}

/* Próximo partido de cada equipo del entrenador: con varios equipos es un carrusel (arrastrar o puntos) */
function matchSlide(team) {
  const nm = EQ[team] && nextMatch(EQ[team]), cv = nm && S.conv[convKey(team, nm)], ac = nm && actaOf(team, nm.fecha);
  return `${scoreHTML(team)}
    <div class="match-btns">${nm && (cv || ac) ? `<button type="button" class="btn white" data-lv-team="${esc(team)}">${ic(!ac || ac.fase === 'previa' ? 'pen' : ac.fase === 'fin' ? 'list' : 'play')} ${!ac || ac.fase === 'previa' ? 'Rellenar datos' : ac.fase === 'fin' ? 'Ver acta del partido' : 'Seguir el directo'}</button>` : ''}${nm ? `<button type="button" class="btn ${cv ? 'glass' : 'gold'}" data-conv-team="${esc(team)}">${ic('list')} ${cv ? `Convocatoria · ${cv.ids.length}` : 'Hacer convocatoria'}</button>` : ''}${nm && nm.casa ? '' : nm && nm.campo ? `<a class="btn white" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeOf(nm))}">${ic('pin')}Cómo llegar</a>` : `<button type="button" class="btn glass" disabled>${ic('pin')}Campo por confirmar</button>`}</div>`;
}
function matchTag(team) { const nm = EQ[team] && nextMatch(EQ[team]); return nm ? dateLbl(nm.fecha) : ''; }
function matchCarousel() {
  const teams = Object.keys(S.teams), many = teams.length > 1, at = Math.max(0, teams.indexOf(S.team));
  /* Cada equipo tiene su tarjeta entera; con varios equipos se desliza la tarjeta completa */
  const one = (t, i) => { const tag = matchTag(t);
    return `<section class="card match mslide" aria-labelledby="h-m${i}"${many ? ` role="group" aria-roledescription="partido" aria-label="${esc(t)}, ${i + 1} de ${teams.length}"${i === at ? '' : ' inert'}` : ''}>
      <div class="card-h"><h2 id="h-m${i}">Próximo partido</h2>${tag ? `<span class="tag gold">${tag}</span>` : ''}</div>${matchSlide(t)}</section>`; };
  if (!many) return `<div class="a-match mwrap">${one(S.team, 0)}</div>`;
  return `<div class="a-match mwrap"><div class="mcar" id="mcar" data-at="${at}" aria-roledescription="carrusel" aria-label="Próximos partidos">${teams.map(one).join('')}</div>
    <div class="mdots" role="group" aria-label="Elegir equipo">${teams.map((t, i) => `<button type="button" data-dot="${i}" aria-label="Próximo partido del ${esc(t)}"${i === at ? ' aria-current="true"' : ''}></button>`).join('')}</div></div>`;
}
function bindCarousel() {
  document.querySelectorAll('[data-conv-team]').forEach(b => b.onclick = () => { S.team = b.dataset.convTeam; go('team', 'conv'); });
  document.querySelectorAll('[data-lv-team]').forEach(b => b.onclick = () => openLv(b.dataset.lvTeam, nextMatch(EQ[b.dataset.lvTeam]).fecha));
  const car = $('#mcar'); if (!car) return;
  const slides = [...car.children], dots = [...document.querySelectorAll('[data-dot]')];
  let cur = +car.dataset.at;
  const show = i => { cur = i; slides.forEach((s, k) => s.inert = k !== i); dots.forEach((d, k) => d.toggleAttribute('aria-current', k === i)); };
  /* Paso entre tarjetas: su ancho más el hueco que las separa */
  const step = () => slides[1].offsetLeft - slides[0].offsetLeft || car.clientWidth;
  const to = (i, smooth = true) => car.scrollTo({ left: i * step(), behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  requestAnimationFrame(() => to(cur, false));
  car.addEventListener('scroll', () => { const i = Math.round(car.scrollLeft / step()); if (i !== cur && slides[i]) show(i); }, { passive: true });
  dots.forEach(d => d.onclick = () => { show(+d.dataset.dot); to(+d.dataset.dot); });
  // Arrastrar con el ratón (en pantallas táctiles ya se desliza con el dedo)
  let x0 = null, l0 = 0, moved = false;
  car.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; x0 = e.clientX; l0 = car.scrollLeft; moved = false; });
  addEventListener('pointermove', e => { if (x0 === null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 5 && !moved) { moved = true; car.classList.add('drag'); } if (moved) car.scrollLeft = l0 - dx; });
  addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (!moved) return;
    car.classList.remove('drag'); const i = Math.min(slides.length - 1, Math.max(0, Math.abs(dx) > step() / 5 ? cur + (dx < 0 ? 1 : -1) : cur)); show(i); to(i); });
  car.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  car.addEventListener('dragstart', e => e.preventDefault());
}

/* ---------- ENTRENADOR ---------- */
const COACH = {
  opts: optsScreen,
  home() {
    const t = S.teams[S.team];
    const mine = S.requests.filter(r => r.by === S.coach && r.st < 3);
    const notice = S.notices.find(n => !n.read) || S.notices[0];
    const mine2 = new Set(AGENDA.filter(x => x.kind === 'match' && S.teams[x.team]).map(x => x.iso));
    const pend = pendingAll(), tt = trainAt(S.team, TODAY);
    return {
      kicker: `${greet()},`, title: esc(myName()), layout: '',
      body: `
      <div class="days" aria-label="Esta semana">${MONWEEK.map(iso => { const [w, n] = dayLbl(iso).split(' '); const tr = Object.keys(S.teams).some(tm => trainsOn(tm, iso)), mt = mine2.has(iso);
        return `<span class="${iso === TODAY ? 'today' : ''}" aria-label="${dateLbl(iso)}${tr ? ', entrenamiento' : ''}${mt ? ', partido' : ''}">${w}<b>${n}</b><i class="dots" aria-hidden="true">${tr ? '<i class="dt"></i>' : ''}${mt ? '<i class="dm"></i>' : ''}</i></span>`; }).join('')}</div>
      <p class="days-key" aria-hidden="true"><span><i class="dt"></i>Entrenamiento</span><span><i class="dm"></i>Partido</span></p>
      ${pushCard()}
      ${pend.length ? `<section class="card pend" aria-labelledby="h-pend"><div class="card-h"><h2 id="h-pend">${pend.length === 1 ? 'Tienes 1 lista sin pasar' : `Tienes ${pend.length} listas sin pasar`}</h2></div>
        <div class="chips">${pend.map(x => `<button type="button" class="chip" data-att="${x.iso}" data-att-team="${esc(x.team)}">${ic('list')} ${x.iso === TODAY ? 'Hoy' : dayLbl(x.iso)}${Object.keys(S.teams).length > 1 ? ' · ' + esc(x.team) : ''}</button>`).join('')}</div></section>` : ''}
      <div class="grid coach-home">
        ${matchCarousel()}
        <section class="hero a-hero" aria-labelledby="h-hero">
          <span class="kick">${tt ? `Hoy · ${esc(trainLbl(tt))}` : esc(EQ[S.team] ? EQ[S.team].cat : t.cat || '')}</span>
          <h2 id="h-hero">Semana de partido para el ${S.team}</h2>
          <p>Estas son tus acciones:</p>
          <div class="btns"><button type="button" class="btn gold" data-go="team:list">${ic('list')} Pasar lista de entrenamiento</button><button type="button" class="btn blue" data-go="ask">${ic('plus')} Pedir algo a la junta</button></div>
        </section>
        <section class="actions a-actions" aria-label="Acciones rápidas">
          <button type="button" class="act p" data-go="team:list"><span class="ic">${ic('list')}</span>Pasar lista</button>
          <button type="button" class="act" data-go="ask"><span class="ic">${ic('box')}</span>Pedir algo</button>
          <button type="button" class="act" data-go="ask:roto"><span class="ic">${ic('wrench')}</span>Algo roto</button>
        </section>
        ${agendaCard(S.ag)}
        ${attendanceCard(S.team, 'h-at')}
        ${noticeCard(notice, 'a-notice')}
        ${card('h-rq', 'Mis peticiones', mine.length ? mine.map(r => reqRow(r)).join('') : '<p class="muted">No tienes peticiones abiertas.</p>', 'a-reqs', '<button type="button" class="more" data-go="ask">Nueva</button>')}
        ${card('h-tm', 'Mis equipos', Object.entries(S.teams).map(([n, x], i) => `<button type="button" class="tm" data-team-go="${n}" style="width:100%;border:0;background:none;cursor:pointer;text-align:left;font:inherit">
          <span class="k">${abbr(n)}</span><span class="grow"><b>${n}</b><small>${EQ[n] ? EQ[n].cat : x.cat}</small></span>${ourRow(EQ[n]) ? `<span class="pill blue">${ourRow(EQ[n]).pos}º</span>` : ''}</button>`).join(''), 'a-teams')}
      </div>`,
      bind() {
        bindAgenda(); bindCarousel();
        document.querySelectorAll('[data-att]').forEach(b => b.onclick = () => { S.team = b.dataset.attTeam; S.attDate = b.dataset.att; go('team', 'list'); });
        document.querySelectorAll('[data-say]').forEach(b => b.onclick = () => say(b.dataset.say));
      }
    };
  },
  team() {
    if (S.sub === 'conv') return convScreen();
    if (S.sub === 'st') return stScreen(S.team, () => { S.plView = 'stats'; go('team', 'roster'); });
    if (S.sub === 'fp') return fpScreen(S.team, () => S.fpFrom && S.fpFrom !== 'team' ? go(S.fpFrom) : go('team', S.fpSub && S.fpSub !== 'fp' ? S.fpSub : null));
    if (S.sub === 'lv') return lvScreen(S.team, () => S.lvFrom && S.lvFrom !== 'team' ? go(S.lvFrom) : go('team', S.lvSub && !['lv', 'conv', 'fp'].includes(S.lvSub) ? S.lvSub : null));
    const t = S.teams[S.team];
    const sub = S.sub || 'list';
    const pend = pendingLists(S.team);
    const dates = trainDates(S.team);
    if (!dates.includes(S.attDate)) S.attDate = dates.includes(TODAY) ? TODAY : pend[pend.length - 1] || dates[dates.length - 1] || null;
    const date = S.attDate, isToday = date === TODAY;
    const nextTrain = [1, 2, 3, 4, 5, 6, 7].map(i => addDays(TODAY, i)).find(d => trainsOn(S.team, d));
    const noTrainMsg = !trainOf(S.team) ? 'La junta aún no ha puesto los días de entrenamiento de este equipo.'
      : `Hoy no hay entrenamiento, así que no se pasa lista.${nextTrain ? ` El próximo es el ${dateLbl(nextTrain).toLowerCase()}${trainAt(S.team, nextTrain).h ? ' a las ' + trainAt(S.team, nextTrain).h : ''}${trainAt(S.team, nextTrain).where ? ' en el ' + trainAt(S.team, nextTrain).where : ''}.` : ''}`;
    const key = `${S.team} ${date}`;
    const a = S.attend[key] || (S.attend[key] = new Set());
    const tt = date && trainAt(S.team, date);
    const pct = () => t.players.length ? Math.round(a.size / t.players.length * 100) : 0;
    const allIn = () => t.players.length > 0 && t.players.every(p => a.has(p.id));
    const allLbl = () => allIn() ? `${ic('x')} Quitar a todos` : `${ic('check')} Marcar a todos`;
    const head = `<div class="stack" style="margin-bottom:16px">
      <div class="seg g-scope seg-x" role="group" aria-label="Elige equipo">${Object.keys(S.teams).map(n => `<button type="button" data-team="${n}" aria-pressed="${n === S.team}">${n}</button>`).join('')}</div>
      ${summaryCard(EQ[S.team])}
      <div class="tabs" role="group" aria-label="Vista">${[['list', 'Pasar lista'], ['games', 'Partidos'], ['table', 'Clasificación'], ['roster', 'Plantilla']].map(([k, l]) =>
        `<button type="button" data-sub="${k}" aria-pressed="${sub === k}">${l}</button>`).join('')}</div></div>`;
    let body = '';
    if (sub === 'list' && !date) body = `<div class="split"><section class="card stack notrain" aria-label="Pasar lista"><span class="ic">${ic('cal')}</span><p style="margin:0">${esc(noTrainMsg)}</p></section>
      ${attendanceCard(S.team, 'h-at2')}</div>`;
    else if (sub === 'list') body = `<div class="split"><div class="stack">
      ${!dates.includes(TODAY) ? `<p class="card muted" style="margin:0">${esc(noTrainMsg)} Si se te olvidó alguna, puedes completarla aquí:</p>` : ''}
      ${dates.length > 1 || !dates.includes(TODAY) ? `<div class="seg g-scope seg-x" role="group" aria-label="Elige el entrenamiento">${dates.map(d => `<button type="button" data-date="${d}" aria-pressed="${d === date}">${d === TODAY ? 'Hoy' : dayLbl(d)}${pend.includes(d) ? ' <span class="pdot" aria-label="sin pasar"></span>' : ''}</button>`).join('')}</div>` : ''}
      <section class="card match" aria-label="Resumen de asistencia"><div class="att-top">
        <div><span class="tag">${isToday ? 'Hoy' : dateLbl(date)}${tt ? ` · ${esc([tt.h, tt.where].filter(Boolean).join(' · '))}` : ''}</span><div class="vs-time" style="margin-top:10px" id="cnt">${a.size}<small style="font-size:1.2rem;opacity:.7"> / ${t.players.length}</small></div><small>han venido</small></div>
        <button type="button" class="btn gold" id="all"${t.players.length ? '' : ' disabled'}>${allLbl()}</button></div>
        <div class="progress" aria-hidden="true"><i id="bar" style="width:${pct()}%"></i></div></section>
      <p class="muted" style="margin:0">Toca a cada jugador que ha venido. Se guarda solo.</p>
      ${t.players.length ? '' : `<p class="card muted" style="margin:0">Todavía no hay jugadores en este equipo. Añádelos en “Plantilla”.</p>`}
      <ul class="players">${t.players.map((p, i) => `<li><button type="button" class="player" data-p="${p.id}" aria-pressed="${a.has(p.id)}">
        <span class="tick" aria-hidden="true">${ic('check')}</span>${pnum(p, 'num', i + 1)}<span class="pinfo"><span class="pname" title="${esc(p.n)}">${pn(p.n)}</span>
        <span class="pstate">${a.has(p.id) ? 'Ha venido' : 'Sin marcar'}</span></span></button></li>`).join('')}</ul></div>
      ${attendanceCard(S.team, 'h-at2')}</div>`;
    const plv = S.plView === 'stats' ? 'stats' : 'roster';
    if (sub === 'roster') body = `<div class="stack"><div class="seg g-scope gm-seg" role="group" aria-label="Qué ver de los jugadores">
        <button type="button" data-plv="roster" aria-pressed="${plv === 'roster'}">Jugadores</button>
        <button type="button" data-plv="stats" aria-pressed="${plv === 'stats'}">Estadísticas</button></div>
      ${plv === 'stats' ? statsView(S.team) : addPlayerCard(S.team) + rosterCard(S.team)}</div>`;
    const e = EQ[S.team];
    const gv = S.gmView === 'group' ? 'group' : 'mine';
    if (sub === 'games') body = `<div class="stack"><div class="seg g-scope gm-seg" role="group" aria-label="Qué partidos ver">
        <button type="button" data-gmv="mine" aria-pressed="${gv === 'mine'}">Mis partidos</button>
        <button type="button" data-gmv="group" aria-pressed="${gv === 'group'}">Partidos del grupo</button></div>
      ${gv === 'group' ? groupView(e) : card('h-gm', `Temporada · ${e.partidos.length} jornadas`, [...e.partidos].sort(byDate).map(p => matchRow(e, p)).join(''), '', `<span class="tag src">${e.fuente}</span>`)}</div>`;
    if (sub === 'table') body = card('h-tb', e.cat, tableHTML(e), '', `<span class="tag src">${e.fuente}</span>`);
    return {
      kicker: `Mi equipo · ${EQ[S.team] ? EQ[S.team].cat : t.cat}`, title: S.team,
      body: head + body,
      bind() {
        document.querySelectorAll('[data-team]').forEach(b => b.onclick = () => { S.team = b.dataset.team; S.attDate = null; S.gj = null; render(); });
        bindSummary();
        document.querySelectorAll('[data-gmv]').forEach(b => b.onclick = () => { S.gmView = b.dataset.gmv; S.gj = null; render(); });
        document.querySelectorAll('[data-plv]').forEach(b => b.onclick = () => { S.plView = b.dataset.plv; render(); });
        if (sub === 'roster' && plv === 'stats') bindStats(S.team);
        document.querySelectorAll('[data-gj]').forEach(b => b.onclick = () => { if (b.dataset.gj) { S.gj = +b.dataset.gj; render(); } });
        /* El equipo y el día elegidos siempre a la vista, aunque el selector se deslice */
        document.querySelectorAll('.seg-x [aria-pressed="true"]').forEach(b => { const s = b.parentElement; s.scrollLeft = b.offsetLeft - (s.clientWidth - b.offsetWidth) / 2; });
        document.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => { S.sub = b.dataset.sub; render(); });
        bindRoster(S.team);
        document.querySelectorAll('[data-date]').forEach(b => b.onclick = () => { S.attDate = b.dataset.date; render(); });
        document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
          const i = +b.dataset.p; a.has(i) ? a.delete(i) : a.add(i);
          API() && API().asistencia(i, date, a.has(i)).catch(() => { a.has(i) ? a.delete(i) : a.add(i); render(); say('No se ha podido guardar. Revisa la conexión.'); });
          b.setAttribute('aria-pressed', a.has(i));
          b.querySelector('.pstate').textContent = a.has(i) ? 'Ha venido' : 'Sin marcar';
          $('#cnt').innerHTML = `${a.size}<small style="font-size:1.2rem;opacity:.7"> / ${t.players.length}</small>`; $('#bar').style.width = pct() + '%'; $('#all').innerHTML = allLbl();
          const ac = document.querySelector('.a-attend'); if (ac) ac.outerHTML = attendanceCard(S.team, ac.getAttribute('aria-labelledby'));
          save();
          $('#live').textContent = `${t.players.find(p => p.id === i).n}: ${a.has(i) ? 'ha venido' : 'sin marcar'}. ${a.size} de ${t.players.length}.`;
        });
        const all = $('#all');
        if (all) all.onclick = () => {
          if (allIn()) {
            const prev = new Set(a), gone = [...a];
            a.clear(); render();
            API() && Promise.all(gone.map(i => API().asistencia(i, date, false))).catch(() => say('No se ha podido guardar. Revisa la conexión.'));
            return say('Lista vaciada', () => { S.attend[key] = prev; API() && gone.forEach(i => API().asistencia(i, date, true)); });
          }
          const prev = new Set(a), added = t.players.filter(p => !a.has(p.id)).map(p => p.id);
          added.forEach(i => a.add(i)); render();
          API() && Promise.all(added.map(i => API().asistencia(i, date, true))).catch(() => say('No se ha podido guardar. Revisa la conexión.'));
          say('Todos marcados como presentes', () => { S.attend[key] = prev; API() && added.forEach(i => API().asistencia(i, date, false)); });
        };
      }
    };
  },
  ask() {
    if (S.sub === 'mine') { S.askView = 'mine'; S.sub = null; }
    const d = S.draft || (S.draft = { step: S.sub ? 2 : 1, kind: S.sub || null, text: '', where: '', urgent: false, photo: null });
    if (S.sub) S.askView = 'new';
    S.sub = null;
    const view = S.askView === 'mine' ? 'mine' : 'new';
    const stepper = `<div class="stepper" aria-hidden="true">${[1, 2, 3].map(i => `<span class="${i <= d.step ? 'on' : ''}"></span>`).join('')}</div>
      <p class="step-lbl">Paso ${d.step} de 3 · ${['¿Qué necesitas?', 'Cuéntanos', 'Revisa y envía'][d.step - 1]}</p>`;
    const back = view === 'new' && d.step > 1 && d.step < 4 ? () => { d.step--; render(true); } : null;
    const mine = S.requests.filter(r => r.by === S.coach);
    const base = { kicker: 'Pedir o avisar', back };
    // Selector arriba: hacer una petición o ver las mías, cada cosa a todo el ancho
    const seg = `<div class="seg g-scope ask-seg" role="group" aria-label="Qué quieres hacer">
      <button type="button" data-av="new" aria-pressed="${view === 'new'}">${ic('plus')} Hacer una petición</button>
      <button type="button" data-av="mine" aria-pressed="${view === 'mine'}">${ic('list')} Mis peticiones${mine.length ? ` <span class="seg-n">${mine.length}</span>` : ''}</button></div>`;
    const bindSeg = () => document.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { S.askView = b.dataset.av; render(true); });
    const duo = v => ({ ...v, body: `<div class="stack">${seg}${v.body}</div>`, bind() { bindSeg(); v.bind && v.bind(); } });
    if (view === 'mine') return duo({ ...base,
      title: 'Mis peticiones',
      body: mine.length ? `<div class="cards-grid rq-cards">${mine.map(r => `<section class="card">${reqRow(r)}</section>`).join('')}</div>`
        : emptyPage('box', 'Aún no has pedido nada', 'Aquí verás cómo avanza cada petición.', 'ask-empty', '<button type="button" class="btn blue" data-av="new">' + ic('plus') + ' Hacer una petición</button>')
    });
    if (d.step === 1) return duo({ ...base,
      title: '¿Qué necesitas?',
      body: `${stepper}<div class="opts">
        <button type="button" class="opt" data-k="material"><span class="ic">${ic('box')}</span><span><b>Pedir material</b><small>Balones, petos, conos, botiquín…</small></span><span class="go">${ic('chev')}</span></button>
        <button type="button" class="opt" data-k="roto"><span class="ic">${ic('wrench')}</span><span><b>Avisar de algo roto</b><small>Porterías, luces, vestuarios…</small></span><span class="go">${ic('chev')}</span></button>
        <button type="button" class="opt" data-k="otra"><span class="ic">${ic('talk')}</span><span><b>Otra cosa</b><small>Horarios, campos, dudas, propuestas</small></span><span class="go">${ic('chev')}</span></button></div>`,
      bind() { document.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { d.kind = b.dataset.k; d.step = 2; render(true); }); }
    });
    if (d.step === 2) return duo({ ...base,
      title: kindName(d.kind),
      body: `${stepper}<form id="f" class="card stack" novalidate>
        <label class="f" for="t">${d.kind === 'roto' ? '¿Qué se ha roto?' : d.kind === 'material' ? '¿Qué necesitas?' : '¿Qué quieres decir a la junta?'}
          <span class="hint">${ic('mic')} Con una frase basta. Puedes dictarlo con el micrófono del teclado.</span>
          <textarea id="t" required>${esc(d.text)}</textarea></label>
        ${d.kind === 'roto' ? `<label class="f" for="w">¿Dónde está?
          <select id="w">${['', 'Campo 1', 'Campo 2', 'Vestuario 1', 'Vestuario 2', 'Vestuario 3', 'Almacén', 'Otro sitio'].map(o => `<option ${d.where === o ? 'selected' : ''} value="${o}">${o || 'Elige un sitio'}</option>`).join('')}</select></label>` : ''}
          <label class="photo" for="ph">${d.photo ? `<img src="${d.photo}" alt="Foto adjunta">` : `<span class="ic">${ic('camera')}</span>`}
          <span>${d.photo ? 'Foto añadida · toca para cambiarla' : 'Añadir una foto (opcional)'}</span></label>
          <input type="file" id="ph" accept="image/*" class="sr">
        <label class="toggle" for="u"><input type="checkbox" id="u" ${d.urgent ? 'checked' : ''}> <span>Es urgente</span></label>
        <p id="err" class="err" role="alert" hidden>Escribe al menos unas palabras para poder seguir.</p>
        <button class="btn blue block" type="submit">Siguiente</button></form>`,
      bind() {
        const sync = () => { d.text = $('#t').value.trim(); d.urgent = $('#u').checked; if ($('#w')) d.where = $('#w').value; };
        const ph = $('#ph');
        if (ph) ph.onchange = async () => { const f = ph.files[0]; if (!f) return; try { d.photo = await readImage(f); } catch (_) { say('No se ha podido leer esa foto. Prueba con otra.'); return; } sync(); render(); };
        $('#f').onsubmit = e => { e.preventDefault(); sync(); if (!d.text) { $('#err').hidden = false; $('#t').focus(); return; } d.step = 3; render(true); };
      }
    });
    if (d.step === 3) return duo({ ...base,
      title: 'Revisa y envía',
      body: `${stepper}<section class="card stack" aria-label="Resumen">
        <div class="rq" style="padding:0;border:0"><span class="ic ${kindCls(d.kind)}">${ic(kindIco(d.kind))}</span><div class="grow"><b>${esc(d.text)}</b><small>${kindName(d.kind)} · ${S.team}${d.where ? ' · ' + esc(d.where) : ''}</small></div>${d.urgent ? '<span class="pill red">Urgente</span>' : ''}</div>
        ${d.photo ? `<img src="${d.photo}" alt="Foto adjunta" style="border-radius:16px;max-height:240px;width:100%;object-fit:cover">` : ''}
        <button type="button" class="btn gold block" id="send">${ic('send')} Enviar a la junta</button></section>`,
      bind() {
        $('#send').onclick = async () => {
          const r = { id: Date.now(), kind: d.kind, title: d.text, where: d.where, team: S.team, by: S.coach, st: 0, when: 'Ahora', urgent: d.urgent, foto: d.photo || null, conFoto: !!d.photo };
          try { if (API()) r.id = await API().peticion(r); } catch (_) { say('No se ha podido enviar. Revisa la conexión y vuelve a probar.'); return; }
          S.requests.unshift(r);
          d.step = 4; render(true);
        };
      }
    });
    return duo({ ...base, back: null,
      title: 'Enviado a la junta',
      body: `<section class="card stack" style="align-items:flex-start"><span class="done-ic">${ic('check')}</span>
        <h2 style="margin:0">Ya lo tienen</h2><p class="muted" style="margin:0">Verás cómo avanza en Inicio, en “Mis peticiones”. Te avisaremos cuando esté resuelto.</p>
        <button type="button" class="btn blue block" data-go="home">Volver al inicio</button></section>`,
      bind() { S.draft = null; }
    });
  },
  games: gamesScreen,
  msg() {
    return {
      kicker: 'Mensajes', title: 'Avisos del club',
      body: `<div class="cards-grid">${S.notices.length ? '' : emptyPage('bell', 'Todavía no hay avisos', 'Cuando la junta envíe un aviso, lo verás aquí.')}${S.notices.map(n => `<section class="card notice" aria-labelledby="m${n.id}">
          <div class="card-h" style="margin-bottom:6px"><span class="eyebrow">${esc(n.from)}</span>${n.read ? '<span class="pill">Leído</span>' : '<span class="pill gold">Nuevo</span>'}</div>
          <h3 id="m${n.id}">${esc(n.title)}</h3><p style="margin:6px 0 0">${esc(n.body)}</p>
          ${n.read ? '' : `<button type="button" class="btn blue block" style="margin-top:14px" data-read="${n.id}">${ic('check')} Entendido</button>`}</section>`).join('')}</div>`,
      bind() { document.querySelectorAll('[data-read]').forEach(b => b.onclick = () => {
        const n = S.notices.find(x => x.id == b.dataset.read); n.read = true; n.readBy++; render(); say('Marcado como leído. La junta lo verá.');
        API() && API().leido(n.id).catch(() => {}); }); }
    };
  }
};

/* ---------- JUNTA ---------- */
/* Los 10 equipos del club con su clasificación y su último resultado reales */
const teamsList = () => D.equipos.map(e => {
  const r = ourRow(e), l = lastMatch(e), n = nextMatch(e);
  const res = l ? outcome(l) : null;
  return `<button type="button" class="tm tm-btn" data-eq="${esc(e.nombre)}"><span class="k">${r ? r.pos + 'º' : '–'}</span><div class="grow"><b>${e.nombre}</b><small>${r ? r.pts + ' pts · ' : ''}${n ? 'Próximo: ' + dayLbl(n.fecha) + ' vs ' + esc(nice(n.rival)) : 'Sin próximos partidos'}</small></div>
    ${l ? `<span class="res ${res}" title="Último: ${esc(nice(l.rival))}">${scoreTxt(l)}</span>` : ''}</button>`;
}).join('');
/* Un aviso enviado con cuántos entrenadores lo han leído */
const sentRow = (n, del) => `<div class="rq"><span class="ic b">${ic('bell')}</span>
  <div class="grow"><b>${esc(n.title)}</b><small>${esc(n.body)}</small><div class="meter" role="img" aria-label="Leído por ${n.readBy} de ${n.total}"><i style="width:${n.total ? n.readBy / n.total * 100 : 0}%"></i></div></div>
  <span class="pill ${n.readBy === n.total ? '' : 'blue'}">${n.readBy} de ${n.total}</span>${del ? `<button type="button" class="btn red sm del" data-del="${n.id}" aria-label="Borrar el aviso ${esc(n.title)}">${ic('trash')} Borrar aviso</button>` : ''}</div>`;
const coachCount = () => S.people.filter(p => p.rol === 'entrenador').length;
const teamOf = id => (D.equipos.find(e => e.id === id) || {}).nombre || id;
/* Entrenadores y junta con sus equipos; alta de cuentas nuevas */
function peopleCard() {
  return card('h-pp', `Entrenadores y accesos · ${S.people.length}`, (S.people.length ? S.people.map(p => `<div class="tm">${avatar(p, 'av')}
    <div class="grow"><b title="${esc(p.nombre)}">${esc(p.nombre)}</b><small title="${esc(p.usuario)}">${p.rol === 'junta' ? 'Junta directiva' : p.equipos.length ? p.equipos.map(teamOf).join(', ') : 'Sin equipo asignado'} · ${esc(p.usuario)}</small></div>
    <button type="button" class="more" data-pw="${p.id}" aria-label="Editar a ${esc(p.nombre)}">Editar</button></div>`).join('') : '<p class="muted" style="margin:0">Aún no hay nadie dado de alta.</p>'),
    'a-people', `<button type="button" class="btn blue sm" data-go="team:alta">${ic('plus')} Dar de alta</button>`);
}
function bindPeople() {
  document.querySelectorAll('[data-pw]').forEach(b => b.onclick = () => go('team', 'pw:' + b.dataset.pw));
}
function claveForm(p) {
  return `<form id="cf" class="card stack" novalidate>
    <div class="form2"><div class="stack"><h2 class="fh">Foto</h2><p style="margin:0">Entra con “${esc(p.usuario)}”.</p>
    ${photoField(p.foto, p.nombre)}</div>
    <div class="stack"><h2 class="fh">${p.rol === 'entrenador' ? 'Contraseña y equipos' : 'Contraseña'}</h2><label class="f" for="cp">Contraseña nueva<span class="hint">Déjala vacía para no cambiarla</span><input type="text" id="cp" autocomplete="off" autocapitalize="none" spellcheck="false"></label>
    ${p.rol === 'entrenador' ? `<fieldset class="f" id="ceq"><legend>Sus equipos</legend><div class="chips">${D.equipos.map(e => `<label class="chip"><input type="checkbox" value="${e.id}"${p.equipos.includes(e.id) ? ' checked' : ''}> ${esc(e.nombre)}</label>`).join('')}</div></fieldset>` : ''}</div></div>
    <p id="cerr" class="err" role="alert" hidden></p>
    <button type="submit" class="btn blue block">${ic('check')} Guardar</button>
    ${p.id !== S.me.id ? `<button type="button" class="btn red block" id="cdel">${ic('trash')} Borrar a ${esc(p.nombre.split(' ')[0])} y su acceso</button>` : ''}</form>`;
}
function bindClave(p) {
  /* Borrar la cuenta: deja de poder entrar; sus peticiones se quedan en la bandeja */
  if ($('#cdel')) $('#cdel').onclick = async () => {
    if (!(await ask(`¿Borrar a ${p.nombre}?`, `Ya no podrá entrar en la app con “${p.usuario}”. Sus peticiones se quedan en la bandeja. No se puede deshacer.`, 'Sí, borrar'))) return;
    try { API() && await API().borrarUsuario(p.id); } catch (_) { $('#cerr').textContent = 'No se ha podido borrar. Revisa la conexión.'; $('#cerr').hidden = false; return; }
    S.people = S.people.filter(x => x !== p); go('team'); say(`${p.nombre} ya no tiene acceso a la app.`);
  };
  const st = { foto: p.foto };
  bindPhoto(st);
  $('#cf').onsubmit = async e => {
    e.preventDefault();
    const pw = $('#cp').value, err = m => { $('#cerr').textContent = m; $('#cerr').hidden = false; };
    if (pw && pw.length < 8) return err('La contraseña debe tener al menos 8 caracteres.');
    const eqs = $('#ceq') ? [...document.querySelectorAll('#ceq input:checked')].map(x => x.value) : p.equipos;
    if ($('#ceq') && !eqs.length) return err('Marca al menos un equipo.');
    const cambiaEq = [...eqs].sort().join() !== [...p.equipos].sort().join();
    try {
      if (pw && API()) await API().clave(p.id, pw);
      if (st.foto !== p.foto && API()) await API().foto(p.id, st.foto);
      if (cambiaEq && API()) await API().equipos(p.id, eqs);
    } catch (_) { return err('No se ha podido guardar. Revisa la conexión.'); }
    p.foto = st.foto; p.equipos = eqs; if (p.id === S.me.id) S.me.foto = st.foto;
    go('team'); say(pw ? `Guardado. Dale la contraseña nueva a ${p.nombre.split(' ')[0]}.` : 'Guardado.');
  };
}
function altaForm() {
  return `<form id="af" class="card stack" novalidate>
    <div class="form2"><div class="stack"><h2 class="fh">Datos y acceso</h2>
    ${photoField(null, '')}
    <label class="f" for="an">Nombre y apellidos<input type="text" id="an" autocomplete="off" required></label>
    <label class="f" for="au">Usuario o correo<span class="hint">Sin correo: p. ej. manolo.alevin</span><input type="text" id="au" autocomplete="off" autocapitalize="none" spellcheck="false" required></label>
    <label class="f" for="ap">Contraseña<span class="hint">Mínimo 8 caracteres</span><input type="text" id="ap" autocomplete="off" autocapitalize="none" spellcheck="false" required></label></div>
    <div class="stack"><h2 class="fh">Permisos</h2><fieldset class="f"><legend>Acceso</legend><div class="chips" role="radiogroup">
      <label class="chip"><input type="radio" name="ar" value="entrenador" checked> Entrenador</label>
      <label class="chip"><input type="radio" name="ar" value="junta"> Junta</label></div></fieldset>
    <fieldset class="f" id="aeq"><legend>Sus equipos</legend><div class="chips">${D.equipos.map(e => `<label class="chip"><input type="checkbox" value="${e.id}"> ${esc(e.nombre)}</label>`).join('')}</div></fieldset></div></div>
    <p id="aerr" class="err" role="alert" hidden></p>
    <button type="submit" class="btn blue block">${ic('check')} Dar de alta</button></form>`;
}
function bindAlta() {
  const f = $('#af'), st = { foto: null };
  bindPhoto(st);
  f.querySelectorAll('[name=ar]').forEach(r => r.onchange = () => { $('#aeq').hidden = f.querySelector('[name=ar]:checked').value === 'junta'; });
  f.onsubmit = async e => {
    e.preventDefault();
    const err = m => { $('#aerr').textContent = m; $('#aerr').hidden = false; };
    const rol = f.querySelector('[name=ar]:checked').value;
    const p = { nombre: $('#an').value.trim(), usuario: $('#au').value.trim().toLowerCase(), clave: $('#ap').value, rol,
      equipos: rol === 'junta' ? [] : [...f.querySelectorAll('#aeq input:checked')].map(x => x.value) };
    if (!p.nombre) return err('Escribe el nombre.');
    if (!/^[a-z0-9._@-]{3,}$/.test(p.usuario)) return err('El usuario solo puede llevar letras sin tilde, números y puntos (mínimo 3).');
    if (p.clave.length < 8) return err('La contraseña debe tener al menos 8 caracteres.');
    if (rol === 'entrenador' && !p.equipos.length) return err('Marca al menos un equipo.');
    try { p.id = API() ? await API().alta(p) : String(Date.now()); } catch (x) { return err(/existe/.test(x.message) ? 'Ese usuario ya existe. Elige otro.' : 'No se ha podido dar de alta. Revisa la conexión.'); }
    if (st.foto) try { API() && await API().foto(p.id, st.foto); } catch (_) { st.foto = null; say('Alta hecha, pero la foto no se ha guardado. Súbela desde “Editar”.'); }
    S.people.push({ id: p.id, nombre: p.nombre, usuario: p.usuario, rol, equipos: p.equipos, foto: st.foto });
    go('team'); say(`${p.nombre} ya puede entrar con “${p.usuario}” y su contraseña.`);
  };
}
/* Junta: quién entrena cada día, por horas (un día o la semana entera) */
function trainSessions() {
  return D.equipos.map(e => e.nombre).concat(Object.keys(S.teams).filter(n => !EQ[n]))
    .flatMap(team => sesiones(trainOf(team)).map(x => ({ team, d: x.d, h: x.h || '', where: x.where || '' })));
}
/* Calendario de la junta: entrenamientos (cada semana igual) y partidos de todos los equipos, semana a semana */
const teamOrd = n => { const i = ORDEN.indexOf((EQ[n] || {}).id); return i < 0 ? 99 : i; };
function calItems(wk) {
  const end = addDays(wk, 6);
  const tr = trainSessions().map(x => ({ kind: 'tr', f: addDays(wk, x.d - 1), h: x.h, team: x.team, where: x.where || 'Sin campo', anul: anulado(x.team, addDays(wk, x.d - 1)) }));
  const pa = D.equipos.flatMap(e => e.partidos.filter(p => !p.descansa && !p.nojuega && p.fecha && p.fecha >= wk && p.fecha <= end)
    .map(p => ({ kind: 'pa', f: p.fecha, h: p.hora || '', team: e.nombre, rival: nice(p.rival), casa: !!p.casa, where: placeOf(p) || '', e, p })));
  return [...tr, ...pa].sort((a, b) => a.f.localeCompare(b.f) || (a.h || '99').localeCompare(b.h || '99') || (a.kind === 'pa' ? 0 : 1) - (b.kind === 'pa' ? 0 : 1) || teamOrd(a.team) - teamOrd(b.team));
}
const calWeekLbl = wk => { const a = toDate(wk), z = toDate(addDays(wk, 6));
  return a.getMonth() === z.getMonth() ? `${a.getDate()} – ${z.getDate()} ${MES[z.getMonth()]}` : `${a.getDate()} ${MES[a.getMonth()]} – ${z.getDate()} ${MES[z.getMonth()]}`; };
function trainView() {
  const now = weekOf(TODAY), wk = S.calWk || now, all = calItems(wk);
  const sel = S.ttDay || (wk === now ? String(dow(TODAY)) : 'week');
  const dayIso = i => addDays(wk, i);
  const nav = `<div class="wk-nav card">
      <button type="button" class="iconbtn" data-cw="${addDays(wk, -7)}" aria-label="Semana anterior">${ic('back')}</button>
      <div class="wk-t"><small>${wk === now ? 'Esta semana' : wk === addDays(now, 7) ? 'La semana que viene' : wk === addDays(now, -7) ? 'La semana pasada' : wk < now ? 'Semana pasada' : 'Próximamente'}</small><b>${calWeekLbl(wk)}</b></div>
      <button type="button" class="iconbtn" data-cw="${addDays(wk, 7)}" aria-label="Semana siguiente">${ic('chev')}</button>
      ${wk !== now ? `<button type="button" class="more wk-now" data-cw="${now}">Volver a esta semana</button>` : ''}</div>`;
  const seg = `<div class="seg g-scope seg-x" role="group" aria-label="Elige el día">
    <button type="button" data-tt="week" aria-pressed="${sel === 'week'}">Semana</button>${DIAS.map((d, i) =>
    `<button type="button" data-tt="${i + 1}" aria-pressed="${sel === String(i + 1)}">${d} ${toDate(dayIso(i)).getDate()}</button>`).join('')}</div>`;
  const nTr = all.filter(x => x.kind === 'tr' && !x.anul).length, nPa = all.filter(x => x.kind === 'pa').length;
  const top = `${nav}<div class="cal-bar">${seg}<button type="button" class="btn blue" id="calx" data-day="${sel}"${(sel === 'week' ? all : all.filter(x => x.f === dayIso(+sel - 1))).length ? '' : ' disabled'}>${ic('send')} ${sel === 'week' ? 'Exportar semana' : 'Exportar día'}</button></div>
    <p class="muted cal-key"><span class="tt-dot"></span>Entrenamientos · ${nTr}<span class="tt-dot pa"></span>Partidos · ${nPa}</p>
    <p class="muted cal-tip">Toca un entrenamiento para anularlo esta semana.</p>`;
  if (!all.length) return top + emptyPage('cal', 'Nada esta semana', 'No hay entrenamientos ni partidos. Usa las flechas para ver otra semana.', 'g');
  const endOf = x => x.h ? hhmm(hm2min(x.h) + (x.kind === 'tr' ? trainMin(x.team) : matchMin(x.team))) : '';
  const span = x => x.h ? `${x.h}–${endOf(x)}` : 'Sin hora';
  /* Una cita dentro de la tabla: la hora en grande y debajo el campo (o el rival con los escudos) */
  const chip = (x, withTeam) => {
    const tm = withTeam ? `<b class="tt-tm" title="${esc(x.team)}">${esc(x.team)}</b>` : '';
    if (x.kind === 'tr') return `<div class="tt-c${x.anul ? ' anul' : ''}" data-anu="${esc(x.team)}|${x.f}" role="button" tabindex="0" aria-label="${x.anul ? 'Entrenamiento anulado' : 'Entrenamiento'} del ${esc(x.team)}, ${span(x)}. Toca para ${x.anul ? 'recuperarlo' : 'anularlo'}">
      ${tm}<b class="tt-t">${span(x)}</b><small>${x.anul ? 'Anulado' : esc(x.where)}</small></div>`;
    const us = crestBadge(x.e, 'Aznalcóllar', 'mini tt-cr'), them = crestBadge(x.e, x.p.rival, 'mini tt-cr');
    return `<div class="tt-c pa" data-match="${x.e.id}|${x.p.j}" role="button" tabindex="0" aria-label="Partido del ${esc(x.team)} contra ${esc(x.rival)}, ${span(x)}">
      ${tm}<b class="tt-t">${span(x)}</b><span class="tt-vs">${x.casa ? us + them : them + us}<small>${x.p.goles ? `${scoreTxt(x.p)} · ` : ''}${x.casa ? 'Local' : 'Visitante'}</small></span><small title="${esc(x.rival)}">${esc(x.rival)}</small></div>`;
  };
  const teamsOf = list => [...new Set(list.map(x => x.team))].sort((a, b) => teamOrd(a) - teamOrd(b));
  /* Un día en el ordenador: una fila por equipo y las horas en horizontal; cada cita ocupa todo su tiempo */
  const dayGantt = list => {
    const timed = list.filter(x => x.h).map(x => ({ ...x, a: hm2min(x.h), z: hm2min(endOf(x)) })), loose = list.filter(x => !x.h);
    const t0 = timed.length ? Math.floor(Math.min(...timed.map(x => x.a)) / 60) * 60 : 0, t1 = timed.length ? Math.ceil(Math.max(...timed.map(x => x.z)) / 60) * 60 : 60;
    const n = (t1 - t0) / 30, pc = m => (m - t0) / (t1 - t0) * 100;
    return `<div class="gt" role="table" aria-label="Calendario del día por equipos" style="--n:${n}">
      <div class="gt-r gt-th" role="row"><span role="columnheader">Equipo</span><span class="gt-ax" role="columnheader">${Array.from({ length: n }, (_, k) => `<i>${hhmm(t0 + k * 30)}</i>`).join('')}</span></div>
      ${teamsOf(list).map(t => { const mine = calLanes(timed.filter(x => x.team === t)), sin = loose.filter(x => x.team === t);
        /* Un partido lleva una línea más (escudos y rival), así que su fila es más alta */
        const LH = mine.some(x => x.kind === 'pa') ? 120 : 76;
        return `<div class="gt-r" role="row"><span class="pl-tm" role="rowheader" title="${esc(t)}"><span>${esc(t)}</span></span><span class="gt-tl" role="cell" style="height:${Math.max(1, ...mine.map(x => x.n)) * LH + (sin.length ? 70 : 0)}px">
          ${mine.map(x => `<span class="gt-ev" style="left:${pc(x.a)}%;width:${pc(x.z) - pc(x.a)}%;top:${x.lane * LH}px;height:${LH}px">${chip(x)}</span>`).join('')}
          ${sin.length ? `<span class="gt-sin">${sin.map(x => chip(x)).join('')}</span>` : ''}</span></div>`; }).join('')}</div>`;
  };
  /* En el móvil y la tableta: lista por horas, con el principio y el final de cada cita */
  const dayList = list => `<div class="tl">${list.map(x => `<div class="tl-r"><span class="tl-t">${x.h ? `<b>${x.h}</b><small>${endOf(x)}</small>` : '<small>Sin hora</small>'}</span>${chip(x, true)}</div>`).join('')}</div>`;
  const SHORT = { senior: 'Senior', juvenil: 'Juvenil', cadete: 'Cadete', infantil: 'Infantil', alevin2: 'Alevín 2º', alevin1: 'Alevín 1º', benjamin2: 'Benjamín 2º', benjamin1: 'Benjamín 1º', prebenjamin: 'Prebenj. 2º', minis: 'Minis' };
  const shortT = t => SHORT[(EQ[t] || {}).id] || t;
  /* Semana en el ordenador: una fila por hora de empiece y una columna por día; cada cita dice hasta qué hora dura */
  const hsCell = x => {
    if (x.kind === 'tr') return `<div class="hs-c${x.anul ? ' anul' : ''}" role="button" tabindex="0" data-anu="${esc(x.team)}|${x.f}" aria-label="${x.anul ? 'Entrenamiento anulado' : 'Entrenamiento'} del ${esc(x.team)}, ${span(x)}. Toca para ${x.anul ? 'recuperarlo' : 'anularlo'}">
      <b title="${esc(x.team)}">${esc(shortT(x.team))}</b><small>${x.anul ? 'Anulado' : `hasta ${endOf(x)} · ${esc(x.where)}`}</small></div>`;
    const us = crestBadge(x.e, 'Aznalcóllar', 'mini tt-cr'), them = crestBadge(x.e, x.p.rival, 'mini tt-cr');
    return `<div class="hs-c pa" role="button" tabindex="0" data-match="${x.e.id}|${x.p.j}" aria-label="Partido del ${esc(x.team)} contra ${esc(x.rival)}, ${span(x)}">
      <b title="${esc(x.team)}">${esc(shortT(x.team))}</b><small>${x.p.goles ? `${scoreTxt(x.p)} · ` : ''}${x.casa ? 'Local' : 'Visitante'}${x.h ? ` · hasta ${endOf(x)}` : ''}</small>
      <span class="tt-vs">${x.casa ? us + them : them + us}<small title="${esc(x.rival)}">${esc(x.rival)}</small></span></div>`;
  };
  const weekStarts = () => { const hs = [...new Set(all.map(x => x.h))].sort((a, b) => (a || '99').localeCompare(b || '99'));
    return `<div class="pl hs" role="table" aria-label="Calendario de la semana por hora de empiece"><div class="pl-r pl-th" role="row"><span role="columnheader">Empieza</span>${DIAS_D.map((d, i) => `<span role="columnheader"${dayIso(i) === TODAY ? ' class="hoy"' : ''}>${d} ${toDate(dayIso(i)).getDate()}</span>`).join('')}</div>
      ${hs.map(h => `<div class="pl-r" role="row"><span class="pl-tm hs-h" role="rowheader"><span>${h || 'Sin hora'}</span></span>${DIAS.map((_, i) => `<span role="cell"${dayIso(i) === TODAY ? ' class="hoy"' : ''}>${all.filter(x => x.h === h && x.f === dayIso(i)).map(hsCell).join('')}</span>`).join('')}</div>`).join('')}</div>`; };
  if (sel !== 'week') {
    const d = +sel, list = all.filter(x => x.f === dayIso(d - 1));
    if (!list.length) return `${top}${emptyPage('cal', `Nada el ${DIAS_D[d - 1].toLowerCase()}`, 'Elige otro día o mira la semana entera.', 'g')}`;
    const h = `${DIAS_D[d - 1]} ${toDate(dayIso(d - 1)).getDate()} · ${list.length} ${list.length === 1 ? 'cita' : 'citas'}`;
    return `${top}<div class="tt-desk">${card('h-tt', h, dayGantt(list))}</div><div class="tt-mob">${card('h-ttm', h, dayList(list))}</div>`;
  }
  const days = DIAS_D.map((dn, i) => ({ dn: `${dn} ${toDate(dayIso(i)).getDate()}`, list: all.filter(x => x.f === dayIso(i)) })).filter(x => x.list.length);
  return `${top}<div class="tt-desk">${card('h-ttw', 'Semana por hora de empiece', weekStarts())}</div>
    <div class="tt-mob stack">${days.map((x, i) => card(`h-tt${i}`, `${x.dn} · ${x.list.length} ${x.list.length === 1 ? 'cita' : 'citas'}`, dayList(x.list))).join('')}</div>`;
}
/* Imagen del calendario tal como se ve en el ordenador: la semana por hora de empiece (una fila por hora, una columna por día)
   o un día (una fila por equipo y las horas en horizontal; cada cita ocupa todo su tiempo) */
async function calPoster(wk, day) {
  await Promise.all(['800 60px Outfit', '700 40px Outfit', '500 30px Outfit'].map(f => document.fonts.load(f).catch(() => {})));
  const all = calItems(wk).filter(it => !day || it.f === day);
  const endOf = it => it.h ? hhmm(hm2min(it.h) + (it.kind === 'tr' ? trainMin(it.team) : matchMin(it.team))) : '';
  const SHORT = { prebenjamin: 'Prebenj. 2º' }, shortT = t => SHORT[(EQ[t] || {}).id] || t.replace(' año', '');
  const BLUE = '#0034DF', SOFT = '#E6EBFD', INK = '#0B0B0B', MUTED = '#5B6475', LINE = '#BFC6D4', HEADBG = '#F3F5F9', BG = '#EEF1F7', BAD = '#FDE7EA', BADINK = '#B42318';
  const W = 2200, PAD = 40, HEAD = 190;
  const cv = document.createElement('canvas'), x = cv.getContext('2d');
  const font = (w, px) => `${w} ${px}px Outfit, system-ui, sans-serif`;
  const text = (t, tx, y, w, px, color, maxW, align = 'left', strike) => {
    x.font = font(w, px);
    if (x.measureText(t).width > maxW) { while (t.length > 1 && x.measureText(t + '…').width > maxW) t = t.slice(0, -1); t += '…'; }
    x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(t, tx, y);
    if (strike) { const tw = x.measureText(t).width, sx = align === 'center' ? tx - tw / 2 : tx; x.fillRect(sx, y - 1, tw, 3); }
  };
  const path = (rx, ry, rw, rh, rad) => { rad = Math.min(rad, rh / 2, rw / 2); x.beginPath(); x.moveTo(rx + rad, ry); x.arcTo(rx + rw, ry, rx + rw, ry + rh, rad); x.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
    x.arcTo(rx, ry + rh, rx, ry, rad); x.arcTo(rx, ry, rx + rw, ry, rad); x.closePath(); };
  const rr = (rx, ry, rw, rh, rad, color) => { path(rx, ry, rw, rh, rad); x.fillStyle = color; x.fill(); };
  const line = (x1, y1, x2, y2, c = LINE, lw = 2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.strokeStyle = c; x.lineWidth = lw; x.stroke(); };
  const crest = await loadImg(crestBig()), crests = {};
  await Promise.all([...new Set(all.filter(it => it.kind === 'pa').map(it => crestOf(it.e, it.p.rival)).filter(Boolean))].map(async src => { crests[src] = await loadImg(src); }));
  const badge = (img, cx, cy, sz) => { x.beginPath(); x.arc(cx, cy, sz / 2 + 4, 0, Math.PI * 2); x.fillStyle = '#FFFFFF'; x.fill();
    if (img) { const k = Math.min(sz / img.width, sz / img.height); x.drawImage(img, cx - img.width * k / 2, cy - img.height * k / 2, img.width * k, img.height * k); } };
  /* Una tarjeta como en la pantalla: entrenamiento en azul claro, partido con borde azul y escudos, anulado en rojo claro */
  const cardH = it => it.kind === 'pa' ? 120 : 76;
  const block = (it, bx, by, bw, bh, sub) => {
    const pa = it.kind === 'pa';
    rr(bx, by, bw, bh, 14, it.anul ? BAD : SOFT); if (pa) { path(bx, by, bw, bh, 14); x.strokeStyle = BLUE; x.lineWidth = 3; x.stroke(); }
    const ix = bx + 14, iw = bw - 26;
    text(shortT(it.team), ix, by + 26, 700, 25, pa ? BLUE : it.anul ? MUTED : INK, iw, 'left', it.anul);
    if (it.anul) return text('Anulado', ix, by + 54, 500, 20, BADINK, iw);
    text(sub(it), ix, by + 54, 500, 20, MUTED, iw);
    if (pa && bh >= 110) { const th = crests[crestOf(it.e, it.p.rival)] || null, [l, v] = it.casa ? [crest, th] : [th, crest];
      badge(l, ix + 13, by + 90, 22); badge(v, ix + 45, by + 90, 22); text(it.rival, ix + 68, by + 90, 600, 20, BLUE, iw - 68); }
  };
  const header = (title, H) => {
    x.fillStyle = BG; x.fillRect(0, 0, W, H);
    rr(PAD, PAD, W - PAD * 2, 120, 32, BLUE);
    if (crest) { const k = Math.min(84 / crest.width, 84 / crest.height); x.drawImage(crest, PAD + 36, PAD + 60 - crest.height * k / 2, crest.width * k, crest.height * k); }
    text('C.D. Aznalcóllar Fútbol Base', PAD + 150, PAD + 40, 600, 26, '#FFFFFF', 900);
    text(title, PAD + 150, PAD + 82, 800, 40, '#FFFFFF', 1300);
    rr(W - PAD - 470, PAD + 46, 28, 28, 7, SOFT); text('Entrenamiento', W - PAD - 430, PAD + 60, 700, 24, '#FFFFFF', 220);
    rr(W - PAD - 190, PAD + 46, 28, 28, 7, SOFT); path(W - PAD - 187, PAD + 49, 22, 22, 5); x.strokeStyle = BLUE; x.lineWidth = 4; x.stroke(); text('Partido', W - PAD - 150, PAD + 60, 700, 24, '#FFFFFF', 120);
  };
  const TH = 64, CP = 10;
  if (!day) {
    /* Semana: una fila por hora de empiece; cada fila tan alta como su celda más llena */
    const FC = 150, COLW = (W - PAD * 2 - FC) / 7, X0 = PAD + FC;
    const hs = [...new Set(all.map(it => it.h))].sort((a, b) => (a || '99').localeCompare(b || '99'));
    const rows = hs.map(h => { const cells = DIAS.map((_, i) => all.filter(it => it.h === h && it.f === addDays(wk, i)));
      return { h, cells, hgt: Math.max(...cells.map(c => c.reduce((s, it) => s + cardH(it) + CP, CP))) }; });
    const top = HEAD + TH, H = top + rows.reduce((s, r) => s + r.hgt, 0) + PAD + 2;
    cv.width = W; cv.height = H; header(`Calendario · semana del ${calWeekLbl(wk)}`, H);
    const TB = { x: PAD, y: HEAD, w: W - PAD * 2, h: H - HEAD - PAD };
    x.save(); path(TB.x, TB.y, TB.w, TB.h, 22); x.clip();
    x.fillStyle = '#FFFFFF'; x.fillRect(TB.x, TB.y, TB.w, TB.h);
    x.fillStyle = HEADBG; x.fillRect(TB.x, TB.y, TB.w, TH); x.fillRect(TB.x, TB.y, FC, TB.h);
    text('Empieza', PAD + FC / 2, HEAD + TH / 2, 700, 24, INK, FC - 16, 'center');
    DIAS_D.forEach((dn, i) => { const f = addDays(wk, i); text(`${dn} ${toDate(f).getDate()}`, X0 + i * COLW + COLW / 2, HEAD + TH / 2, 700, 24, INK, COLW - 16, 'center'); });
    let y = top;
    rows.forEach(r => { line(TB.x, y, TB.x + TB.w, y);
      text(r.h || 'Sin hora', PAD + FC / 2, y + r.hgt / 2, 800, r.h ? 30 : 22, BLUE, FC - 16, 'center');
      r.cells.forEach((c, i) => { let cy = y + CP; c.forEach(it => { block(it, X0 + i * COLW + CP, cy, COLW - CP * 2, cardH(it),
        it2 => it2.kind === 'pa' ? `${it2.p.goles ? scoreTxt(it2.p) + ' · ' : ''}${it2.casa ? 'Local' : 'Visitante'}${it2.h ? ' · hasta ' + endOf(it2) : ''}` : `hasta ${endOf(it2)} · ${it2.where}`); cy += cardH(it) + CP; }); });
      y += r.hgt; });
    line(TB.x, top, TB.x + TB.w, top);
    for (let i = 0; i <= 7; i++) line(X0 + i * COLW, TB.y, X0 + i * COLW, TB.y + TB.h);
    x.restore(); path(TB.x, TB.y, TB.w, TB.h, 22); x.strokeStyle = LINE; x.lineWidth = 2; x.stroke();
    return new Promise(ok => cv.toBlob(b => ok(b), 'image/png'));
  }
  /* Un día: una fila por equipo y las horas en horizontal, en casillas de media hora */
  const timed = all.filter(it => it.h).map(it => ({ ...it, a: hm2min(it.h), z: hm2min(endOf(it)) })), loose = all.filter(it => !it.h);
  const t0 = timed.length ? Math.floor(Math.min(...timed.map(t => t.a)) / 60) * 60 : 960, t1 = timed.length ? Math.ceil(Math.max(...timed.map(t => t.z)) / 60) * 60 : 1020;
  const FC = 260, n = (t1 - t0) / 30, X0 = PAD + FC, SW = (W - PAD * 2 - FC) / n, px = m => X0 + (m - t0) / 30 * SW;
  const teams = [...new Set(all.map(it => it.team))].sort((a, b) => teamOrd(a) - teamOrd(b));
  const rows = teams.map(t => { const mine = calLanes(timed.filter(it => it.team === t)), sin = loose.filter(it => it.team === t);
    const lane = Math.max(...mine.map(it => cardH(it)), 76) + CP * 2; return { t, mine, sin, lane, hgt: Math.max(1, ...mine.map(it => it.n)) * lane + (sin.length ? 96 : 0) }; });
  const top = HEAD + TH, H = top + rows.reduce((s, r) => s + r.hgt, 0) + PAD + 2;
  cv.width = W; cv.height = H; header(`Calendario · ${longDate(day)}`, H);
  const TB = { x: PAD, y: HEAD, w: W - PAD * 2, h: H - HEAD - PAD };
  x.save(); path(TB.x, TB.y, TB.w, TB.h, 22); x.clip();
  x.fillStyle = '#FFFFFF'; x.fillRect(TB.x, TB.y, TB.w, TB.h);
  x.fillStyle = HEADBG; x.fillRect(TB.x, TB.y, TB.w, TH); x.fillRect(TB.x, TB.y, FC, TB.h);
  text('Equipo', PAD + FC / 2, HEAD + TH / 2, 700, 24, INK, FC - 16, 'center');
  for (let k = 0; k < n; k++) text(hhmm(t0 + k * 30), X0 + k * SW + SW / 2, HEAD + TH / 2, 800, 21, BLUE, SW - 6, 'center');
  for (let k = 0; k <= n; k++) line(X0 + k * SW, TB.y, X0 + k * SW, TB.y + TB.h);
  let y = top;
  rows.forEach(r => { line(TB.x, y, TB.x + TB.w, y);
    text(r.t, PAD + 18, y + r.hgt / 2, 700, 25, INK, FC - 30);
    r.mine.forEach(it => block(it, px(it.a) + 5, y + it.lane * r.lane + CP, px(it.z) - px(it.a) - 10, cardH(it),
      it2 => it2.kind === 'pa' ? `${it2.h}–${endOf(it2)} · ${it2.casa ? 'Local' : 'Visitante'}` : `${it2.h}–${endOf(it2)} · ${it2.where}`));
    r.sin.forEach((it, k) => block(it, X0 + CP + k * 330, y + r.hgt - 96 + CP, 320, 76, () => 'Sin hora'));
    y += r.hgt; });
  line(TB.x, top, TB.x + TB.w, top);
  x.restore(); path(TB.x, TB.y, TB.w, TB.h, 22); x.strokeStyle = LINE; x.lineWidth = 2; x.stroke();
  return new Promise(ok => cv.toBlob(b => ok(b), 'image/png'));
}
function gamesScreen() {
  return { kicker: S.role === 'coach' ? 'Fines de semana' : 'Todos los equipos', title: 'Partidos', body: gamesView(),
    bind() {
      document.querySelectorAll('[data-wk]').forEach(b => b.onclick = () => { if (b.dataset.wk) { S.wk = b.dataset.wk; render(); } });
      document.querySelectorAll('[data-gs]').forEach(b => b.onclick = () => { S.gscope = b.dataset.gs; S.wk = null; render(); });
      document.querySelectorAll('[data-gv]').forEach(b => b.onclick = () => { S.gvenue = b.dataset.gv; render(); });
    } };
}
const BOARD = {
  opts: optsScreen,
  home() {
    const open = S.requests.filter(r => r.st < 3);
    const order = [...S.requests].sort((a, b) => (a.st === 3) - (b.st === 3) || b.urgent - a.urgent || a.st - b.st);
    return {
      kicker: `${greet()}, ${esc(firstName())}`, title: 'Bandeja de la junta',
      body: `${pushCard()}<div class="grid board-home">
        <div class="kpis a-kpis">
          <div class="kpi dark"><small>Abiertas</small><b>${open.length}</b></div>
          <div class="kpi ${open.some(r => r.urgent) ? 'alert' : ''}"><small>Urgentes</small><b>${open.filter(r => r.urgent).length}</b></div>
          <div class="kpi"><small>Sin ver</small><b>${S.requests.filter(r => r.st === 0).length}</b></div>
          <div class="kpi"><small>Resueltas</small><b>${S.requests.filter(r => r.st === 3).length}</b></div></div>
        ${card('h-in', 'Peticiones recibidas', '<div class="scroll">' + (order.length ? order.map(r => reqRow(r, `<div class="ctl"><label for="s${r.id}">Estado</label>
          <select id="s${r.id}" data-st="${r.id}">${STATES.map((s, i) => `<option value="${i}" ${i === r.st ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`)).join('')
          : `<div class="empty">${ic('inbox')}<b>No hay peticiones</b><small>Cuando un entrenador pida algo o avise de una incidencia, aparecerá aquí.</small></div>`) + '</div>', 'a-inbox')}
        ${card('h-tm', 'Nuestros equipos', `<div class="scroll">${teamsList()}</div>`, 'a-teams', '<button type="button" class="more" data-go="team">Ver todos</button>')}
        ${noticeCard(S.notices[0], 'a-notice')}
      </div>`,
      bind() { document.querySelectorAll('[data-st]').forEach(s => s.onchange = () => {
        const r = S.requests.find(x => x.id == s.dataset.st); const prev = r.st; r.st = +s.value; render();
        API() && API().estado(r.id, r.st).catch(() => { r.st = prev; render(); say('No se ha podido guardar. Revisa la conexión.'); });
        say(`“${r.title}” pasa a ${STATES[r.st]}. ${r.by} lo verá en su móvil.`, () => { r.st = prev; API() && API().estado(r.id, prev); }); }); }
    };
  },
  team() {
    if (S.sub === 'alta') return { kicker: 'Equipos · Accesos', title: 'Dar de alta', back: () => go('team'), body: altaForm(), bind: bindAlta };
    if (S.sub && S.sub.startsWith('pw:')) {
      const p = S.people.find(x => x.id === S.sub.slice(3));
      return { kicker: 'Equipos · Accesos', title: esc(p.nombre), back: () => go('team'), body: claveForm(p), bind: () => bindClave(p) };
    }
    if (S.sub && S.sub.startsWith('fp:')) { const team = S.sub.slice(3); return fpScreen(team, () => S.fpFrom && S.fpFrom !== 'team' ? go(S.fpFrom) : go('team', 'eq:' + team)); }
    if (S.sub && S.sub.startsWith('lv:')) { const team = S.sub.slice(3); return lvScreen(team, () => S.lvFrom && S.lvFrom !== 'team' ? go(S.lvFrom) : go('team', 'eq:' + team)); }
    if (S.sub && S.sub.startsWith('st:')) { const team = S.sub.slice(3); return stScreen(team, () => go('team', 'eq:' + team)); }
    if (S.sub && S.sub.startsWith('eq:')) {
      const team = S.sub.slice(3);
      S.teams[team] = S.teams[team] || { cat: (EQ[team] || {}).cat || '', train: null, players: [] };
      return { kicker: `Equipos · ${EQ[team] ? EQ[team].cat : ''}`, title: esc(team), back: () => go('team'),
        body: `<div class="stack"><div class="team-top">${trainCard(team)}${addPlayerCard(team)}</div><div class="team-top">${modCard(team)}${durCard(team)}</div>${rosterCard(team)}${statsView(team)}</div>`, bind: () => { bindTrain(team); bindRoster(team); bindDur(team); bindMod(team); bindStats(team); } };
    }
    const view = S.eqView === 'train' ? 'train' : 'teams';
    const vseg = `<div class="seg g-scope" role="group" aria-label="Qué ver"><button type="button" data-eqv="teams" aria-pressed="${view === 'teams'}">Equipos</button><button type="button" data-eqv="train" aria-pressed="${view === 'train'}">Calendario</button></div>`;
    const bindV = () => {
      document.querySelectorAll('[data-eqv]').forEach(b => b.onclick = () => { S.eqView = b.dataset.eqv; render(); });
      document.querySelectorAll('[data-tt]').forEach(b => b.onclick = () => { S.ttDay = b.dataset.tt; render(); });
      document.querySelectorAll('[data-cw]').forEach(b => b.onclick = () => { S.calWk = b.dataset.cw; render(); });
      if ($('#calx')) $('#calx').onclick = () => { const wk = S.calWk || weekOf(TODAY), d = $('#calx').dataset.day, f = d === 'week' ? null : addDays(wk, +d - 1);
        shareImage({ title: f ? 'Calendario del día' : 'Calendario de la semana', wait: 'Preparando la imagen…', build: () => calPoster(wk, f), name: fileName('calendario', 'club', f || wk),
          alt: f ? `Calendario del club, ${longDate(f)}` : `Calendario del club, semana del ${calWeekLbl(wk)}`, msg: '', what: 'la imagen' }); };
      bindMatches();
      document.querySelectorAll('[data-anu]').forEach(el => {
        const run = async () => {
          const [team, f] = el.dataset.anu.split('|'), off = anulado(team, f), day = longDate(f).toLowerCase();
          const okd = off ? await confirmar('¿Recuperar el entrenamiento?', `El ${team} vuelve a entrenar el ${day}. Su entrenador lo verá en la app.`, 'Sí, recuperar')
            : await ask('¿Anular este entrenamiento?', `El ${team} no entrenará el ${day}. Su entrenador lo verá en la app y ese día no tendrá que pasar lista.`, 'Sí, anular');
          if (!okd) return;
          try { API() && await API().anularEntreno(team, f, !off); } catch (_) { return say(S.live && S.anulOff ? 'Falta un paso en Supabase para poder anular entrenamientos.' : 'No se ha podido guardar. Revisa la conexión.'); }
          S.anulados = S.anulados || new Set(); off ? S.anulados.delete(`${team} ${f}`) : S.anulados.add(`${team} ${f}`);
          render(); say(off ? `Entrenamiento del ${team} recuperado.` : `Entrenamiento del ${team} anulado.`);
        };
        el.onclick = run; el.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); run(); } };
      });
      document.querySelectorAll('.seg-x [aria-pressed="true"]').forEach(b => { const s = b.parentElement; s.scrollLeft = b.offsetLeft - (s.clientWidth - b.offsetWidth) / 2; });
    };
    if (view === 'train') return { kicker: 'Club · Entrenamientos y partidos', title: 'Calendario', body: `<div class="stack">${vseg}${trainView()}</div>`, bind: bindV };
    const all = D.equipos.flatMap(e => played(e));
    const wins = all.filter(p => outcome(p) === 'G').length;
    const week = AGENDA.filter(x => x.kind === 'match');
    return {
      kicker: `Club · Temporada 2026/27 · actualizado ${updated()}`, title: 'Equipos',
      body: `<div class="stack">${vseg}<div class="kpis">
          <div class="kpi dark"><small>Equipos</small><b>${D.equipos.length}</b></div>
          <div class="kpi"><small>Partidos jugados</small><b>${all.length}</b></div>
          <div class="kpi"><small>Victorias</small><b>${wins}</b></div>
          <div class="kpi"><small>Partidos esta semana</small><b>${week.length}</b></div></div>
        ${peopleCard()}
        ${card('h-eq', 'Clasificación y plantillas', teamsList())}
        ${week.length ? card('h-wk', 'Partidos de los próximos 7 días', week.map(x => agendaRow(x, false)).join('')) : ''}</div>`,
      bind() { bindV(); bindPeople(); }
    };
  },
  ask() {
    return {
      kicker: 'Comunicación', title: 'Enviar un aviso',
      body: `<div class="duo"><form id="nf" class="card stack" novalidate>
        ${S.live ? `<p class="muted" style="margin:0">Lo recibirán todos los entrenadores (${coachCount()}).</p>`
          : `<label class="f" for="to">¿A quién?<select id="to"><option>Todos los entrenadores (24)</option><option>Fútbol base (14)</option><option>Categoría alevín (4)</option><option>Solo a Paco Martín</option></select></label>`}
        <label class="f" for="nt">Título<input type="text" id="nt" ${S.live ? 'placeholder="Por ejemplo: Reunión de entrenadores"' : 'value="Reunión de entrenadores"'}></label>
        <label class="f" for="nb">Mensaje<textarea id="nb">${S.live ? '' : 'El jueves 29 a las 20:30 en la sede. Hablaremos del torneo de Navidad.'}</textarea></label>
        <p id="nerr" class="err" role="alert" hidden>Escribe el mensaje.</p>
        <button type="submit" class="btn gold block">${ic('send')} Enviar aviso</button></form>
        ${card('h-last', 'Últimos avisos enviados', S.notices.length ? S.notices.slice(0, 4).map(n => sentRow(n)).join('') : '<p class="muted" style="margin:0">Aún no has enviado avisos.</p>', '', S.notices.length > 4 ? '<button type="button" class="more" data-go="msg">Ver todos</button>' : '')}</div>`,
      bind() { $('#nf').onsubmit = async e => { e.preventDefault();
        const n = { id: Date.now(), from: 'Junta directiva', title: $('#nt').value.trim() || 'Aviso', body: $('#nb').value.trim(), read: false, readBy: 0, total: S.live ? coachCount() : 24 };
        if (!n.body) { $('#nerr').hidden = false; $('#nb').focus(); return; }
        try { if (API()) n.id = await API().aviso(n); } catch (_) { say('No se ha podido enviar. Revisa la conexión.'); return; }
        S.notices.unshift(n);
        go('msg'); say('Aviso enviado. Verás quién lo ha leído.'); }; }
    };
  },
  games: gamesScreen,
  msg() {
    return {
      kicker: 'Comunicación', title: 'Avisos enviados',
      body: S.notices.length ? `<div class="cards-grid">${S.notices.map(n => `<section class="card sent" aria-label="${esc(n.title)}">${sentRow(n, true)}</section>`).join('')}</div>`
        : emptyPage('bell', 'Aún no has enviado avisos', 'Cuando envíes uno, aquí verás quién lo ha leído.', '', '<button type="button" class="btn blue" data-go="ask">' + ic('send') + ' Enviar un aviso</button>'),
      bind() { document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
        const n = S.notices.find(x => x.id == b.dataset.del);
        if (!(await ask(`¿Borrar “${n.title}”?`, 'Desaparecerá también de los móviles de los entrenadores. No se puede deshacer.', 'Sí, borrar'))) return;
        try { API() && await API().borrarAviso(n.id); } catch (_) { say('No se ha podido borrar. Revisa la conexión.'); return; }
        S.notices = S.notices.filter(x => x !== n); render(); say('Aviso borrado.'); }); }
    };
  }
};

function bindGo() {
  bindRequests();
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const [t, s] = b.dataset.go.split(':'); go(t, s || null); });
  document.querySelectorAll('[data-team-go]').forEach(b => b.onclick = () => { S.team = b.dataset.teamGo; go('team', 'list'); });
  document.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => go('team', 'eq:' + b.dataset.eq));
}

document.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab); });
if (window.SERVIDOR_ON) window.startServer();
else { load(); render(); window.splashOff && splashOff(); }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
