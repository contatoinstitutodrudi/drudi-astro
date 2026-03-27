#!/usr/bin/env python3
"""Adiciona FAQSchema nos institutos e LocalBusinessSchema nas unidades."""
import re
import os

BASE = "/home/ubuntu/drudi-astro/src/pages"

# ============================================================
# 1. FAQSchema nos institutos (catarata já tem faqItems)
# ============================================================
INSTITUTOS_FAQ = {
    "catarata": {
        "import_line": "import FAQSchema from '../../components/FAQSchema.astro';",
        "faq_var": "faqItems",
        "slot_line": "  <FAQSchema items={faqItems} slot=\"head-schema\" />",
    },
    "ceratocone": {
        "import_line": "import FAQSchema from '../../components/FAQSchema.astro';",
        "faq_var": "faqItems",
        "slot_line": "  <FAQSchema items={faqItems} slot=\"head-schema\" />",
    },
    "glaucoma": {
        "import_line": "import FAQSchema from '../../components/FAQSchema.astro';",
        "faq_var": "faqItems",
        "slot_line": "  <FAQSchema items={faqItems} slot=\"head-schema\" />",
    },
    "retina": {
        "import_line": "import FAQSchema from '../../components/FAQSchema.astro';",
        "faq_var": "faqItems",
        "slot_line": "  <FAQSchema items={faqItems} slot=\"head-schema\" />",
    },
    "estrabismo": {
        "import_line": "import FAQSchema from '../../components/FAQSchema.astro';",
        "faq_var": "faqItems",
        "slot_line": "  <FAQSchema items={faqItems} slot=\"head-schema\" />",
    },
}

for instituto, cfg in INSTITUTOS_FAQ.items():
    filepath = os.path.join(BASE, "instituto", f"{instituto}.astro")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Verificar se já tem FAQSchema
    if "FAQSchema" in content:
        print(f"  instituto/{instituto}: já tem FAQSchema, pulando.")
        continue
    
    # Verificar se tem faqItems
    if "faqItems" not in content:
        print(f"  instituto/{instituto}: não tem faqItems, pulando.")
        continue
    
    # Adicionar import após a primeira linha de import
    content = content.replace(
        "import BaseLayout from '../../layouts/BaseLayout.astro';",
        f"import BaseLayout from '../../layouts/BaseLayout.astro';\n{cfg['import_line']}"
    )
    
    # Adicionar slot após o <BaseLayout ...>
    # Encontrar o padrão: canonicalPath="..." ou description="..." seguido de >
    # e inserir o FAQSchema após o >
    pattern = r'(canonicalPath="[^"]*"\s*\n>)'
    replacement = r'\1\n' + cfg['slot_line']
    new_content = re.sub(pattern, replacement, content, count=1)
    
    if new_content == content:
        # Tentar padrão alternativo: description="..." seguido de >
        pattern2 = r'(description="[^"]*"\s*\n>)'
        new_content = re.sub(pattern2, replacement, content, count=1)
    
    if new_content == content:
        print(f"  instituto/{instituto}: padrão não encontrado para inserir slot!")
        continue
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"  instituto/{instituto}: FAQSchema adicionado ✓")

# ============================================================
# 2. LocalBusinessSchema nas unidades
# ============================================================
UNIDADES = {
    "santana": {
        "nome": "Santana",
        "url": "/unidade/santana",
        "image": "/images/sala_espera_sofa_bege_v4_0b2982e6.webp",
        "rua": "Rua Dr. César, 130",
        "bairro": "Santana",
        "cidade": "São Paulo",
        "cep": "02013-001",
        "lat": -23.5058,
        "lng": -46.6282,
    },
    "lapa": {
        "nome": "Lapa",
        "url": "/unidade/lapa",
        "image": "/images/consultorio_lapa_be866546.webp",
        "rua": "Rua Barão de Jundiaí, 221",
        "bairro": "Lapa",
        "cidade": "São Paulo",
        "cep": "05075-000",
        "lat": -23.5265,
        "lng": -46.7024,
    },
    "tatuape": {
        "nome": "Tatuapé",
        "url": "/unidade/tatuape",
        "image": "/images/sala_espera_sofa_bege_v3_5717e0c0.webp",
        "rua": "Rua Tuiuti, 2429",
        "bairro": "Tatuapé",
        "cidade": "São Paulo",
        "cep": "03307-002",
        "lat": -23.5423,
        "lng": -46.5726,
    },
    "sao-miguel": {
        "nome": "São Miguel Paulista",
        "url": "/unidade/sao-miguel",
        "image": "/images/sala_espera_sofa_bege_v4_0b2982e6.webp",
        "rua": "Rua Bernardo Marcondes, 108",
        "bairro": "São Miguel Paulista",
        "cidade": "São Paulo",
        "cep": "08000-000",
        "lat": -23.4963,
        "lng": -46.4432,
    },
    "guarulhos": {
        "nome": "Guarulhos",
        "url": "/unidade/guarulhos",
        "image": "/images/clinica_guarulhos_8e7690c7.webp",
        "rua": "Rua Sete de Setembro, 375",
        "bairro": "Centro",
        "cidade": "Guarulhos",
        "cep": "07010-000",
        "lat": -23.4628,
        "lng": -46.5330,
    },
}

for slug, u in UNIDADES.items():
    filepath = os.path.join(BASE, "unidade", f"{slug}.astro")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "LocalBusinessSchema" in content:
        print(f"  unidade/{slug}: já tem LocalBusinessSchema, pulando.")
        continue
    
    # Adicionar import
    content = content.replace(
        "import BaseLayout from \"../../layouts/BaseLayout.astro\";",
        "import BaseLayout from \"../../layouts/BaseLayout.astro\";\nimport LocalBusinessSchema from \"../../components/LocalBusinessSchema.astro\";"
    )
    
    # Adicionar slot após o primeiro > do BaseLayout
    # Encontrar padrão: description="..." seguido de >
    slot_line = f"""  <LocalBusinessSchema
    slot="head-schema"
    nome="{u['nome']}"
    url="{u['url']}"
    image="{u['image']}"
    rua="{u['rua']}"
    bairro="{u['bairro']}"
    cidade="{u['cidade']}"
    cep="{u['cep']}"
    lat={{{u['lat']}}}
    lng={{{u['lng']}}}
    telefone="(11) 5430-2421"
    whatsapp="5511916544653"
  />"""
    
    # Inserir após o fechamento do BaseLayout props
    pattern = r'(canonicalPath="[^"]*"\s*\n>)'
    replacement = r'\1\n' + slot_line
    new_content = re.sub(pattern, replacement, content, count=1)
    
    if new_content == content:
        pattern2 = r'(description="[^"]*"\s*\n>)'
        new_content = re.sub(pattern2, replacement, content, count=1)
    
    if new_content == content:
        print(f"  unidade/{slug}: padrão não encontrado!")
        continue
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"  unidade/{slug}: LocalBusinessSchema adicionado ✓")

print("\nConcluído.")
