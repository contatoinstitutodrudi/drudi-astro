#!/usr/bin/env python3
"""
Padroniza o breadcrumb em todas as páginas do site drudi-astro.
- Remove breadcrumbs inline antigos (nav com aria-label="Breadcrumb" ou comentário <!-- Breadcrumb -->)
- Adiciona import do componente Breadcrumb.astro no frontmatter
- Insere <Breadcrumb> ACIMA do H1 em cada página
"""

import re
import os

BASE = "/home/ubuntu/drudi-astro/src"

# Mapeamento: arquivo → itens do breadcrumb
PAGES = {
    # Institutos
    "pages/instituto/catarata.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Institutos", "href": "/institutos"},
        {"label": "Instituto da Catarata"},
    ],
    "pages/instituto/ceratocone.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Institutos", "href": "/institutos"},
        {"label": "Instituto do Ceratocone"},
    ],
    "pages/instituto/glaucoma.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Institutos", "href": "/institutos"},
        {"label": "Instituto do Glaucoma"},
    ],
    "pages/instituto/retina.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Institutos", "href": "/institutos"},
        {"label": "Instituto da Retina"},
    ],
    "pages/instituto/estrabismo.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Institutos", "href": "/institutos"},
        {"label": "Instituto de Estrabismo"},
    ],
    # Médicos
    "pages/medico/dr-fernando-drudi.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Nossa Equipe", "href": "/sobre"},
        {"label": "Dr. Fernando Drudi"},
    ],
    "pages/medico/dra-priscilla-almeida.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Nossa Equipe", "href": "/sobre"},
        {"label": "Dra. Priscilla Almeida"},
    ],
    # Unidades
    "pages/unidade/guarulhos.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Unidades", "href": "/contato"},
        {"label": "Guarulhos Centro"},
    ],
    "pages/unidade/lapa.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Unidades", "href": "/contato"},
        {"label": "Lapa"},
    ],
    "pages/unidade/santana.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Unidades", "href": "/contato"},
        {"label": "Santana"},
    ],
    "pages/unidade/sao-miguel.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Unidades", "href": "/contato"},
        {"label": "São Miguel Paulista"},
    ],
    "pages/unidade/tatuape.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Unidades", "href": "/contato"},
        {"label": "Tatuapé"},
    ],
    # Outras páginas
    "pages/sobre.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Sobre Nós"},
    ],
    "pages/contato.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Contato e Unidades"},
    ],
    "pages/convenios.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Convênios"},
    ],
    "pages/tecnologia.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Tecnologia"},
    ],
    "pages/arte-e-visao.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Arte e Visão"},
    ],
    "pages/blog/index.astro": [
        {"label": "Home", "href": "/"},
        {"label": "Blog"},
    ],
}

IMPORT_LINE = "import Breadcrumb from '../../components/Breadcrumb.astro';"

def build_breadcrumb_tag(items):
    """Gera a tag <Breadcrumb items={[...]} /> com os itens corretos."""
    parts = []
    for item in items:
        if "href" in item:
            parts.append(f'{{ label: "{item["label"]}", href: "{item["href"]}" }}')
        else:
            parts.append(f'{{ label: "{item["label"]}" }}')
    items_str = ", ".join(parts)
    return f'        <Breadcrumb items={{[{items_str}]}} />'

def remove_old_breadcrumb(content):
    """Remove blocos de breadcrumb inline antigos."""
    # Remove comentário + nav (padrão: <!-- Breadcrumb --> seguido de <nav ...aria-label="Breadcrumb"...>...</nav>)
    # Padrão 1: comentário + nav
    content = re.sub(
        r'\s*<!--\s*Breadcrumb[^>]*-->\s*\n\s*<nav[^>]*(?:aria-label="Breadcrumb"|breadcrumb)[^>]*>.*?</nav>',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )
    # Padrão 2: nav sem comentário mas com aria-label="Breadcrumb"
    content = re.sub(
        r'\s*<nav[^>]*aria-label="Breadcrumb"[^>]*>.*?</nav>',
        '',
        content,
        flags=re.DOTALL
    )
    # Padrão 3: nav com class contendo "breadcrumb" (case-insensitive)
    content = re.sub(
        r'\s*<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>.*?</nav>',
        '',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )
    return content

def add_import(content, filepath):
    """Adiciona o import do Breadcrumb no frontmatter se ainda não existir."""
    if "import Breadcrumb" in content:
        return content
    
    # Calcular caminho relativo correto baseado na profundidade do arquivo
    rel_path = filepath.replace(BASE + "/", "")
    depth = rel_path.count("/")
    
    if depth == 1:  # pages/xxx.astro
        import_line = "import Breadcrumb from '../components/Breadcrumb.astro';"
    elif depth == 2:  # pages/subdir/xxx.astro
        import_line = "import Breadcrumb from '../../components/Breadcrumb.astro';"
    else:
        import_line = "import Breadcrumb from '../../components/Breadcrumb.astro';"
    
    # Inserir antes do fechamento do frontmatter (---)
    # Encontrar o segundo ---
    parts = content.split("---", 2)
    if len(parts) >= 3:
        parts[1] = parts[1].rstrip() + f"\nimport Breadcrumb from '../../components/Breadcrumb.astro';\n" if depth == 2 else parts[1].rstrip() + f"\nimport Breadcrumb from '../components/Breadcrumb.astro';\n"
        return "---".join(parts)
    return content

def insert_breadcrumb_before_h1(content, breadcrumb_tag):
    """Insere o <Breadcrumb> imediatamente antes do primeiro <h1."""
    # Encontrar o primeiro <h1 e inserir o breadcrumb antes
    match = re.search(r'(\s*)(<h1[\s>])', content)
    if match:
        indent = match.group(1)
        h1_start = match.group(2)
        # Inserir breadcrumb antes do h1, com mesma indentação
        replacement = f"{indent}{breadcrumb_tag}\n{indent}{h1_start}"
        content = content[:match.start()] + replacement + content[match.end():]
    return content

results = []

for rel_path, items in PAGES.items():
    filepath = os.path.join(BASE, rel_path)
    if not os.path.exists(filepath):
        results.append(f"⚠️  NÃO ENCONTRADO: {rel_path}")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # 1. Remover breadcrumbs antigos
    content = remove_old_breadcrumb(content)
    
    # 2. Adicionar import
    content = add_import(content, filepath)
    
    # 3. Inserir <Breadcrumb> antes do H1
    breadcrumb_tag = build_breadcrumb_tag(items)
    
    # Verificar se já tem <Breadcrumb no conteúdo (após limpeza)
    if "<Breadcrumb" not in content:
        content = insert_breadcrumb_before_h1(content, breadcrumb_tag)
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        results.append(f"✅ Atualizado: {rel_path}")
    else:
        results.append(f"⏭️  Sem mudança: {rel_path}")

print("\n".join(results))
print(f"\nTotal: {len(PAGES)} páginas processadas")
