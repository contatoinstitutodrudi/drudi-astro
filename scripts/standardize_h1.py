#!/usr/bin/env python3
"""
Padroniza os H1 de todas as páginas:
1. Destaque dourado: sempre <em class="text-gold italic"> (nunca not-italic, nunca só span)
2. Fonte do H1: sempre font-display text-4xl md:text-5xl lg:text-6xl (sem clamp inline)
3. Cor: sempre text-cream ou color:#ffffff (sem variação)

Padrão final para o destaque dourado:
  <em class="text-gold italic">palavra</em>
  
Padrão final para o H1:
  class="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-N"
  (sem style="font-size:clamp(...)")
"""
import re, os

pages_dir = "/home/ubuntu/drudi-astro/src/pages"
changed = []

def fix_file(path, fixes):
    content = open(path).read()
    original = content
    for old, new in fixes:
        content = content.replace(old, new)
    if content != original:
        open(path, 'w').write(content)
        changed.append(path)
        print(f"  ✅ {path.replace(pages_dir+'/', '')}")
    else:
        print(f"  ⚪ {path.replace(pages_dir+'/', '')} (sem alteração)")

# ─── index.astro ─────────────────────────────────────────────────────────────
# Problema: <em class="not-italic" style="color:#c9a961">excelência</em>
# Solução:  <em class="text-gold italic">excelência</em>
fix_file(f"{pages_dir}/index.astro", [
    ('<em class="not-italic" style="color:#c9a961">excelência</em> e <em class="not-italic" style="color:#c9a961">cuidado</em>',
     '<em class="text-gold italic">excelência</em> e <em class="text-gold italic">cuidado</em>'),
])

# ─── sobre.astro ─────────────────────────────────────────────────────────────
# Problema: <em class="not-italic" style="color:#c9a961">Drudi e Almeida</em>
# H1 usa clamp inline → padronizar para text-4xl md:text-5xl lg:text-6xl
fix_file(f"{pages_dir}/sobre.astro", [
    ('<h1 class="font-display leading-[1.1] mb-4" style="font-size:clamp(2rem,5vw,3.25rem);color:#ffffff">',
     '<h1 class="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.1] mb-4">'),
    ('<em class="not-italic" style="color:#c9a961">Drudi e Almeida</em>',
     '<em class="text-gold italic">Drudi e Almeida</em>'),
    # Remover o span branco redundante após o em
    ('<br/>\n          <span style="color:#ffffff">Oftalmologia</span>',
     '<br/>Oftalmologia'),
])

# ─── contato.astro ───────────────────────────────────────────────────────────
# Problema: <span class="text-gold italic"> → trocar para <em class="text-gold italic">
fix_file(f"{pages_dir}/contato.astro", [
    ('<span class="text-gold italic">Contato</span>',
     '<em class="text-gold italic">Contato</em>'),
])

# ─── tecnologia.astro ────────────────────────────────────────────────────────
fix_file(f"{pages_dir}/tecnologia.astro", [
    ('<span class="text-gold italic">Oftalmologia</span>',
     '<em class="text-gold italic">Oftalmologia</em>'),
])

# ─── convenios.astro ─────────────────────────────────────────────────────────
fix_file(f"{pages_dir}/convenios.astro", [
    ('<span class="text-gold italic">Saúde Aceitos</span>',
     '<em class="text-gold italic">Saúde Aceitos</em>'),
    # Padronizar tamanho (já usa text-4xl md:text-5xl lg:text-6xl, ok)
])

# ─── arte-e-visao.astro ──────────────────────────────────────────────────────
# Problema: <em class="not-italic" style="color:#c9a961"> + clamp
fix_file(f"{pages_dir}/arte-e-visao.astro", [
    ('<h1 class="font-display leading-[1.1] mb-5" style="font-size:clamp(2rem,5vw,3.5rem);color:#ffffff">',
     '<h1 class="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.1] mb-5">'),
    ('<em class="not-italic" style="color:#c9a961">Transformou</em>',
     '<em class="text-gold italic">Transformou</em>'),
])

# ─── blog/index.astro ────────────────────────────────────────────────────────
# Já usa <span class="text-gold italic"> — trocar para em
fix_file(f"{pages_dir}/blog/index.astro", [
    ('<span class="text-gold italic">Ocular</span>',
     '<em class="text-gold italic">Ocular</em>'),
])

# ─── institutos ──────────────────────────────────────────────────────────────
# Problema: <em class="not-italic" style="color:#c9a84c; font-style:italic;">
# Solução: <em class="text-gold italic">
# Também padronizar H1 (já usa text-4xl md:text-5xl lg:text-6xl, ok)
instituto_fixes = [
    ('<em class="not-italic" style="color:#c9a84c; font-style:italic;">Catarata</em>',
     '<em class="text-gold italic">Catarata</em>'),
    ('<em class="not-italic" style="color:#c9a84c; font-style:italic;">Ceratocone</em>',
     '<em class="text-gold italic">Ceratocone</em>'),
    ('<em class="not-italic" style="color:#c9a84c; font-style:italic;">Glaucoma:</em>',
     '<em class="text-gold italic">Glaucoma:</em>'),
    ('<em class="not-italic" style="color:#c9a84c; font-style:italic;">Retina</em>',
     '<em class="text-gold italic">Retina</em>'),
    ('<em class="not-italic" style="color:#c9a84c; font-style:italic;">Estrabismo</em>',
     '<em class="text-gold italic">Estrabismo</em>'),
    # Remover style="color:#ffffff" redundante nos spans dentro do H1
    ('<span style="color:#ffffff;">com tecnologia e cuidado</span>',
     'com tecnologia e cuidado'),
    ('<span style="color:#ffffff;">com excelentes especialistas</span>',
     'com excelentes especialistas'),
    ('<span style="color:#ffffff;">diagnóstico precoce para preservar sua visão</span>',
     'diagnóstico precoce para preservar sua visão'),
    ('<span style="color:#ffffff;">em São Paulo</span>',
     'em São Paulo'),
    ('<span style="color:#ffffff;">para crianças e adultos</span>',
     'para crianças e adultos'),
    # Padronizar cor do H1 dos institutos (já usa !important inline, manter)
]

for inst in ['catarata', 'ceratocone', 'glaucoma', 'retina', 'estrabismo']:
    fix_file(f"{pages_dir}/instituto/{inst}.astro", instituto_fixes)

# ─── unidades ────────────────────────────────────────────────────────────────
# Problema: <em class="text-gold not-italic"> → trocar not-italic por italic
# Padronizar tamanho: text-4xl md:text-5xl → text-4xl md:text-5xl lg:text-6xl
unidade_fixes = [
    ('<em class="text-gold not-italic">', '<em class="text-gold italic">'),
    ('class="font-display text-4xl md:text-5xl text-cream leading-tight mb-4"',
     'class="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.1] mb-4"'),
]

for unidade in ['guarulhos', 'lapa', 'santana', 'sao-miguel', 'tatuape']:
    fix_file(f"{pages_dir}/unidade/{unidade}.astro", unidade_fixes)

# ─── médicos ─────────────────────────────────────────────────────────────────
# H1 dos médicos não tem destaque dourado (nome completo), mas padronizar fonte
medico_fixes = [
    ('<h1 class="font-display leading-tight mb-2" style="font-size:clamp(2rem,4vw,3rem);color:#ffffff">',
     '<h1 class="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-2">'),
]

for med in ['dr-fernando-drudi', 'dra-priscilla-almeida']:
    fix_file(f"{pages_dir}/medico/{med}.astro", medico_fixes)

print(f"\n✅ Total de arquivos alterados: {len(changed)}")
for f in changed:
    print(f"   - {f.replace(pages_dir+'/', '')}")
