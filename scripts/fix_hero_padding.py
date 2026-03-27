#!/usr/bin/env python3
"""
Corrige o padding-top dos containers de hero em todas as páginas
para que o breadcrumb apareça abaixo do header fixo (h-16 md:h-20 = 64px/80px).

Estratégia:
- Containers com py-14, py-16, py-20, py-24 → trocar por pt-28 pb-14/pb-16/pb-20
- Containers com py-12 → pt-28 pb-12
- Médicos: padding-top:116px já está correto (>80px), mas o Breadcrumb está DEPOIS do H1 — mover para antes
- Unidades: têm nav antigo inline + Breadcrumb duplicado — remover nav antigo
"""
import os
import re

pages_dir = "/home/ubuntu/drudi-astro/src/pages"

# Páginas e suas correções específicas
fixes = {
    # Institutos — container "relative container py-14"
    "instituto/catarata.astro":    ("relative container py-14", "relative container pb-14 pt-28"),
    "instituto/ceratocone.astro":  ("relative container py-14", "relative container pb-14 pt-28"),
    "instituto/glaucoma.astro":    ("relative container py-14", "relative container pb-14 pt-28"),
    "instituto/retina.astro":      ("relative container py-14", "relative container pb-14 pt-28"),
    "instituto/estrabismo.astro":  ("relative container py-14", "relative container pb-14 pt-28"),
    # Sobre
    "sobre.astro":                 ("relative container pb-14 pt-32", "relative container pb-14 pt-28"),
    # Blog index
    "blog/index.astro":            ("relative container pb-16 pt-32", "relative container pb-16 pt-28"),
    # Arte e Visão
    "arte-e-visao.astro":          ("relative container pb-16 pt-32", "relative container pb-16 pt-28"),
    # Contato
    "contato.astro":               ("relative container py-20", "relative container pb-16 pt-28"),
    # Convênios
    "convenios.astro":             ("relative container py-20 md:py-24", "relative container pb-16 pt-28 md:pt-32"),
    # Tecnologia
    "tecnologia.astro":            None,  # tratamento especial abaixo
}

# Unidades — têm nav antigo E Breadcrumb duplicado
unidades = ["guarulhos", "lapa", "santana", "sao-miguel", "tatuape"]

changed = []

for rel_path, fix in fixes.items():
    full_path = os.path.join(pages_dir, rel_path)
    if not os.path.exists(full_path):
        print(f"  ⚠️  Não encontrado: {rel_path}")
        continue
    
    content = open(full_path).read()
    original = content
    
    if fix is not None:
        old, new = fix
        if old in content:
            content = content.replace(old, new, 1)
            print(f"  ✅ {rel_path}: '{old}' → '{new}'")
        else:
            print(f"  ⚠️  {rel_path}: padrão não encontrado: '{old}'")
    
    if content != original:
        open(full_path, 'w').write(content)
        changed.append(rel_path)

# Tecnologia — buscar o container do hero e corrigir
tec_path = os.path.join(pages_dir, "tecnologia.astro")
if os.path.exists(tec_path):
    content = open(tec_path).read()
    original = content
    # Buscar o container do hero da tecnologia
    for old_pat in ["relative container py-20", "relative container py-16", "relative container py-14", "relative container py-24"]:
        if old_pat in content:
            content = content.replace(old_pat, "relative container pb-16 pt-28", 1)
            print(f"  ✅ tecnologia.astro: '{old_pat}' → 'relative container pb-16 pt-28'")
            break
    if content != original:
        open(tec_path, 'w').write(content)
        changed.append("tecnologia.astro")

# Médicos — padding-top:116px já é suficiente, mas verificar se Breadcrumb está antes do H1
for med in ["medico/dr-fernando-drudi.astro", "medico/dra-priscilla-almeida.astro"]:
    full_path = os.path.join(pages_dir, med)
    if not os.path.exists(full_path):
        continue
    content = open(full_path).read()
    original = content
    # Aumentar padding-top para 140px para garantir visibilidade
    content = content.replace("padding-top:116px", "padding-top:140px")
    if content != original:
        open(full_path, 'w').write(content)
        changed.append(med)
        print(f"  ✅ {med}: padding-top 116px → 140px")

# Unidades — remover nav antigo inline (que ainda existe em algumas)
nav_pattern = re.compile(
    r'\s*<nav class="flex items-center gap-2 font-ui text-xs text-cream/60 mb-6">\s*'
    r'<a href="/" class="hover:text-gold transition-colors">In[íi]cio</a>\s*'
    r'<span>/</span>\s*'
    r'.*?</nav>',
    re.DOTALL
)

for unidade in unidades:
    full_path = os.path.join(pages_dir, f"unidade/{unidade}.astro")
    if not os.path.exists(full_path):
        continue
    content = open(full_path).read()
    original = content
    
    # Remover nav antigo se existir
    new_content = nav_pattern.sub('', content)
    
    # Corrigir padding do container do hero
    for old_pat in ["relative container py-20", "relative container py-16", "relative container py-14"]:
        if old_pat in new_content:
            new_content = new_content.replace(old_pat, "relative container pb-16 pt-28", 1)
            print(f"  ✅ unidade/{unidade}.astro: container hero corrigido")
            break
    
    if new_content != original:
        open(full_path, 'w').write(new_content)
        changed.append(f"unidade/{unidade}.astro")
        print(f"  ✅ unidade/{unidade}.astro: nav antigo removido + padding corrigido")

# Médicos — verificar se o container do hero tem padding suficiente
# (já usa padding-top:116px inline, mas pode ter py- no container interno)
for med in ["medico/dr-fernando-drudi.astro", "medico/dra-priscilla-almeida.astro"]:
    full_path = os.path.join(pages_dir, med)
    if not os.path.exists(full_path):
        continue
    content = open(full_path).read()
    # O container interno usa py-12 md:py-20 — não precisa mudar pois o section já tem padding-top:140px

print(f"\n✅ Total de arquivos alterados: {len(changed)}")
for f in changed:
    print(f"   - {f}")
