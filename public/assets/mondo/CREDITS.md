# Il mondo visivo del sito

Tutte le foto del sito passano da qui, con un solo trattamento (`tools/grade.py`): quasi monocromo
(4% del colore originale), ombre grafite leggermente fredde, curva a S morbida. Argento, grafite,
antracite, bianco: lo stesso universo per i macro di dettaglio, i capannoni e i paesaggi.

    python3 tools/grade.py originale.jpg public/assets/mondo/nome.jpg

È un mockup privato (il sito è in noindex): serve a Vibrolux e al fotografo per vedere la direzione
prima del servizio fotografico. Le foto di riferimento qui sotto vanno sostituite con quelle del servizio.

## Le foto di Vibrolux

Stessi nomi degli originali in `public/assets/vibrolux/` (dal sito vibrolux.it), trattati con
`tools/grade.py`. Sacra di San Michele (`sacra.jpg`, `sacra-quadrata.jpg`): originali in
`public/assets/sant-ambrogio/` (vedi il suo CREDITS.md).

## Foto di riferimento — Pexels (licenza Pexels: uso libero, attribuzione non richiesta)

- gocce-metallo.jpg — Lavaggi e oliature (tessera) — https://www.pexels.com/photo/32597291/
- cuscinetto.jpg — Tribofinitura isotropica (tessera) — https://www.pexels.com/photo/19911427/
- sfere-acciaio.jpg — Brillantatura (tessera) — https://www.pexels.com/photo/39205814/
- zigrinato.jpg — Home, card nell'apertura — https://www.pexels.com/photo/31970889/
- anelli-pila.jpg — Home, card Lavorazioni — https://www.pexels.com/photo/12951626/
- fresa.jpg — Home, «Servizi qualificati» — https://www.pexels.com/photo/8865189/
- tubo-spazzolato.jpg — Home, «Risultati al massimo livello» — https://www.pexels.com/photo/20856360/
- dadi.jpg — Azienda, Magazzino — https://www.pexels.com/photo/21050460/
- bullone.jpg — Azienda, «Esperienza e qualificazione» — https://www.pexels.com/photo/257759/
- gocce-scure.jpg — Azienda, «Analisi dei processi» — https://www.pexels.com/photo/35563385/
- riflessi.jpg — Azienda, «Soddisfazione del cliente» — https://www.pexels.com/photo/31417510/

## Video

- hero-home.mp4 — Home, apertura — Mixkit #30741 «Light reflections on a metal surface» (Mixkit Stock Video Free License),
  stesso trattamento con ffmpeg: `hue=s=0.04,colorbalance=rs=-0.025:gs=-0.01:bs=0.03,curves=all='0/0.02 0.25/0.215 0.5/0.5 0.75/0.785 1/0.98'`.
  Originale in `public/assets/preview/`.

In libreria, non ancora usate:

- lav-lavaggio-statico.jpg — riserva — https://www.pexels.com/photo/34133277/
- capannone-bn.jpg — riserva — https://www.pexels.com/photo/9489648/
