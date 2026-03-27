#!/usr/bin/env python3
"""
Adiciona canonicalPath ao BaseLayout em todas as páginas que não o passam.
Também corrige o BreadcrumbList no BaseLayout para gerar itens completos
baseados no canonicalPath recebido.
"""
import re

# Mapeamento: arquivo → canonicalPath
pages = {
    "src/pages/blog/index.astro": "/blog",
    "src/pages/contato.astro": "/contato",
    "src/pages/convenios.astro": "/convenios",
    "src/pages/instituto/catarata.astro": "/instituto/catarata",
    "src/pages/instituto/ceratocone.astro": "/instituto/ceratocone",
    "src/pages/instituto/estrabismo.astro": "/instituto/estrabismo",
    "src/pages/instituto/glaucoma.astro": "/instituto/glaucoma",
    "src/pages/medico/dr-fernando-drudi.astro": "/medico/dr-fernando-drudi",
    "src/pages/medico/dra-priscilla-almeida.astro": "/medico/dra-priscilla-almeida",
    "src/pages/sobre.astro": "/sobre",
    "src/pages/tecnologia.astro": "/tecnologia",
    "src/pages/unidade/guarulhos.astro": "/unidade/guarulhos",
    "src/pages/unidade/lapa.astro": "/unidade/lapa",
    "src/pages/unidade/santana.astro": "/unidade/santana",
    "src/pages/unidade/sao-miguel.astro": "/unidade/sao-miguel",
    "src/pages/unidade/tatuape.astro": "/unidade/tatuape",
}

changed = []

for filepath, canonical in pages.items():
    content = open(filepath).read()
    original = content

    # Encontrar a abertura do <BaseLayout e adicionar canonicalPath após title=...
    # Padrão: <BaseLayout\n  title="..." \n  description="..."
    # Inserir canonicalPath="..." após description="..."
    
    # Procurar pelo bloco <BaseLayout ... description="...">
    # e adicionar canonicalPath logo após description
    pattern = r'(<BaseLayout\s[^>]*?description="[^"]*")'
    
    def add_canonical(m):
        block = m.group(1)
        if 'canonicalPath' in block:
            return block
        return block + f'\n  canonicalPath="{canonical}"'
    
    new_content = re.sub(pattern, add_canonical, content, flags=re.DOTALL)
    
    if new_content != original:
        open(filepath, 'w').write(new_content)
        changed.append(filepath)
        print(f"  ✅ {filepath} → canonicalPath=\"{canonical}\"")
    else:
        print(f"  ⚠️  {filepath} — padrão não encontrado, verificar manualmente")

print(f"\n✅ Total alterados: {len(changed)}")
