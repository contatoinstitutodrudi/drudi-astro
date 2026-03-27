#!/usr/bin/env python3
"""
Remove os badges/pills hero separados que coexistem com o <Breadcrumb> nas páginas.
Também remove o nav antigo duplicado do blog index.

Badges a remover (padrão):
  <div class="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6 aos-element">
    <svg .../>
    <span class="font-ui text-xs font-semibold text-gold tracking-wide">NOME DO INSTITUTO</span>
  </div>

Blog index — nav antigo:
  <nav class="flex items-center gap-2 font-ui text-xs text-cream/60 mb-5">
    <a href="/">Início</a>
    <span>/</span>
    <span class="text-cream">Blog</span>
  </nav>
"""

import re
from pathlib import Path

BASE = Path("/home/ubuntu/drudi-astro/src")

# ─────────────────────────────────────────────────────────────────────────────
# 1. Institutos — remover badge pill hero (bg-gold/15 border border-gold/30 rounded-full)
#    O badge ocupa 3–5 linhas; vamos remover o bloco <div ...> ... </div>
# ─────────────────────────────────────────────────────────────────────────────

INSTITUTO_FILES = [
    BASE / "pages/instituto/catarata.astro",
    BASE / "pages/instituto/ceratocone.astro",
    BASE / "pages/instituto/glaucoma.astro",
    BASE / "pages/instituto/retina.astro",
    BASE / "pages/instituto/estrabismo.astro",
]

# Pattern: <div class="inline-flex ... bg-gold/15 border border-gold/30 rounded-full ...">
#   (qualquer conteúdo interno, incluindo svg e span)
# </div>
# Usamos uma abordagem linha-a-linha para ser preciso.

def remove_badge_pill(text: str) -> tuple[str, int]:
    """Remove o bloco <div ... bg-gold/15 border border-gold/30 rounded-full ...> ... </div>"""
    lines = text.split("\n")
    result = []
    skip = False
    depth = 0
    removed = 0

    i = 0
    while i < len(lines):
        line = lines[i]

        if not skip:
            # Detectar início do badge pill hero
            if (
                "inline-flex" in line
                and "bg-gold/15" in line
                and "border-gold/30" in line
                and "rounded-full" in line
                and "aos-element" in line  # só os badges hero dos institutos
            ):
                skip = True
                depth = line.count("<div") - line.count("</div>")
                removed += 1
                i += 1
                continue
        else:
            depth += line.count("<div") - line.count("</div>")
            if depth <= 0:
                skip = False
                i += 1
                continue
            i += 1
            continue

        result.append(line)
        i += 1

    return "\n".join(result), removed


for fpath in INSTITUTO_FILES:
    if not fpath.exists():
        print(f"  SKIP (not found): {fpath.name}")
        continue
    original = fpath.read_text(encoding="utf-8")
    modified, count = remove_badge_pill(original)
    if count > 0:
        fpath.write_text(modified, encoding="utf-8")
        print(f"  ✅ {fpath.name}: removido {count} badge(s) pill hero")
    else:
        print(f"  — {fpath.name}: nenhum badge encontrado (já limpo ou padrão diferente)")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Tecnologia — remover badge "Arte & Ciência a Serviço da Visão"
#    Padrão: <div class="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-5">
# ─────────────────────────────────────────────────────────────────────────────

TECNOLOGIA = BASE / "pages/tecnologia.astro"
if TECNOLOGIA.exists():
    text = TECNOLOGIA.read_text(encoding="utf-8")
    lines = text.split("\n")
    result = []
    skip = False
    depth = 0
    removed = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        if not skip:
            if (
                "inline-flex" in line
                and "bg-gold/15" in line
                and "border-gold/30" in line
                and "rounded-full" in line
                and "mb-5" in line
            ):
                skip = True
                depth = line.count("<div") - line.count("</div>")
                removed += 1
                i += 1
                continue
        else:
            depth += line.count("<div") - line.count("</div>")
            if depth <= 0:
                skip = False
                i += 1
                continue
            i += 1
            continue
        result.append(line)
        i += 1
    if removed > 0:
        TECNOLOGIA.write_text("\n".join(result), encoding="utf-8")
        print(f"  ✅ tecnologia.astro: removido {removed} badge(s) pill hero")
    else:
        print(f"  — tecnologia.astro: nenhum badge encontrado")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Sobre — remover badge "Nossa História"
#    Padrão: <div ... rounded-full ... style="background:rgba(201,169,97,...
#    Aparece na seção de história (não no hero)
#    Mas o badge que aparece NO HERO (acima do breadcrumb) é diferente —
#    vamos verificar se há um badge no hero do sobre.astro
# ─────────────────────────────────────────────────────────────────────────────

SOBRE = BASE / "pages/sobre.astro"
if SOBRE.exists():
    text = SOBRE.read_text(encoding="utf-8")
    # O badge "Nossa História" que aparece na imagem está ACIMA do breadcrumb no hero
    # Padrão: inline-flex ... bg-gold/15 border border-gold/30 rounded-full ... mb-5 ou mb-6
    lines = text.split("\n")
    result = []
    skip = False
    depth = 0
    removed = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        if not skip:
            if (
                "inline-flex" in line
                and "bg-gold/15" in line
                and "border-gold/30" in line
                and "rounded-full" in line
                and ("mb-5" in line or "mb-6" in line or "mb-4" in line)
            ):
                skip = True
                depth = line.count("<div") - line.count("</div>")
                removed += 1
                i += 1
                continue
        else:
            depth += line.count("<div") - line.count("</div>")
            if depth <= 0:
                skip = False
                i += 1
                continue
            i += 1
            continue
        result.append(line)
        i += 1
    if removed > 0:
        SOBRE.write_text("\n".join(result), encoding="utf-8")
        print(f"  ✅ sobre.astro: removido {removed} badge(s) pill hero")
    else:
        print(f"  — sobre.astro: nenhum badge pill hero encontrado")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Blog index — remover nav antigo duplicado
#    <nav class="flex items-center gap-2 font-ui text-xs text-cream/60 mb-5">
# ─────────────────────────────────────────────────────────────────────────────

BLOG_INDEX = BASE / "pages/blog/index.astro"
if BLOG_INDEX.exists():
    text = BLOG_INDEX.read_text(encoding="utf-8")
    # Remove o bloco <nav class="flex items-center gap-2 font-ui text-xs text-cream/60 mb-5">
    # que contém Início / Blog (o antigo)
    pattern = r'\s*<nav class="flex items-center gap-2 font-ui text-xs text-cream/60 mb-5">.*?</nav>'
    new_text, count = re.subn(pattern, "", text, flags=re.DOTALL)
    if count > 0:
        BLOG_INDEX.write_text(new_text, encoding="utf-8")
        print(f"  ✅ blog/index.astro: removido {count} nav antigo duplicado")
    else:
        print(f"  — blog/index.astro: nav antigo não encontrado (padrão diferente)")
        # Tentar padrão alternativo
        pattern2 = r'\s*<nav[^>]*text-cream/60[^>]*>.*?</nav>'
        new_text2, count2 = re.subn(pattern2, "", text, flags=re.DOTALL)
        if count2 > 0:
            BLOG_INDEX.write_text(new_text2, encoding="utf-8")
            print(f"  ✅ blog/index.astro: removido {count2} nav antigo (padrão alternativo)")


# ─────────────────────────────────────────────────────────────────────────────
# 5. Verificar se há outros badges pill hero em páginas não listadas
# ─────────────────────────────────────────────────────────────────────────────

print("\n=== Verificação final: badges pill hero restantes ===")
for fpath in (BASE / "pages").rglob("*.astro"):
    text = fpath.read_text(encoding="utf-8")
    if "bg-gold/15" in text and "border-gold/30" in text and "rounded-full" in text:
        # Verificar se é um badge hero (não um badge de categoria de post ou similar)
        lines = [l for l in text.split("\n") if "bg-gold/15" in l and "border-gold/30" in l and "rounded-full" in l]
        for l in lines:
            if "inline-flex" in l:
                print(f"  ⚠️  {fpath.relative_to(BASE)}: badge pill ainda presente → {l.strip()[:80]}")

print("\nScript concluído.")
