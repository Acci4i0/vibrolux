# Vibrolux Display / Vibrolux Text

Font parametrici disegnati dal logotipo Vibrolux.

- **Vibrolux Display** (Bold): titoli e cifre — largo, pesante, angoli esterni ampi, contrografismi rettangolari, tagli a filo nei punti di giunzione.
- **Vibrolux Text** (Light 300, Regular 400, Bold 700): testo — stessa geometria, larghezza normale, senza tagli.

Rigenerare: `pip install shapely fonttools brotli ttfautohint-py && python3 build.py` → `out/*.ttf|woff2`, poi copiare i `.woff2` in `app/fonts/`.
I parametri di ogni stile (spessori, raggi, larghezze, filo) sono in `STYLES` dentro `build.py`; i glifi in `glyphs.py`.

Spaziatura: margini ottici per lettera (`SB` in `build.py`: lato dritto, tondo, diagonale, aperto).
Kerning: misurato sui contorni per le coppie con un lato aperto o diagonale (AV, To, LT, P., “A…), con un minimo di bianco garantito.
Hinting: ttfautohint sui Text; il Display resta senza (usato solo in grande).
Prove: `python3 grid.py <font>.ttf "ABC" out.png` (tavola con linee di riferimento), `python3 kproof.py out.png` (parole e kerning).
