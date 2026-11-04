"""Descarga los equipos del club desde las dos webs oficiales y genera js/datos.js.

Solo usa www.rfaf.es (y su almacén de escudos rfaf.filesnovanet.es) y educationleague.es.

    python3 herramientas/actualizar.py

Necesita Python 3, BeautifulSoup (bs4) y Pillow.
"""
import http.cookiejar
import io
import json
import re
import ssl
import sys
import time
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
DIR_ESCUDOS = RAIZ / 'icons' / 'escudos'
RFAF = 'https://www.rfaf.es/pnfg/NPcd/'
EDUCA = 'https://educationleague.es/'
TEMPORADA_RFAF = 22  # 2026-2027

EQUIPOS = [
    dict(id='senior', nombre='Senior', cat='3ª Andaluza Senior · Grupo 5', web='rfaf', comp=48466186, grupo=48466191, jornadas=30),
    dict(id='juvenil', nombre='Juvenil', cat='4ª Andaluza Juvenil · Grupo 11', web='rfaf', comp=48466231, grupo=48466242, jornadas=26),
    dict(id='infantil', nombre='Infantil', cat='4ª Andaluza Infantil · Grupo 2', web='rfaf', comp=48466271, grupo=48466273, jornadas=30),
    dict(id='alevin2', nombre='Alevín 2º año', cat='4ª Andaluza Alevín · Grupo 2', web='rfaf', comp=48466388, grupo=48466390, jornadas=22),
    dict(id='benjamin2', nombre='Benjamín 2º año', cat='4ª Andaluza Benjamín · Grupo 2', web='rfaf', comp=48466406, grupo=48466408, jornadas=26),
    dict(id='benjamin1', nombre='Benjamín 1º año', cat='4ª Andaluza Benjamín · Grupo 10', web='rfaf', comp=48466406, grupo=48466416, jornadas=26),
    dict(id='cadete', nombre='Cadete F-7', cat='Liga Educa · Cadete F-7 · Grupo 1', web='educa', age=81, gro1=451, sea=1834, sta=2267, jornadas=21),
    dict(id='alevin1', nombre='Alevín 1º año', cat='Liga Educa · Alevín 1º año · Grupo 1', web='educa', age=77, gro1=466, sea=1832, sta=2259, jornadas=21),
    dict(id='prebenjamin', nombre='Prebenjamín 2º año', cat='Liga Educa · Prebenjamín 2º año · Grupo 2', web='educa', age=73, gro1=475, sea=1830, sta=2253, jornadas=15),
    dict(id='minis', nombre='Minis', cat='Liga Educa · Minis · Grupo 1', web='educa', age=72, gro1=474, sea=1828, sta=2244, jornadas=15),
]

NOSOTROS = re.compile(r'AZNALC[OÓ]LLAR', re.I)  # nunca solo 'AZNALC': coincidiría con el C.A. AZNALCÁZAR
CTX = ssl.create_default_context()
# La RFAF necesita una sesión (cookie) antes de enseñar las jornadas
ABRIDOR = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),
                                      urllib.request.HTTPSHandler(context=CTX))


def bajar(url, binario=False, minimo=0):
    """Descarga con reintentos. La RFAF a veces responde vacío: eso también se reintenta."""
    for intento in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (club CD Aznalcollar FB)'})
            with ABRIDOR.open(req, timeout=40) as r:
                datos = r.read()
            if len(datos) >= minimo:
                return datos if binario else datos.decode('latin-1')
        except Exception:
            if intento == 5:
                raise
        time.sleep(1.5 * (intento + 1))
    raise RuntimeError(f'Respuesta vacía de {url}')


def limpio(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def fecha_iso(dmy):
    m = re.search(r'(\d{2})[-/](\d{2})[-/](\d{4})', dmy or '')
    return f'{m[3]}-{m[2]}-{m[1]}' if m else None


# ---------- RFAF ----------
# Los marcadores llevan cifras falsas ocultas, cifras puestas por CSS y cifras que pone un script.
# Aquí se reproduce lo que se ve en pantalla.
TABLA_NTYPE = [2, 5, 9, 4, 1, 0, 8, 6, 3, 7, 1, 3, 5, 7, 9, 0, 2, 4, 6, 8, 0, 2, 4, 6, 8, 1, 3, 5, 7, 9, 7, 5, 2, 0, 9, 6, 3, 8, 4, 1]


def cifra_visible(nodo):
    reglas = {}
    for st in nodo.find_all('style'):
        for el_id, cual, cuerpo in re.findall(r'#([\w-]+):(before|after)\{([^}]*)\}', st.get_text()):
            reglas[f'{el_id}:{cual}'] = cuerpo
    for sc in nodo.find_all('script'):
        m = re.search(r'ntype\("([\w-]+)",\s*(\d+),\s*(\d+)', sc.get_text())
        if m:
            reglas[m[1] + ':ntype'] = str(TABLA_NTYPE[int(m[3]) * 10 + int(m[2])])

    def pseudo(el_id, cual):
        c = reglas.get(f'{el_id}:{cual}')
        if not c or re.search(r'display\s*:\s*none', c):
            return ''
        m = re.search(r'content\s*:\s*"([^"]*)"', c)
        if not m:
            return ''
        return re.sub(r'\\([0-9a-fA-F]{1,6})\s?', lambda x: chr(int(x[1], 16)), m[1])

    def vis(el):
        if isinstance(el, str):
            return str(el)
        if el.name in ('script', 'style'):
            return ''
        if re.search(r'display\s*:\s*none', el.get('style', '')):
            return ''
        i = el.get('id')
        out = pseudo(i, 'before') if i else ''
        if i and f'{i}:ntype' in reglas:
            out += reglas[f'{i}:ntype']
        for h in el.children:
            out += vis(h)
        return out + (pseudo(i, 'after') if i else '')

    return re.sub(r'\D', '', vis(nodo))


def jornada_rfaf(eq, n):
    html = bajar(minimo=20000, url=f'{RFAF}NFG_CmpJornada?cod_primaria=1000120&CodCompeticion={eq["comp"]}&CodGrupo={eq["grupo"]}'
                 f'&CodTemporada={TEMPORADA_RFAF}&cod_agrupacion=1&CodJornada={n}&Sch_Codigo_Delegacion=1&Sch_Tipo_Juego=1')
    sopa = BeautifulSoup(html, 'html.parser')
    filas = []
    for tr in sopa.find_all('tr'):
        tds = tr.find_all('td', recursive=False)
        if len(tds) != 3 or 'td_widget' not in (tds[0].get('class') or []) or 'td_widget' not in (tds[2].get('class') or []):
            continue

        def lado(td):
            h4 = td.find('h4')
            img = td.find('img')
            a = td.select_one('a[href*="Codigo_Equipo="]')
            cod = re.search(r'Codigo_Equipo=(\d+)', a['href']) if a else None
            return dict(nombre=limpio(h4.get_text()) if h4 else '', escudo=img.get('src') if img else None, cod=cod[1] if cod else None)

        marc = [cifra_visible(x) for x in tds[1].select('.wid2_resultado_cerrada')]
        hor = [limpio(x.get_text()) for x in tds[1].select('.horario')]
        sig = tr.find_parent('table').find_all('tr')
        campo = sup = None
        for t2 in sig:
            a = t2.select_one('a[href*="NFG_VisCampos"]')
            if a:
                campo = limpio(a.get_text())
                s = a.parent.find('span')
                sup = limpio(s.get_text()) if s else None
                break
        filas.append(dict(local=lado(tds[0]), visitante=lado(tds[2]),
                          goles=[int(marc[0]), int(marc[1])] if len(marc) == 2 and marc[0] and marc[1] else None,
                          fecha=hor[0] if hor else None, hora=hor[1] if len(hor) > 1 else None, campo=campo, superficie=sup))
    return filas


EQUIPACIONES = {}


def equipacion_rfaf(cod):
    """Colores de la equipación que el equipo tiene registrados en la RFAF (camiseta, pantalón y medias).
    Solo se leen esos tres datos de la ficha: nada de jugadores ni personas."""
    if not cod:
        return None
    if cod not in EQUIPACIONES:
        try:
            html = bajar(f'{RFAF}NFG_VisEquipos?cod_primaria=1000119&Codigo_Equipo={cod}', minimo=5000)
            col = {}
            for h5 in BeautifulSoup(html, 'html.parser').find_all('h5'):
                st = h5.find('strong')
                k = limpio(st.get_text()).rstrip(':').lower() if st else ''
                if k in ('camiseta', 'pantalón', 'medias'):
                    v = limpio(h5.get_text()[len(st.get_text()):])
                    if v:
                        col['pantalon' if k == 'pantalón' else k] = v.capitalize()
            EQUIPACIONES[cod] = col or None
        except Exception:
            EQUIPACIONES[cod] = None
    return EQUIPACIONES[cod]


def _clave(n):
    n = unicodedata.normalize('NFD', n.lower())
    n = ''.join(c for c in n if unicodedata.category(c) != 'Mn')
    n = re.sub(r'\(fem\)|"[a-z0-9 ]*"', ' ', n)
    return ' '.join(re.sub(r'[^a-z0-9 ]', ' ', n).split())


# La Liga Educa no publica los colores: salen del PDF de indumentaria que mandó Jose
EQUIP_EDUCA = {_clave(k): dict(camiseta=v[0], pantalon=v[1], medias=v[2])
               for k, v in json.loads((RAIZ / 'herramientas' / 'equipaciones_educa.json').read_text(encoding='utf-8')).items() if not k.startswith('_')}


def equipacion_educa(rival):
    k = _clave(rival)
    return EQUIP_EDUCA.get(k) or next((v for c, v in EQUIP_EDUCA.items() if k.startswith(c + ' ') or c.startswith(k + ' ')), None)


# Campo y enlace a Google Maps de cada rival de la Liga Educa, del mismo PDF (el enlace está en su escudo)
UBIC_EDUCA = {k: v for k, v in json.loads((RAIZ / 'herramientas' / 'ubicaciones_educa.json').read_text(encoding='utf-8')).items() if not k.startswith('_')}
_GENERICO = {'cd', 'cf', 'ef', 'club', 'ud', 'fc', 'c', 'f', 'sd', 'ad', 'cdm', 'cmd', 'edm', 'em', 'eemm', 'esd', 'fb', 'jd', 'de', 'del', 'la', 'los', 'el'}


def _fichas(n):
    n = _clave(n).replace('atletico', 'atco').replace('ayto de', 'ayto').replace('polvenir', 'porvenir')
    return set(n.split()) - _GENERICO


def ubicacion_educa(rival):
    """Busca el equipo sin fijarse en siglas como CD, EF o EDM, que cambian de una web a otra"""
    k = _fichas(rival)
    return next((v for n, v in UBIC_EDUCA.items() if _fichas(n) == k), None) if k else None


def equipo_rfaf(eq, pool):
    for intento in range(6):  # a veces la RFAF devuelve la lista vacía
        exe = bajar(f'{RFAF}NFG_CmpJornada_Exec?cod_primaria=1000120&codgrupo={eq["grupo"]}')
        arr = re.search(r'new Array\(([^)]*)\)', exe)
        if arr and arr[1].count(',') > 2:
            break
        time.sleep(2)
    vals = re.findall(r'"([^"]*)"', arr[1]) if arr else []
    lista = [(int(vals[i]), fecha_iso(vals[i + 1])) for i in range(2, len(vals) - 1, 2)]
    # De una en una: la RFAF guarda en la sesión la última consulta y las peticiones a la vez se mezclan
    resultados = [jornada_rfaf(eq, n) for n, _ in lista]

    partidos, escudos, grupo = [], {}, []
    for (n, fecha), filas in zip(lista, resultados):
        grupo.append(jornada_grupo(n, fecha, [dict(l=f['local']['nombre'], v=f['visitante']['nombre'], g=f['goles'],
                                                   f=fecha_iso(f['fecha']) if f['fecha'] else None, h=f['hora']) for f in filas]))
        for f in filas:
            for l in (f['local'], f['visitante']):
                if l['nombre'] and l['escudo'] and 'escudo_sm_resultados' not in l['escudo'] and l['nombre'] != 'Descansa':
                    escudos[l['nombre']] = l['escudo']
        m = next((f for f in filas if NOSOTROS.search(f['local']['nombre']) or NOSOTROS.search(f['visitante']['nombre'])), None)
        casa = bool(m and NOSOTROS.search(m['local']['nombre']))
        otro = m and (m['visitante'] if casa else m['local'])
        if not m or re.fullmatch(r'Descansa', otro['nombre'], re.I):
            partidos.append(dict(j=n, fecha=fecha, descansa=True))
            continue
        partidos.append(dict(j=n, fecha=fecha_iso(m['fecha']) or fecha, hora=m['hora'], casa=casa, rival=otro['nombre'],
                             campo=m['campo'], superficie=m['superficie'], goles=m['goles']))
        # Solo hace falta de visitante: de local jugamos siempre de azul
        equip = None if casa else equipacion_rfaf(otro.get('cod'))
        if equip:
            partidos[-1]['equipacion'] = equip

    html = bajar(minimo=20000, url=f'{RFAF}NFG_VisClasificacion?cod_primaria=1000120&codcompeticion={eq["comp"]}&codgrupo={eq["grupo"]}&cod_agrupacion=1')
    tabla = []
    for tr in BeautifulSoup(html, 'html.parser').find_all('tr'):
        a = tr.select_one('a[href*="NFG_VisCompeticiones_Grupo"]')
        if not a:
            continue
        c = [limpio(td.get_text()) for td in tr.find_all('td', recursive=False)]
        nom = limpio(a.get_text())
        i = c.index(nom)
        num = []
        for x in c[i + 1:]:
            if not re.fullmatch(r'-?\d+', x):
                break
            num.append(int(x))
        if len(num) >= 11:  # Pts, J G E P en casa, J G E P fuera, goles a favor y en contra
            fila = dict(pos=int(c[i - 1]), equipo=nom, pts=num[0], j=num[1] + num[5], g=num[2] + num[6], e=num[3] + num[7],
                        p=num[4] + num[8], gf=num[9], gc=num[10])
        elif len(num) >= 5:  # tabla resumida: Pts J G E P
            fila = dict(pos=int(c[i - 1]), equipo=nom, pts=num[0], j=num[1], g=num[2], e=num[3], p=num[4])
        else:
            continue
        previa = next((r for r in tabla if r['equipo'] == nom), None)
        if previa is None:
            tabla.append(fila)
        elif 'gf' in fila:
            previa.update(fila)
    return partidos, tabla, escudos, grupo


def jornada_grupo(n, fecha, filas):
    """Todos los partidos de una jornada del grupo (para 'Partidos del grupo'), sin el equipo que descansa en la lista"""
    juegan = [f for f in filas if f['l'] and f['v'] and not re.fullmatch(r'Descansa', f['l'], re.I) and not re.fullmatch(r'Descansa', f['v'], re.I)]
    desc = [f['v'] if re.fullmatch(r'Descansa', f['l'], re.I) else f['l'] for f in filas if f not in juegan and (f['l'] or f['v'])]
    out = dict(j=n, fecha=fecha, partidos=[{k: v for k, v in f.items() if v is not None} for f in juegan])
    if desc:
        out['descansa'] = [d for d in desc if d and not re.fullmatch(r'Descansa', d, re.I)]
    return out


# ---------- Liga Educa ----------

def url_educa(eq, extra):
    return (f'{EDUCA}?id_lan=1&id_geo=8&id_spo=1&id_com_gro0=439&sea=2026&id_rac=1&id_age={eq["age"]}&id_com_gro1={eq["gro1"]}'
            f'&id_com_sea={eq["sea"]}&id_com_sta={eq["sta"]}&{extra}')


def filas_educa(html):
    sopa = BeautifulSoup(html, 'html.parser')
    out, titulo = [], None
    for tr in sopa.find_all('tr'):
        tds = tr.find_all('td', recursive=False)
        links = [a for td in tds for a in td.select('a[href*="id_sec=11"]') if limpio(a.get_text())]
        if len(links) != 2:
            mj = re.search(r'Jornada:?\s*(\d+)\s*\((\d{2}/\d{2}/\d{4})\)', limpio(tr.get_text()))
            if mj and len(limpio(tr.get_text())) < 160:
                titulo = mj
            continue
        iL = next(i for i, td in enumerate(tds) if links[0] in td.descendants)
        iV = next(i for i, td in enumerate(tds) if links[1] in td.descendants)
        centro = ' '.join(limpio(td.get_text()) for td in tds[iL + 1:iV])
        g = re.search(r'(\d+)\s*-\s*(\d+)', centro)
        club = lambda a: (re.search(r'id_clu=(\d+)', a.get('href', '')) or [None, None])[1]
        antes = [limpio(td.get_text()) for td in tds[:iL] if limpio(td.get_text())]
        out.append(dict(jornada=int(titulo[1]) if titulo else None, fechaJ=titulo[2] if titulo else None, info=antes,
                        local=limpio(links[0].get_text()), visitante=limpio(links[1].get_text()),
                        clubL=club(links[0]), clubV=club(links[1]), goles=[int(g[1]), int(g[2])] if g else None))
    return out


def equipo_educa(eq, pool):
    cal = filas_educa(bajar(url_educa(eq, 'id_sec=2')))
    primera = bajar(url_educa(eq, 'num_day=1&id_sec=1'))
    total = max([int(x) for x in re.findall(r'>\s*Jornada (\d+)\s*</option>', primera)] or [0])
    paginas = [primera] + list(pool.map(lambda n: bajar(url_educa(eq, f'num_day={n}&id_sec=1')), range(2, total + 1)))
    partidos, escudos, grupo = [], {}, []
    for n, html in enumerate(paginas, 1):
        filas = filas_educa(html)
        for f in filas:
            escudos[f['local']] = f['clubL']
            escudos[f['visitante']] = f['clubV']
        mj = re.search(r'Jornada:\s*\d+\s*\((\d{2}/\d{2}/\d{4})\)', BeautifulSoup(html, 'html.parser').get_text())
        fecha_j = fecha_iso(mj[1]) if mj else None
        todas = []
        for f in filas:
            fe, ho, fin = cuando_educa(cal, n, f, fecha_j)
            todas.append(dict(l=f['local'], v=f['visitante'], g=f['goles'] if fin else None, f=fe, h=ho))
        grupo.append(jornada_grupo(n, fecha_j, todas))
        m = next((f for f in filas if NOSOTROS.search(f['local']) or NOSOTROS.search(f['visitante'])), None)
        if not m:
            partidos.append(dict(j=n, fecha=fecha_j, descansa=True))
            continue
        casa = bool(NOSOTROS.search(m['local']))
        c = next((x for x in cal if x['jornada'] == n and x['local'] == m['local'] and x['visitante'] == m['visitante']), None)
        info = ' '.join(c['info']) if c else ''
        fecha, hora = dia_hora_educa(info, fecha_j)
        estado = m['info'][0] if m['info'] else ''
        campo = ' '.join(m['info'][1:]) or None
        todo = estado + ' ' + info
        partidos.append(dict(j=n, fecha=fecha, hora=hora, casa=casa, rival=m['visitante'] if casa else m['local'], campo=campo,
                             estado='Aplazado' if re.search(r'aplaz|suspend', todo, re.I) else None,
                             goles=m['goles'] if re.search(r'Finalizado', todo, re.I) else None))
        equip = None if casa else equipacion_educa(m['local'])
        if equip:
            partidos[-1]['equipacion'] = equip
        ubic = None if casa else ubicacion_educa(m['local'])
        if ubic:
            partidos[-1]['campo'] = campo or ubic['lugar']
            if ubic['maps']:
                partidos[-1]['maps'] = ubic['maps']

    # La tabla de la Liga Educa está mal cerrada en el HTML: se lee del texto, buscando cada equipo por su nombre
    texto = limpio(BeautifulSoup(bajar(url_educa(eq, 'id_sec=4')), 'html.parser').get_text(' '))
    texto = texto[texto.find('Pt Equipo'):]
    tabla = []
    for nom in escudos:
        m = re.search(r'(\d+) ' + re.escape(nom) + r' (-?\d+) (\d+) (\d+) (\d+) (\d+) (-?\d+)', texto)
        if m:
            v = [int(x) for x in m.groups()]
            tabla.append(dict(pos=v[0], equipo=nom, pts=v[1], j=v[2], g=v[3], e=v[4], p=v[5], dif=v[6]))
    tabla.sort(key=lambda r: r['pos'])
    escudos = {k: f'{EDUCA}t4/images/crests/originals/{v}.jpg' for k, v in escudos.items() if v}
    return partidos, tabla, escudos, grupo


AVISOS_FECHA = []  # días que no se han podido leer bien: el aviso frena la publicación diaria
DIAS_EDUCA = {'lun': 0, 'mar': 1, 'mie': 2, 'jue': 3, 'vie': 4, 'sab': 5, 'dom': 6}


def dia_hora_educa(info, fecha_j):
    """Día y hora reales de un partido de la Liga Educa a partir del texto del calendario.
    La web pone el día y la hora en piezas separadas que llegan pegadas ("Sáb 0716:00" = sábado 7 a las 16:00),
    así que el día son los dos dígitos justo antes de la hora. La fecha de la jornada es solo la referencia:
    el partido puede jugarse otro día de ese fin de semana. Si el día de la semana escrito no cuadra, se avisa."""
    m = re.search(r'([A-Za-zÁÉÍÓÚáéíóú]{3})\.?\s*(\d{1,2})\s*(\d{1,2}:\d{2})', info)
    hora = m[3] if m else (re.search(r'(\d{1,2}:\d{2})', info) or [None, None])[1]
    if not fecha_j:
        return fecha_j, hora
    base = datetime.strptime(fecha_j, '%Y-%m-%d')
    if not m:
        m2 = re.match(r'\s*([A-Za-zÁÉÍÓÚáéíóú]{3})\.?\s*(\d{1,2})\b', info)
        if not m2:
            return fecha_j, hora
        m = m2
    nombre = unicodedata.normalize('NFD', m[1]).encode('ascii', 'ignore').decode().lower()
    for k in range(-3, 7):
        x = base + timedelta(days=k)
        if x.day == int(m[2]):
            if nombre in DIAS_EDUCA and x.weekday() != DIAS_EDUCA[nombre]:
                AVISOS_FECHA.append(f'Liga Educa: "{info}" no cuadra con el día de la semana (jornada del {fecha_j})')
            return x.strftime('%Y-%m-%d'), hora
    AVISOS_FECHA.append(f'Liga Educa: no encuentro el día de "{info}" cerca de la jornada del {fecha_j}')
    return fecha_j, hora


def cuando_educa(cal, n, f, fecha_j):
    """Día, hora y si ha terminado un partido de la Liga Educa (el día y la hora salen del calendario)"""
    c = next((x for x in cal if x['jornada'] == n and x['local'] == f['local'] and x['visitante'] == f['visitante']), None)
    info = ' '.join(c['info']) if c else ''
    fecha, hora = dia_hora_educa(info, fecha_j)
    estado = f['info'][0] if f['info'] else ''
    return fecha, hora, bool(re.search(r'Finalizado', estado + ' ' + info, re.I))


# ---------- Escudos ----------

def slug(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def bajar_escudo(args):
    nombre, url, origen = args
    ext = (re.search(r'\.(png|jpe?g|gif|webp)(\?|$)', url, re.I) or [None, 'jpg'])[1].lower().replace('jpeg', 'jpg')
    fichero = f'{origen}-{slug(nombre)}.{ext}'
    destino = DIR_ESCUDOS / fichero
    destino = destino.with_suffix('.png')
    if not destino.exists():
        try:
            datos = bajar(url, binario=True)
        except Exception:
            return nombre, None
        # Escudo pequeño (96 px) para que la app pese poco en el móvil
        img = Image.open(io.BytesIO(datos)).convert('RGBA')
        img.thumbnail((96, 96))
        img.save(destino, optimize=True)
    return nombre, f'icons/escudos/{destino.name}'


CORRECCIONES = json.loads((RAIZ / 'herramientas' / 'correcciones.json').read_text(encoding='utf-8'))


def corregir(eq, partidos, grupo):
    """Arreglos a mano (herramientas/correcciones.json) de fechas u horas mal puestas en la web, solo mientras siga el error"""
    for j, c in CORRECCIONES.get(eq['id'], {}).items():
        p = next((x for x in partidos if str(x['j']) == j and not x.get('descansa')), None)
        if not p or any(p.get(k) != v for k, v in c['si_web'].items()):
            continue
        p.update({k: c[k] for k in ('fecha', 'hora') if k in c})
        for jr in grupo:
            for m in jr['partidos'] if jr['j'] == int(j) else []:
                if NOSOTROS.search(m['l']) or NOSOTROS.search(m['v']):
                    m.update({'f': c.get('fecha', m.get('f')), 'h': c.get('hora', m.get('h'))})


def main():
    DIR_ESCUDOS.mkdir(parents=True, exist_ok=True)
    salida = dict(actualizado=datetime.now(timezone.utc).isoformat(timespec='seconds'), equipos=[])
    avisos = []
    # Con nombres de equipo (p. ej. "infantil") solo se repiten esos y se conservan los demás
    solo = set(sys.argv[1:])
    previo = {}
    fichero = RAIZ / 'js' / 'datos.js'
    if solo and fichero.exists():
        txt = fichero.read_text(encoding='utf-8')
        previo = {e['id']: e for e in json.loads(txt[txt.index('{'):txt.rindex('}') + 1])['equipos']}
    bajar('https://www.rfaf.es/pnfg/')
    with ThreadPoolExecutor(6) as pool:
        for eq in EQUIPOS:
            if solo and eq['id'] not in solo and eq['id'] in previo:
                salida['equipos'].append(previo[eq['id']])
                continue
            t = time.time()
            partidos, tabla, escudos, grupo = (equipo_rfaf if eq['web'] == 'rfaf' else equipo_educa)(eq, pool)
            corregir(eq, partidos, grupo)
            locales = dict(pool.map(bajar_escudo, [(k, v if v.startswith('http') else 'https://www.rfaf.es' + v, eq['web'])
                                                    for k, v in escudos.items()]))
            if len(partidos) != eq['jornadas']:
                avisos.append(f'{eq["nombre"]}: {len(partidos)} jornadas en la web (se esperaban {eq["jornadas"]})')
            nuestras = [r for r in tabla if NOSOTROS.search(r['equipo'])]
            if len(nuestras) != 1:
                avisos.append(f'{eq["nombre"]}: {len(nuestras)} filas de la clasificación parecen nuestras (debe ser 1)')
            fila = next((r for r in tabla if NOSOTROS.search(r['equipo'])), None)
            jug = [p for p in partidos if p.get('goles')]
            gf = sum(p['goles'][0 if p['casa'] else 1] for p in jug)
            gc = sum(p['goles'][1 if p['casa'] else 0] for p in jug)
            if fila and 'gf' in fila and (gf, gc) != (fila['gf'], fila['gc']):
                avisos.append(f'{eq["nombre"]}: goles {gf}-{gc} en los partidos y {fila["gf"]}-{fila["gc"]} en la clasificación')
            if fila and 'dif' in fila and gf - gc != fila['dif']:
                avisos.append(f'{eq["nombre"]}: diferencia {gf - gc} en los partidos y {fila["dif"]} en la clasificación')
            if fila and fila['j'] != len(jug):
                avisos.append(f'{eq["nombre"]}: {len(jug)} partidos con resultado y {fila["j"]} jugados en la clasificación')
            salida['equipos'].append(dict(id=eq['id'], nombre=eq['nombre'], cat=eq['cat'], fuente='RFAF' if eq['web'] == 'rfaf' else 'Liga Educa',
                                          partidos=partidos, tabla=tabla, escudos=locales, grupo=grupo))
            print(f'{eq["nombre"]}: {sum(1 for p in partidos if not p.get("descansa"))} partidos, '
                  f'{len(tabla)} equipos en la tabla, {sum(1 for v in locales.values() if v)}/{len(locales)} escudos '
                  f'({time.time() - t:.0f}s)', flush=True)
    avisos += list(dict.fromkeys(AVISOS_FECHA))
    salida['avisos'] = avisos
    js = ('/* Generado por herramientas/actualizar.py desde rfaf.es y educationleague.es. No editar a mano. */\n'
          f'window.DATOS = {json.dumps(salida, ensure_ascii=False, indent=1)};\n')
    (RAIZ / 'js' / 'datos.js').write_text(js, encoding='utf-8')
    print('Avisos:\n- ' + '\n- '.join(avisos) if avisos else 'Sin avisos.')


if __name__ == '__main__':
    sys.exit(main())
