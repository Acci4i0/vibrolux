import sys
sys.path.insert(0, '/home/claude/font')
from proof import proof
D='VibroluxDisplay-Bold.ttf'; T='VibroluxText-Regular.ttf'; B='VibroluxText-Bold.ttf'; L='VibroluxText-Light.ttf'
proof('', [
 (D,110,'VIBROLUX AVATAR LT'),
 (D,90,'Tribofinitura, Lavaggi.'),
 (D,90,'“Kyoto” Fava Torre P.'),
 (T,72,'HAVANA TOYOTA WAVY LYRA'),
 (T,72,'Favola, Tetto, Yacht, Kevlar.'),
 (T,72,'nonhohnoon ivory keyway'),
 (T,40,'Vibrolux Srl, Sant’Ambrogio (TO): lavaggi e oliature, “brillantatura” e sabbiatura.'),
 (L,40,'Il personale altamente qualificato consente di raggiungere un obiettivo primario.'),
 (B,40,'Tribofinitura isotropica — Ra ≤ 0,1 µm, Vibrofinitura 24/7, ISO 9001:2015.'),
], sys.argv[1], width=1900)
