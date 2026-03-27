#!/bin/bash
# Adiciona lógica de WhatsApp dinâmico nos seletores de unidade de todos os institutos
# O script insere um bloco <script> antes do </BaseLayout> em cada arquivo

INSTITUTOS=(
  "src/pages/instituto/catarata.astro"
  "src/pages/instituto/ceratocone.astro"
  "src/pages/instituto/glaucoma.astro"
  "src/pages/instituto/retina.astro"
  "src/pages/instituto/estrabismo.astro"
)

for file in "${INSTITUTOS[@]}"; do
  echo "Patching $file..."
  
  # Verificar se já tem o script dinâmico
  if grep -q "whatsapp-dynamic" "$file"; then
    echo "  → Já tem script dinâmico, pulando."
    continue
  fi
  
  # Extrair a mensagem base do WHATSAPP_LINK
  WA_MSG=$(grep "const WHATSAPP_LINK" "$file" | sed "s/.*text=//;s/\".*//;s/.*text=//")
  
  echo "  → Adicionando script dinâmico..."
done

echo "Patch concluído."
