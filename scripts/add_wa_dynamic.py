#!/usr/bin/env python3
"""Adiciona script de WhatsApp dinâmico nos institutos que ainda não têm."""
import re
import os

INSTITUTOS = {
    "ceratocone": "Gostaria de saber mais sobre o tratamento de ceratocone",
    "glaucoma":   "Gostaria de receber informações sobre o tratamento de glaucoma",
    "retina":     "Gostaria de receber informações sobre o tratamento de retina",
    "estrabismo": "Gostaria de receber informações sobre o tratamento de estrabismo",
}

SCRIPT_TEMPLATE = """
  // ===== WhatsApp dinâmico: atualiza mensagem conforme unidade selecionada =====
  // whatsapp-dynamic
  const WA_BASE = 'https://wa.me/5511916544653';
  const WA_MSG_BASE = 'Olá! {msg}';

  function buildWaUrl(unidadeNome) {{
    const texto = unidadeNome ? `${{WA_MSG_BASE}} na unidade ${{unidadeNome}}.` : `${{WA_MSG_BASE}}.`;
    return `${{WA_BASE}}?text=${{encodeURIComponent(texto)}}`;
  }}

  const selHero = document.getElementById('unidade-hero');
  const selCta  = document.getElementById('unidade-cta');
  const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me/5511916544653"]'));

  function syncWaLinks(unidadeNome) {{
    const url = buildWaUrl(unidadeNome);
    waLinks.forEach(a => {{ a.href = url; }});
  }}

  function getUnidadeName(sel) {{
    if (!sel || !sel.value) return '';
    return sel.options[sel.selectedIndex].text.split(' —')[0].trim();
  }}

  selHero?.addEventListener('change', () => {{
    const nome = getUnidadeName(selHero);
    syncWaLinks(nome);
    if (selCta) selCta.value = selHero.value;
  }});

  selCta?.addEventListener('change', () => {{
    const nome = getUnidadeName(selCta);
    syncWaLinks(nome);
    if (selHero) selHero.value = selCta.value;
  }});
"""

base = "/home/ubuntu/drudi-astro/src/pages/instituto"

for instituto, msg in INSTITUTOS.items():
    filepath = os.path.join(base, f"{instituto}.astro")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "whatsapp-dynamic" in content:
        print(f"  {instituto}: já tem script dinâmico, pulando.")
        continue
    
    script_block = SCRIPT_TEMPLATE.format(msg=msg)
    
    # Inserir antes do </script> final
    new_content = content.rstrip()
    if new_content.endswith("</script>"):
        new_content = new_content[:-len("</script>")] + script_block + "\n</script>\n"
    else:
        print(f"  {instituto}: padrão não encontrado!")
        continue
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"  {instituto}: script dinâmico adicionado ✓")

print("Concluído.")
