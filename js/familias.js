/* Zona de familias (padres y madres de los jugadores) y tienda del club.
   · Las familias ven partidos, calendario, resultados y clasificaciones de todos los equipos, y hacen pedidos en la tienda.
     No ven plantillas, asistencia, minutos, estadísticas ni nada interno (el servidor tampoco se lo da).
   · La junta, en su Bandeja, acepta a las familias, gestiona los productos y los pedidos y los exporta a Excel. */
(function () {
  /* Iconos que solo usa esta parte */
  I.phone = '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>';
  I.download = '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>';
  const euro = n => `${(+n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  const ESTADOS_PED = ['Recibido', 'Pedido al proveedor', 'Listo para recoger', 'Entregado'];
  const pedCls = st => ['blue', 'gold', '', 'grey'][st] || 'grey';
  const teamOrder = (a, b) => ORDEN.indexOf((EQ[a] || {}).id) - ORDEN.indexOf((EQ[b] || {}).id);
  const allTeams = () => D.equipos.slice().sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));
  const F = () => S.fam || { kids: [], teams: [], train: {}, cart: [], fotos: {} };
  const fecha = iso => { const d = new Date(iso); return `${d.getDate()} ${MES[d.getMonth()]} · ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  /* Tabla de goleadores oficial de la Federación Andaluza (competición y grupo de cada equipo de la RFAF) */
  const GOLEADORES = { senior: [48466186, 48466191], juvenil: [48466231, 48466242], infantil: [48466271, 48466273], alevin2: [48466388, 48466390],
    benjamin2: [48466406, 48466408], benjamin1: [48466406, 48466416], internacional: [48466530, 49641343] };
  const golUrl = id => GOLEADORES[id] ? `https://www.rfaf.es/pnfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000120&codcompeticion=${GOLEADORES[id][0]}&codgrupo=${GOLEADORES[id][1]}` : null;

  /* ---------- Entrenamientos de los equipos de la familia ---------- */
  const fTrain = team => { const t = F().train[team]; return t && t.dias.length ? t : null; };
  const fTrainAt = (team, iso) => { const t = fTrain(team); if (!t || !t.dias.includes(dow(iso)) || anulado(team, iso)) return null; return sesiones(t).find(x => x.d === dow(iso)) || { d: dow(iso), h: t.h, where: t.where }; };
  const trainTxt = t => { const ses = sesiones(t); if (!ses.length) return 'Sin días de entrenamiento todavía';
    const same = ses.every(x => x.h === ses[0].h && x.where === ses[0].where);
    return same ? `${ses.map(x => DIAS_L[x.d - 1]).join(' y ').replace(/s$/, 's')}${ses[0].h ? ' · ' + ses[0].h : ''}${ses[0].where ? ' · ' + ses[0].where : ''}`
      : ses.map(x => `${DIAS[x.d - 1]} ${x.h || ''}${x.where ? ' (' + x.where + ')' : ''}`.trim()).join(' · '); };
  function fAgenda() {
    const ev = [];
    for (const team of F().teams) WEEK.forEach((iso, i) => { const t = fTrainAt(team, iso); if (t) ev.push({ iso, day: i === 0 ? 'Hoy' : dayLbl(iso), h: t.h || '--:--', kind: 'train', team, where: t.where || '' }); });
    for (const e of D.equipos) if (F().teams.includes(e.nombre)) for (const p of e.partidos)
      if (!p.descansa && !p.nojuega && p.fecha >= WEEK[0] && p.fecha <= WEEK[6]) ev.push({ iso: p.fecha, day: p.fecha === TODAY ? 'Hoy' : dayLbl(p.fecha), h: p.hora || '--:--', kind: 'match', team: e.nombre, p, e });
    return ev.sort((a, b) => (a.iso + a.h).localeCompare(b.iso + b.h));
  }

  /* ---------- Fotos de los productos: se guardan en el móvil y solo se descargan si cambian ---------- */
  const fotoKey = h => 'pf-' + h;
  function fotoDe(p) {
    if (!p.foto_hash) return null;
    const c = F().fotos || {}; if (c[p.foto_hash] !== undefined) return c[p.foto_hash];
    try { const v = localStorage.getItem(fotoKey(p.foto_hash)); if (v) return (c[p.foto_hash] = v); } catch (_) {}
    return undefined;
  }
  let pidiendo = false;
  async function traerFotos() {
    const faltan = (S.products || []).filter(p => p.foto_hash && fotoDe(p) === undefined);
    if (!faltan.length || pidiendo || !API()) return;
    pidiendo = true;
    try {
      const filas = await API().fotosProductos(faltan.map(p => p.id));
      S.fam = S.fam || { kids: [], teams: [], train: {}, cart: [], fotos: {} }; S.fam.fotos = S.fam.fotos || {};
      for (const r of filas) {
        S.fam.fotos[r.foto_hash] = r.foto || null;
        if (r.foto) try { localStorage.setItem(fotoKey(r.foto_hash), r.foto); } catch (_) {}
        document.querySelectorAll(`[data-pf="${r.id}"]`).forEach(el => { if (r.foto) el.innerHTML = `<img src="${r.foto}" alt="">`; });
      }
    } catch (_) {} finally { pidiendo = false; }
  }
  const prFoto = (p, cls = 'pr-f') => { const f = fotoDe(p); return `<span class="${cls}" data-pf="${p.id}" aria-hidden="true">${f ? `<img src="${f}" alt="">` : ic('box')}</span>`; };

  /* ---------- FAMILIA ---------- */
  function nextCard(team, i) {
    const e = EQ[team], nm = e && nextMatch(e);
    const away = nm && !nm.casa && nm.campo;
    return `<section class="card match" aria-labelledby="h-fm${i}"><div class="card-h"><h2 id="h-fm${i}">Próximo partido</h2>${nm ? `<span class="tag gold">${dateLbl(nm.fecha)}</span>` : ''}</div>
      <p class="fm-team"><span class="pill gold">${esc(team)}</span></p>${scoreHTML(team)}
      ${nm ? `<div class="match-btns"><button type="button" class="btn white" data-match="${e.id}|${nm.j}">${ic('list')} Ver partido</button>${away ? `<a class="btn gold" target="_blank" rel="noopener" href="${esc(mapsUrl(nm))}">${ic('pin')} Cómo llegar</a>` : ''}</div>` : ''}</section>`;
  }
  function myTeamsCard() {
    return card('h-ft', F().teams.length > 1 ? 'Tus equipos' : 'Tu equipo', F().teams.map(team => {
      const e = EQ[team], r = e && ourRow(e), l = e && lastMatch(e), res = l ? outcome(l) : null, t = fTrain(team);
      return `<button type="button" class="tm tm-btn" data-fteam="${esc(team)}"><span class="k">${r ? r.pos + 'º' : '–'}</span><div class="grow"><b>${esc(team)}</b>
        <small>${r ? r.pts + (r.pts === 1 ? ' punto · ' : ' puntos · ') : ''}${t ? 'Entrena ' + esc(trainTxt(t)) : esc(e ? e.cat : '')}</small></div>${l ? `<span class="res ${res}" title="Último: ${esc(nice(l.rival))}">${scoreTxt(l)}</span>` : ''}</button>`;
    }).join(''), 'f-teams');
  }
  const FAMILY = {
    opts: optsScreen,
    home() {
      const f = F(), ag = fAgenda(), mt = new Set(ag.filter(x => x.kind === 'match').map(x => x.iso));
      if (!f.kids.length) return { kicker: `${greet()},`, title: esc(myName()), body: emptyPage('team', 'Todavía no tienes jugadores asignados', 'Habla con la junta para que te asigne a tu hijo o hija.') };
      return {
        kicker: `${greet()},`, title: esc(myName()),
        body: `<div class="days" aria-label="Esta semana">${MONWEEK.map(iso => { const [w, n] = dayLbl(iso).split(' '); const tr = f.teams.some(tm => fTrainAt(tm, iso)), m = f.teams.some(tm => (EQ[tm] ? EQ[tm].partidos : []).some(p => p.fecha === iso && !p.descansa && !p.nojuega));
            return `<span class="${iso === TODAY ? 'today' : ''}" aria-label="${dateLbl(iso)}${tr ? ', entrenamiento' : ''}${m ? ', partido' : ''}">${w}<b>${n}</b><i class="dots" aria-hidden="true">${tr ? '<i class="dt"></i>' : ''}${m ? '<i class="dm"></i>' : ''}</i></span>`; }).join('')}</div>
          <p class="days-key" aria-hidden="true"><span><i class="dt"></i>Entrenamiento</span><span><i class="dm"></i>Partido</span></p>
          <div class="fam-home"><div class="fh-main"><div class="fh-matches">${f.teams.map(nextCard).join('')}</div>
            ${card('h-fag', 'Próximos 7 días', ag.length ? ag.map(x => agendaRow(x, false)).join('') : '<p class="muted" style="margin:0">No hay entrenamientos ni partidos en los próximos 7 días.</p>', 'f-agenda')}</div>
            <div class="fh-side">${myTeamsCard()}
            <section class="hero f-shop" aria-labelledby="h-fsh"><span class="kick">Tienda del club</span><h2 id="h-fsh">Packs y ropa de entrenamiento</h2>
              <p>Haz tu pedido desde aquí. Se paga en efectivo en el club.</p><div class="btns"><button type="button" class="btn gold" data-go="shop">${ic('box')} Ir a la tienda</button></div></section></div>
          </div>`,
        bind() { document.querySelectorAll('[data-fteam]').forEach(b => b.onclick = () => { S.fteam = b.dataset.fteam; go('team'); }); }
      };
    },
    games: gamesScreen,
    team() {
      const teams = allTeams(), team = S.fteam && EQ[S.fteam] ? S.fteam : F().teams[0] || teams[0].nombre, e = EQ[team];
      const v = ['games', 'group', 'table'].includes(S.fview) ? S.fview : 'games', t = F().train[team], gol = golUrl(e.id);
      const mine = F().teams.includes(team);
      /* Sin repetir: la competición sale una vez y el puesto y los puntos ya están en Clasificación */
      const info = `<section class="card f-info" aria-labelledby="h-fi"><div class="card-h"><h2 id="h-fi">${esc(e.cat)}</h2></div>
        <dl class="facts"><div class="wide"><dt>Entrenamientos</dt><dd>${t && t.dias.length ? esc(trainTxt(t)) : 'Por confirmar'}</dd></div></dl>
        ${gol ? `<a class="btn blue block" target="_blank" rel="noopener" href="${gol}">${ic('ball')} Ver goleadores (RFAF)</a>` : ''}</section>`;
      let body;
      if (v === 'group') body = groupView(e);
      else if (v === 'table') body = card('h-ftb', 'Clasificación', tableHTML(e));
      else body = card('h-fgm', `Temporada · ${e.partidos.length} jornadas`, [...e.partidos].sort(byDate).map(p => matchRow(e, p)).join(''));
      return {
        kicker: `Equipos${mine ? ' · Tu equipo' : ''}`, title: esc(team),
        body: `<div class="stack"><div class="dd f-tsel"><button type="button" class="dd-b" id="ft-b" aria-haspopup="listbox" aria-expanded="false" aria-label="Equipo: ${esc(team)}. Toca para cambiarlo">${esc(team)}</button>
            <ul class="dd-l" id="ft-l" role="listbox" aria-label="Elige equipo" hidden>${teams.map(x => `<li><button type="button" role="option" data-ft="${esc(x.nombre)}" aria-selected="${x.nombre === team}"><span>${esc(x.nombre)}${F().teams.includes(x.nombre) ? ' <small class="ft-mine">· Tu equipo</small>' : ''}</span>${x.nombre === team ? ic('check') : ''}</button></li>`).join('')}</ul></div>
          ${info}
          <div class="tabs" role="group" aria-label="Qué ver">${[['games', 'Partidos'], ['group', 'Jornada'], ['table', 'Clasificación']].map(([k, l]) => `<button type="button" data-fv="${k}" aria-pressed="${v === k}">${l}</button>`).join('')}</div>
          ${body}</div>`,
        bind() {
          /* Selector de equipo: se abre al tocarlo y se cierra al elegir, al tocar fuera o con Escape */
          const fb = $('#ft-b'), fl = $('#ft-l');
          const shut = () => { fl.hidden = true; fb.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', out, true); };
          const out = ev => { if (!ev.target.closest('.f-tsel')) shut(); };
          fb.onclick = () => { if (!fl.hidden) return shut();
            fl.hidden = false; fb.setAttribute('aria-expanded', 'true'); document.addEventListener('pointerdown', out, true);
            (fl.querySelector('[aria-selected="true"]') || fl.querySelector('button')).focus({ preventScroll: true }); };
          fl.onkeydown = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); shut(); fb.focus(); } };
          fl.querySelectorAll('[data-ft]').forEach(b => b.onclick = () => { shut(); if (b.dataset.ft !== team) { S.fteam = b.dataset.ft; S.gj = null; render(); } });
          document.querySelectorAll('[data-fv]').forEach(b => b.onclick = () => { S.fview = b.dataset.fv; render(); });
          document.querySelectorAll('[data-gj]').forEach(b => b.onclick = () => { if (b.dataset.gj) { S.gj = +b.dataset.gj; render(); } });
        }
      };
    },
    shop() {
      const f = F(), view = S.shopView === 'mine' ? 'mine' : 'shop', mine = S.orders || [];
      const seg = `<div class="seg g-scope" role="group" aria-label="Qué ver"><button type="button" data-shv="shop" aria-pressed="${view === 'shop'}">Tienda</button>
        <button type="button" data-shv="mine" aria-pressed="${view === 'mine'}">Mis pedidos${mine.length ? ` · ${mine.length}` : ''}</button></div>`;
      if (S.shopOff) return { kicker: 'Club', title: 'Tienda', body: emptyPage('box', 'La tienda abrirá muy pronto', 'La junta está preparando los productos.') };
      if (view === 'mine') return {
        kicker: 'Tienda', title: 'Mis pedidos',
        body: `<div class="stack">${seg}${mine.length ? `<div class="cards-grid">${mine.map(o => orderCard(o, false)).join('')}</div>`
          : emptyPage('box', 'Aún no has hecho ningún pedido', 'Cuando hagas uno, aquí verás cómo va.', '', `<button type="button" class="btn blue" data-shv="shop">${ic('box')} Ir a la tienda</button>`)}</div>`,
        bind() { bindShopSeg(); bindOrders(false); }
      };
      const prods = (S.products || []).filter(p => p.activo);
      const cart = f.cart || [], n = cart.reduce((a, l) => a + l.cantidad, 0), tot = cart.reduce((a, l) => a + l.cantidad * l.precio, 0);
      return {
        kicker: 'Club', title: 'Tienda',
        body: `<div class="stack">${seg}
          <p class="card pay-note">${ic('check')}<span>Haz el pedido aquí y <b>págalo en efectivo en el club</b>. La junta te avisará cuando esté listo para recoger.</span></p>
          ${prods.length ? `<div class="pr-grid">${prods.map(prodCard).join('')}</div>` : emptyPage('box', 'Todavía no hay productos', 'La junta está preparando la tienda. Vuelve pronto.')}
          ${n ? `<div class="cart-bar" role="region" aria-label="Tu pedido"><div class="grow"><b>${n === 1 ? '1 producto' : n + ' productos'}</b><small>${euro(tot)} · pago en efectivo</small></div>
            <button type="button" class="btn gold" id="cart-go">${ic('box')} Ver pedido</button></div>` : ''}</div>`,
        bind() {
          bindShopSeg(); traerFotos();
          document.querySelectorAll('[data-qty]').forEach(b => b.onclick = () => { const i = $('#q' + b.dataset.qty), v = Math.min(20, Math.max(1, +i.value + +b.dataset.d)); i.value = v; $('#qv' + b.dataset.qty).textContent = v; });
          document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
            const p = S.products.find(x => x.id == b.dataset.add), sel = $('#t' + p.id), talla = sel ? sel.value : '', cantidad = +$('#q' + p.id).value;
            if (sel && !talla) { $('#te' + p.id).hidden = false; sel.focus(); return; }
            S.fam.cart = S.fam.cart || [];
            const l = S.fam.cart.find(x => x.producto === p.id && x.talla === talla);
            if (l) l.cantidad = Math.min(20, l.cantidad + cantidad); else S.fam.cart.push({ producto: p.id, nombre: p.nombre, talla, cantidad, precio: p.precio });
            render(); say(`Añadido: ${p.nombre}${talla ? ' (talla ' + talla + ')' : ''}`);
          });
          if ($('#cart-go')) $('#cart-go').onclick = cartModal;
        }
      };
    }
  };
  function bindShopSeg() { document.querySelectorAll('[data-shv]').forEach(b => b.onclick = () => { S.shopView = b.dataset.shv; render(); }); }
  function prodCard(p) {
    return `<section class="card pr" aria-labelledby="pr${p.id}">${prFoto(p)}
      <div class="pr-b"><h2 id="pr${p.id}">${esc(p.nombre)}</h2>${p.descripcion ? `<p>${esc(p.descripcion)}</p>` : ''}<b class="pr-p">${euro(p.precio)}</b></div>
      <div class="pr-c">${p.tallas.length ? `<label class="f" for="t${p.id}">Talla<select id="t${p.id}"><option value="">Elige</option>${p.tallas.map(t => `<option>${esc(t)}</option>`).join('')}</select></label>` : ''}
        <div class="f"><span id="ql${p.id}">Cantidad</span><div class="qty" role="group" aria-labelledby="ql${p.id}"><button type="button" class="iconbtn" data-qty="${p.id}" data-d="-1" aria-label="Uno menos">${ic('minus')}</button>
          <output id="qv${p.id}" aria-live="polite">1</output><input type="hidden" id="q${p.id}" value="1"><button type="button" class="iconbtn" data-qty="${p.id}" data-d="1" aria-label="Uno más">${ic('plus')}</button></div></div></div>
      <p class="err" id="te${p.id}" role="alert" hidden>Elige la talla.</p>
      <button type="button" class="btn blue block" data-add="${p.id}">${ic('plus')} Añadir al pedido</button></section>`;
  }
  function cartModal() {
    const f = F(), kids = f.kids;
    const draw = () => {
      const cart = f.cart, tot = cart.reduce((a, l) => a + l.cantidad * l.precio, 0);
      return `<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">Tu pedido</h2><small>Se paga en efectivo en el club</small></div><button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
        <div class="cart">${cart.map((l, i) => `<div class="cart-l"><div class="grow"><b>${esc(l.nombre)}</b><small>${l.talla ? 'Talla ' + esc(l.talla) + ' · ' : ''}${l.cantidad} × ${euro(l.precio)}</small></div>
          <b>${euro(l.cantidad * l.precio)}</b><button type="button" class="iconbtn" data-rm="${i}" aria-label="Quitar ${esc(l.nombre)}">${ic('trash')}</button></div>`).join('')}
          <div class="cart-t"><span>Total</span><b>${euro(tot)}</b></div></div>
        ${kids.length > 1 ? `<label class="f" for="ck">¿Para qué jugador es?<select id="ck"><option value="">Elige</option>${kids.map(k => `<option value="${k.id}">${esc(k.n)} · ${esc(k.team)}</option>`).join('')}</select></label>`
          : `<p class="muted" style="margin:0">Para ${esc(kids[0] ? kids[0].n : '')}${kids[0] ? ' · ' + esc(kids[0].team) : ''}</p>`}
        <label class="f" for="cn">Nota para la junta<span class="hint">Opcional</span><textarea id="cn" maxlength="300" rows="2"></textarea></label>
        <p class="err" id="cerr" role="alert" hidden></p>
        <button type="button" class="btn blue block" id="c-ok">${ic('send')} Hacer pedido · ${euro(tot)}</button>`;
    };
    const m = modal(draw(), 'dialog', () => render());
    m.el.classList.add('rqd');
    const bind = () => {
      m.el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { f.cart.splice(+b.dataset.rm, 1); if (!f.cart.length) return m.close(false); m.el.firstElementChild.innerHTML = draw(); bind(); });
      m.el.querySelector('#c-ok').onclick = async () => {
        const err = t => { const e = m.el.querySelector('#cerr'); e.textContent = t; e.hidden = false; b.disabled = false; b.innerHTML = `${ic('send')} Hacer pedido`; };
        const b = m.el.querySelector('#c-ok'), sel = m.el.querySelector('#ck'), kid = sel ? +sel.value : kids[0] && kids[0].id;
        if (!kid) { m.el.querySelector('#cerr').textContent = 'Elige para qué jugador es el pedido.'; m.el.querySelector('#cerr').hidden = false; sel.focus(); return; }
        b.disabled = true; b.textContent = 'Enviando…';
        try { await API().hacerPedido(kid, f.cart.map(l => ({ producto: l.producto, talla: l.talla, cantidad: l.cantidad })), m.el.querySelector('#cn').value.trim()); }
        catch (x) { return err(/Failed to fetch|network/i.test(x.message || '') ? 'No hay conexión. Prueba otra vez en un momento.' : x.message || 'No se ha podido hacer el pedido.'); }
        f.cart = []; await window.cargarTienda(); S.shopView = 'mine'; m.close(false); say('¡Pedido hecho! La junta ya lo tiene. Lo pagas en efectivo en el club.');
      };
    };
    bind();
  }
  function orderCard(o, junta) {
    const ls = Array.isArray(o.lineas) ? o.lineas : [];
    const [nom, tel] = (o.contacto || '').split(' · ');
    return `<section class="card ped" aria-labelledby="pd${o.id}"><div class="ped-h"><div class="grow"><h2 id="pd${o.id}">Pedido nº ${o.id}</h2><small>${fecha(o.creado)}${o.jugador ? ' · ' + esc(o.jugador) : ''}${o.equipo ? ' · ' + esc(o.equipo) : ''}</small></div>
        ${junta ? '' : `<span class="pill ${pedCls(o.estado)}">${ESTADOS_PED[o.estado]}</span>`}</div>
      ${junta ? `<p class="ped-who">${ic('user')}<span>${esc(nom || 'Familia sin acceso')}${tel ? ` · <a href="tel:${esc(tel.replace(/\s/g, ''))}">${esc(tel)}</a>` : ''}</span></p>` : ''}
      <ul class="ped-l">${ls.map(l => `<li><span>${l.cantidad} × ${esc(l.nombre)}${l.talla ? ` <small>talla ${esc(l.talla)}</small>` : ''}</span><b>${euro(l.cantidad * l.precio)}</b></li>`).join('')}</ul>
      ${o.nota ? `<p class="ped-n">“${esc(o.nota)}”</p>` : ''}
      <div class="ped-t"><span>Total · en efectivo</span><b>${euro(o.total)}</b></div>
      ${junta ? `<div class="ped-a"><label class="f" for="pe${o.id}">Estado<select id="pe${o.id}" data-pest="${o.id}">${ESTADOS_PED.map((s, i) => `<option value="${i}" ${i === o.estado ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <button type="button" class="btn red" data-pdel="${o.id}">${ic('trash')} Borrar pedido</button></div>`
        : o.estado === 0 ? `<button type="button" class="btn red block" data-pdel="${o.id}">${ic('trash')} Anular pedido</button>` : ''}</section>`;
  }
  function bindOrders(junta) {
    document.querySelectorAll('[data-pdel]').forEach(b => b.onclick = async () => {
      const o = S.orders.find(x => x.id == b.dataset.pdel);
      if (!(await ask(junta ? `¿Borrar el pedido nº ${o.id}?` : `¿Anular el pedido nº ${o.id}?`, junta ? 'Desaparecerá también del móvil de la familia. No se puede deshacer.' : 'La junta dejará de verlo. No se puede deshacer.', junta ? 'Sí, borrar' : 'Sí, anular'))) return;
      try { await API().borrarPedido(o.id); } catch (x) { return say(x.message === 'visto' ? 'La junta ya lo está preparando. Para cambiarlo, habla con la junta.' : 'No se ha podido borrar. Revisa la conexión.'); }
      S.orders = S.orders.filter(x => x !== o); render(); say(junta ? 'Pedido borrado.' : 'Pedido anulado.');
    });
    document.querySelectorAll('[data-pest]').forEach(s => s.onchange = async () => {
      const o = S.orders.find(x => x.id == s.dataset.pest), prev = o.estado; o.estado = +s.value;
      try { await API().estadoPedido(o.id, o.estado); } catch (_) { o.estado = prev; render(); return say('No se ha podido guardar. Revisa la conexión.'); }
      render(); say(`Pedido nº ${o.id}: ${ESTADOS_PED[o.estado]}. La familia lo verá en su móvil.`);
    });
  }

  /* ---------- JUNTA: Bandeja dividida en Peticiones, Pedidos y Familias ---------- */
  const famPend = () => (S.fams || []).filter(f => f.estado === 'pendiente');
  const pedNuevos = () => (S.orders || []).filter(o => o.estado === 0);
  function inboxSeg() {
    const v = S.inbox || 'pet', np = pedNuevos().length, nf = famPend().length;
    return `<div class="seg g-scope inbox-seg" role="group" aria-label="Qué ver en la bandeja">
      <button type="button" data-inbox="pet" aria-pressed="${v === 'pet'}">Peticiones</button>
      <button type="button" data-inbox="ped" aria-pressed="${v === 'ped'}">Pedidos${np ? ` <span class="pdot" aria-label="${np} nuevos"></span>` : ''}</button>
      <button type="button" data-inbox="fam" aria-pressed="${v === 'fam'}">Familias${nf ? ` <span class="pdot" aria-label="${nf} solicitudes"></span>` : ''}</button></div>`;
  }
  function bindInboxSeg() { document.querySelectorAll('[data-inbox]').forEach(b => b.onclick = () => { S.inbox = b.dataset.inbox; render(); }); }
  const falta = () => emptyPage('box', 'Falta un paso en Supabase', 'Pega el SQL “Paso 10 - familias y tienda” en Supabase y vuelve a abrir la app.');
  function boardInbox() {
    const v = S.inbox;
    if (v === 'ped') {
      const os = S.orders || [], c = st => os.filter(o => o.estado === st).length;
      const body = S.shopOff ? falta() : `<div class="kpis ped-k"><div class="kpi dark blue"><small>Recibidos</small><b>${c(0)}</b></div><div class="kpi"><small>Pedidos al proveedor</small><b>${c(1)}</b></div>
          <div class="kpi"><small>Listos para recoger</small><b>${c(2)}</b></div><div class="kpi"><small>Entregados</small><b>${c(3)}</b></div></div>
        <div class="btn-row ped-btns"><button type="button" class="btn blue" id="xls" ${os.length ? '' : 'disabled'}>${ic('list')} Exportar a Excel</button><button type="button" class="btn blue" id="pr-new">${ic('plus')} Añadir producto</button></div>
        ${os.length ? `<div class="cards-grid">${os.map(o => orderCard(o, true)).join('')}</div>` : emptyPage('box', 'Todavía no hay pedidos', 'Cuando una familia haga un pedido en la tienda, aparecerá aquí.')}
        ${card('h-prs', `Productos de la tienda · ${(S.products || []).length}`, (S.products || []).length ? (S.products || []).map(p => `<div class="tm pr-row">${prFoto(p, 'pr-th')}
            <div class="grow"><b>${esc(p.nombre)}</b><small>${euro(p.precio)}${p.tallas.length ? ' · Tallas ' + esc(p.tallas.join(', ')) : ' · Talla única'}</small></div>
            ${p.activo ? '' : '<span class="pill grey">Oculto</span>'}<button type="button" class="btn ghost sm" data-pr="${p.id}">${ic('pen')} Editar</button></div>`).join('')
          : '<p class="muted" style="margin:0">Añade el primer producto con el botón “Añadir producto”.</p>')}`;
      return { body: `<div class="stack">${inboxSeg()}${body}</div>`, bind() { bindInboxSeg(); bindOrders(true); traerFotos();
        if ($('#xls')) $('#xls').onclick = exportar; if ($('#pr-new')) $('#pr-new').onclick = () => productoForm(null);
        document.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => productoForm(S.products.find(p => p.id == b.dataset.pr))); } };
    }
    /* Familias: solicitudes pendientes y familias con acceso */
    const pend = famPend(), acc = (S.fams || []).filter(f => f.estado === 'aceptada');
    const jug = id => { for (const [team, t] of Object.entries(S.teams)) { const p = t.players.find(x => x.id === id); if (p) return { ...p, team }; } return null; };
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const guess = (h, players) => { const w = norm(h.nombre).split(/\s+/).filter(x => x.length > 1); let best = null, sc = 0;
      for (const p of players) { const n = norm(p.n), s = w.filter(x => n.includes(x)).length; if (s > sc) { sc = s; best = p; } } return sc >= Math.min(2, w.length) ? best : null; };
    const reqCard = f => `<section class="card fam" aria-labelledby="fa${f.id}"><div class="ped-h"><div class="grow"><h2 id="fa${f.id}">${esc(f.nombre)}</h2><small>${fecha(f.creada)} · usuario ${esc(f.usuario)}</small></div><span class="pill blue">Nueva</span></div>
      <p class="ped-who">${ic('phone')}<a href="tel:${esc(f.telefono.replace(/\s/g, ''))}">${esc(f.telefono)}</a></p>
      ${(f.hijos || []).map((h, i) => { const team = teamOf(h.equipo), pl = (S.teams[team] || { players: [] }).players, g = guess(h, pl);
        return `<label class="f" for="fj${f.id}-${i}">Escribe: ${esc(h.nombre)} · ${esc(team)}<span class="hint">Elige el jugador de la plantilla</span><select id="fj${f.id}-${i}" data-fj="${f.id}">
          <option value="">No está en la plantilla</option>${pl.map(p => `<option value="${p.id}" ${g && g.id === p.id ? 'selected' : ''}>${esc(p.n)}${p.dorsal ? ' · ' + p.dorsal : ''}</option>`).join('')}</select></label>`; }).join('')}
      <p class="err" id="fe${f.id}" role="alert" hidden>Elige al menos un jugador de la plantilla.</p>
      <div class="btn-row"><button type="button" class="btn red" data-frej="${f.id}">${ic('trash')} Rechazar</button><button type="button" class="btn blue" data-facc="${f.id}">${ic('check')} Aceptar</button></div></section>`;
    const accRow = f => `<div class="tm fam-row"><span class="k">${esc(initials(f.nombre))}</span><div class="grow"><b>${esc(f.nombre)}</b>
        <small>${f.jugadores.map(id => { const p = jug(id); return p ? `${esc(p.n)} (${esc(p.team)})` : 'Jugador dado de baja'; }).join(', ') || 'Sin jugadores'} · ${esc(f.usuario)} · ${esc(f.telefono)}</small></div>
      <button type="button" class="btn ghost sm" data-fpw="${f.id}">${ic('pen')} Contraseña</button><button type="button" class="btn red sm" data-fdel="${f.id}">${ic('trash')} Quitar acceso</button></div>`;
    const L = window.Instalar ? Instalar.ENLACE : 'https://jmbernalstudio.github.io/gestionazn/?familias';
    const invita = `<section class="card inv" aria-labelledby="h-inv"><img class="inv-qr" src="icons/qr-familias.png" alt="Código QR del enlace para familias" width="160" height="160">
      <div class="grow stack"><h2 id="h-inv" class="st-h2">Invita a las familias</h2><p class="muted" style="margin:0">Pásales este enlace o el código QR. Les guía para instalar la app y pedir su acceso.</p>
        <p class="inv-l">${esc(L)}</p><div class="btn-row"><button type="button" class="btn ghost" id="inv-copy">${ic('list')} Copiar enlace</button>
        <a class="btn blue" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Ya podéis seguir los partidos, resultados y clasificaciones del C.D. Aznalcóllar Fútbol Base y pedir la ropa de entrenamiento desde la app del club. Instaladla y pedid vuestro acceso aquí: ' + L)}">${ic('send')} Enviar por WhatsApp</a>
        <a class="btn ghost" href="icons/qr-familias.png" download="qr-familias-cd-aznalcollar.png">${ic('download')} Descargar QR</a></div></div></section>`;
    /* Filtro por equipo: una familia sale en cada equipo de sus hijos */
    const teamsOf = f => (f.jugadores || []).map(id => (jug(id) || {}).team).filter(Boolean);
    const tOpts = Object.keys(S.teams).sort(teamOrder).map(t => [t, acc.filter(f => teamsOf(f).includes(t)).length]);
    const ft = S.famTeam && S.teams[S.famTeam] ? S.famTeam : '';
    const accV = ft ? acc.filter(f => teamsOf(f).includes(ft)) : acc;
    const filtro = acc.length ? `<label class="f fam-ft" for="fam-ft"><span class="sr">Ver familias de</span><select id="fam-ft"><option value="">Todos los equipos (${acc.length})</option>
        ${tOpts.map(([t, n]) => `<option value="${esc(t)}" ${t === ft ? 'selected' : ''}>${esc(t)} (${n})</option>`).join('')}</select></label>` : '';
    const body = S.famOff ? falta() : `${pend.length ? `<div class="cards-grid">${pend.map(reqCard).join('')}</div>` : ''}
      ${invita}
      ${card('h-fac', `Familias con acceso · ${accV.length}`, acc.length ? filtro + (accV.length ? accV.map(accRow).join('') : `<p class="muted" style="margin:0">Ninguna familia de ${esc(ft)} tiene acceso todavía.</p>`) : '<p class="muted" style="margin:0">Todavía no hay familias con acceso. Pasa a las familias el enlace de la app: entrarán en “Familias” y pedirán su acceso.</p>')}`;
    return { body: `<div class="stack">${inboxSeg()}${!S.famOff && !pend.length ? '<p class="card muted" style="margin:0">No hay solicitudes nuevas de familias.</p>' : ''}${body}</div>`, bind() {
      bindInboxSeg();
      if ($('#fam-ft')) $('#fam-ft').onchange = e => { S.famTeam = e.target.value; render(); };
      if ($('#inv-copy')) $('#inv-copy').onclick = async () => { try { await navigator.clipboard.writeText(L); say('Enlace copiado. Pégalo en el grupo de WhatsApp del equipo.'); } catch (_) { prompt('Copia este enlace:', L); } };
      document.querySelectorAll('[data-facc]').forEach(b => b.onclick = async () => {
        const id = b.dataset.facc, ids = [...document.querySelectorAll(`[data-fj="${id}"]`)].map(s => +s.value).filter(Boolean);
        if (!ids.length) { $('#fe' + id).hidden = false; return; }
        b.disabled = true;
        try { await API().aceptarFamilia(id, [...new Set(ids)]); } catch (x) { b.disabled = false; return say(x.message || 'No se ha podido aceptar. Revisa la conexión.'); }
        const f = S.fams.find(x => x.id === id); f.estado = 'aceptada'; f.jugadores = [...new Set(ids)];
        render(); say(`${f.nombre} ya puede entrar. Avísale por WhatsApp o por teléfono.`);
      });
      document.querySelectorAll('[data-frej],[data-fdel]').forEach(b => b.onclick = async () => {
        const id = b.dataset.frej || b.dataset.fdel, f = S.fams.find(x => x.id === id), rej = !!b.dataset.frej;
        if (!(await ask(rej ? `¿Rechazar a ${f.nombre}?` : `¿Quitar el acceso a ${f.nombre}?`, rej ? 'Se borrará su solicitud. Si es un error, podrá volver a pedir acceso.' : 'Ya no podrá entrar en la app. Sus pedidos se quedan. No se puede deshacer.', rej ? 'Sí, rechazar' : 'Sí, quitar acceso'))) return;
        try { await API().quitarFamilia(id); } catch (_) { return say('No se ha podido hacer. Revisa la conexión.'); }
        S.fams = S.fams.filter(x => x !== f); render(); say(rej ? 'Solicitud rechazada.' : 'Acceso quitado.');
      });
      document.querySelectorAll('[data-fpw]').forEach(b => b.onclick = () => nuevaClave(S.fams.find(x => x.id === b.dataset.fpw)));
    } };
  }
  function nuevaClave(f) {
    const m = modal(`<h2 id="mdl-t">Nueva contraseña</h2><form id="fpf" class="stack" novalidate><p class="muted" style="margin:0">Para ${esc(f.nombre)} (usuario ${esc(f.usuario)}). Después, díselo por WhatsApp o por teléfono.</p>
      <label class="f" for="fpn">Contraseña nueva<span class="hint">Al menos 8 caracteres</span><input type="text" id="fpn" autocomplete="off" autocapitalize="none" spellcheck="false"></label>
      <p class="err" id="fpe" role="alert" hidden></p><button type="submit" class="btn blue block">${ic('check')} Guardar contraseña</button></form>`, 'dialog', () => {});
    $('#fpn').focus();
    $('#fpf').onsubmit = async e => { e.preventDefault(); const v = $('#fpn').value;
      if (v.length < 8) { $('#fpe').textContent = 'Debe tener al menos 8 caracteres.'; $('#fpe').hidden = false; return; }
      try { await API().clave(f.id, v); } catch (_) { $('#fpe').textContent = 'No se ha podido guardar. Revisa la conexión.'; $('#fpe').hidden = false; return; }
      m.close(); say('Contraseña cambiada.'); };
  }
  /* Alta y edición de productos (solo junta) */
  function productoForm(p) {
    const x = p ? { ...p, tallas: p.tallas.slice() } : { nombre: '', descripcion: '', precio: '', tallas: [], activo: true };
    const st = { foto: p ? fotoDe(p) : null, cambiada: false };
    const m = modal(`<h2 id="mdl-t">${p ? 'Editar producto' : 'Añadir producto'}</h2>
      <form id="prf" class="stack" novalidate>
        <label class="photo pr-ph" for="prfo">${st.foto ? `<span class="pr-f"><img src="${st.foto}" alt=""></span>` : `<span class="pr-f">${ic('camera')}</span>`}<span id="prfo-t">${st.foto ? 'Foto añadida · toca para cambiarla' : 'Añadir foto (opcional)'}</span></label>
        <input type="file" id="prfo" accept="image/*" class="sr">
        <label class="f" for="prn">Nombre<input type="text" id="prn" maxlength="80" value="${esc(x.nombre)}" placeholder="Por ejemplo: Pack de entrenamiento"></label>
        <label class="f" for="prd">Descripción<span class="hint">Opcional. Qué incluye</span><textarea id="prd" maxlength="300" rows="2">${esc(x.descripcion)}</textarea></label>
        <label class="f" for="prp">Precio en euros<input type="text" id="prp" inputmode="decimal" value="${x.precio === '' ? '' : String(x.precio).replace('.', ',')}" placeholder="35,00"></label>
        <label class="f" for="prt">Tallas disponibles<span class="hint">Separadas por comas. Déjalo vacío si es talla única</span><input type="text" id="prt" value="${esc(x.tallas.join(', '))}" placeholder="6, 8, 10, 12, 14, S, M, L, XL"></label>
        <div class="opts-row"><div class="grow"><b id="pra-l">Se ve en la tienda</b><small>Si lo quitas, las familias no lo ven, pero no se borra.</small></div>
          <button type="button" class="tgl" role="switch" id="pra" aria-checked="${x.activo}" aria-labelledby="pra-l"><span></span></button></div>
        <p class="err" id="pre" role="alert" hidden></p>
        <button type="submit" class="btn blue block">${ic('check')} Guardar producto</button>
        ${p ? `<button type="button" class="btn red block" id="prx">${ic('trash')} Borrar producto</button>` : ''}
      </form>`, 'dialog', () => {});
    m.el.classList.add('rqd');
    $('#prn').focus();
    $('#pra').onclick = () => { x.activo = !x.activo; $('#pra').setAttribute('aria-checked', x.activo); };
    $('#prfo').onchange = async () => { const fl = $('#prfo').files[0]; if (!fl) return;
      try { st.foto = await readImage(fl, 640); st.cambiada = true; } catch (_) { return say('No se ha podido leer esa foto. Prueba con otra.'); }
      m.el.querySelector('.pr-ph .pr-f').innerHTML = `<img src="${st.foto}" alt="">`; $('#prfo-t').textContent = 'Foto añadida · toca para cambiarla'; };
    if ($('#prx')) $('#prx').onclick = async () => {
      if (!(await ask(`¿Borrar “${p.nombre}”?`, 'Desaparecerá de la tienda. Los pedidos ya hechos no cambian. No se puede deshacer.', 'Sí, borrar'))) return;
      try { await API().borrarProducto(p.id); } catch (_) { return say('No se ha podido borrar. Revisa la conexión.'); }
      S.products = S.products.filter(y => y !== p); m.close(); render(); say('Producto borrado.');
    };
    $('#prf').onsubmit = async e => {
      e.preventDefault();
      const err = t => { $('#pre').textContent = t; $('#pre').hidden = false; };
      const nombre = $('#prn').value.trim(), precio = Number($('#prp').value.replace(/\s|€/g, '').replace(',', '.'));
      if (!nombre) return err('Escribe el nombre del producto.');
      if (!$('#prp').value.trim() || isNaN(precio) || precio < 0) return err('Escribe el precio. Por ejemplo: 35,00');
      const tallas = [...new Set($('#prt').value.split(',').map(t => t.trim()).filter(Boolean))];
      const fila = { id: p && p.id, nombre, descripcion: $('#prd').value.trim(), precio: Math.round(precio * 100) / 100, tallas, activo: x.activo, foto: st.foto || null };
      try { await API().producto(fila); } catch (_) { return err(S.shopOff ? 'Falta un paso en Supabase para poder guardar productos.' : 'No se ha podido guardar. Revisa la conexión.'); }
      await window.cargarTienda(); m.close(); render(); say(p ? 'Producto guardado.' : 'Producto añadido a la tienda.');
    };
  }

  /* ---------- Exportar pedidos a Excel (.xlsx hecho aquí mismo, sin librerías) ---------- */
  async function exportar() {
    const os = S.orders || [], nuevos = os.filter(o => o.estado === 0), abiertos = os.filter(o => o.estado < 3);
    const v = await choose('Exportar pedidos a Excel', 'Elige qué pedidos van en el archivo', [
      ['0', `Solo los nuevos (Recibido) · ${nuevos.length}`, 'box', 'blue'], ['1', `Todos los que faltan por entregar · ${abiertos.length}`, 'list'], ['2', `Todos · ${os.length}`, 'list']]);
    if (v === undefined) return;
    const sel = v === '0' ? nuevos : v === '1' ? abiertos : os;
    if (!sel.length) return say('No hay pedidos de ese tipo.');
    const lin = sel.flatMap(o => (o.lineas || []).map(l => ({ o, l })));
    const sum = {};
    for (const { l } of lin) { const k = `${l.nombre}\u0000${l.talla || ''}`; sum[k] = (sum[k] || 0) + l.cantidad; }
    const hoja1 = [['Producto', 'Talla', 'Cantidad'], ...Object.entries(sum).sort().map(([k, n]) => { const [a, b] = k.split('\u0000'); return [a, b || 'Única', n]; }),
      [], ['Total de prendas', '', Object.values(sum).reduce((a, b) => a + b, 0)]];
    const hoja2 = [['Pedido', 'Fecha', 'Familia', 'Teléfono', 'Jugador', 'Equipo', 'Producto', 'Talla', 'Cantidad', 'Precio', 'Importe', 'Estado', 'Nota'],
      ...lin.map(({ o, l }) => { const [nom, tel] = (o.contacto || '').split(' · '); const d = new Date(o.creado);
        return [o.id, `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, nom || '', tel || '', o.jugador, o.equipo, l.nombre, l.talla || 'Única', l.cantidad, { m: +l.precio }, { m: Math.round(l.cantidad * l.precio * 100) / 100 }, ESTADOS_PED[o.estado], o.nota || '']; }),
      [], ['', '', '', '', '', '', '', '', '', 'Total', { m: sel.reduce((a, o) => a + o.total, 0) }]];
    const blob = xlsx([['Para el proveedor', hoja1], ['Pedidos', hoja2]]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `pedidos-cd-aznalcollar-${TODAY}.xlsx`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    const n0 = sel.filter(o => o.estado === 0);
    if (n0.length && await confirmar(`¿Marcar ${n0.length === 1 ? 'el pedido' : `los ${n0.length} pedidos`} como “Pedido al proveedor”?`, 'Así las familias saben que ya se ha pedido su ropa.', 'Sí, marcar')) {
      try { await API().estadoPedidos(n0.map(o => o.id), 1); n0.forEach(o => { o.estado = 1; }); render(); say('Pedidos marcados como “Pedido al proveedor”.'); } catch (_) { say('No se ha podido guardar. Revisa la conexión.'); }
    } else say('Excel descargado.');
  }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
    for (const [name, text] of files) {
      const nb = enc.encode(name), data = enc.encode(text), crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nb.length, true);
      const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
      parts.push(h, nb, data); cen.push(c, nb); off += 30 + nb.length + data.length;
    }
    const size = cen.reduce((a, x) => a + (x.byteLength || x.length), 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cen, e], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const xe = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  function xlsx(sheets) {
    const sheetXml = rows => {
      const txt = v => v && typeof v === 'object' ? String(v.m) + '  €' : String(v == null ? '' : v);
      const w = rows.reduce((a, r) => r.map((v, i) => Math.max(a[i] || 8, Math.min(50, txt(v).length + 2))), []);
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${w.map((x, i) => `<col min="${i + 1}" max="${i + 1}" width="${x}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => {
        const ref = col(ci) + (ri + 1), money = v && typeof v === 'object', s = ri === 0 ? ' s="1"' : money ? ' s="2"' : '';
        if (money) v = v.m;
        return v === '' || v == null ? '' : typeof v === 'number' ? `<c r="${ref}"${s}><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xe(v)}</t></is></c>`; }).join('')}</row>`).join('')}</sheetData></worksheet>`;
    };
    return zip([
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(([n], i) => `<sheet name="${xe(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00\\ &quot;€&quot;"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0034DF"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/><xf numFmtId="164" applyNumberFormat="1"/></cellXfs></styleSheet>`],
      ...sheets.map(([, rows], i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(rows)])
    ]);
  }

  window.FAMILY = FAMILY;
  window.inboxSeg = inboxSeg;
  window.bindInboxSeg = bindInboxSeg;
  window.boardInbox = boardInbox;
  window.famXlsx = xlsx;
  window.famInboxCount = () => famPend().length + pedNuevos().length;
})();
