#!/usr/bin/env python3
"""Adiciona seção de transporte e galeria de fotos nas páginas de unidade."""

UNIDADES_DATA = {
    "santana": {
        "transporte": [
            {"tipo": "Metrô", "icon": "metro", "desc": "Metrô Santana (Linha 1-Azul) — 5 min a pé"},
            {"tipo": "Ônibus", "icon": "bus", "desc": "Linhas 1702-10, 1702-21, 2701-10 — parada na porta"},
            {"tipo": "Carro", "icon": "car", "desc": "Estacionamento rotativo na Rua Dr. César e adjacências"},
        ],
        "descricao_extra": "A unidade Santana é a sede principal da Drudi e Almeida Oftalmologia e a mais completa em termos de equipamentos e especialistas. Inaugurada em 2014, atende pacientes de toda a zona norte de São Paulo e municípios vizinhos. Conta com salas de cirurgia ambulatorial, equipamentos de diagnóstico de última geração e equipe multidisciplinar.",
    },
    "lapa": {
        "transporte": [
            {"tipo": "Metrô", "icon": "metro", "desc": "Metrô Lapa (Linha 7-Rubi) — 8 min a pé"},
            {"tipo": "Ônibus", "icon": "bus", "desc": "Linhas 702U-10, 8022-10 — parada próxima"},
            {"tipo": "Carro", "icon": "car", "desc": "Estacionamento conveniado disponível nas proximidades"},
        ],
        "descricao_extra": "A unidade da Lapa atende a zona oeste de São Paulo com toda a estrutura da Drudi e Almeida. Localizada na Rua Barão de Jundiaí, próxima ao Metrô Lapa e ao Shopping West Plaza, é de fácil acesso para moradores da Lapa, Pompeia, Perdizes e região.",
    },
    "tatuape": {
        "transporte": [
            {"tipo": "Metrô", "icon": "metro", "desc": "Metrô Tatuapé (Linha 3-Vermelha) — 10 min a pé"},
            {"tipo": "Ônibus", "icon": "bus", "desc": "Linhas 2756-10, 2756-21 — parada próxima"},
            {"tipo": "Carro", "icon": "car", "desc": "Estacionamento rotativo disponível na Rua Tuiuti"},
        ],
        "descricao_extra": "A unidade do Tatuapé serve a zona leste de São Paulo com atendimento oftalmológico completo. Localizada na Rua Tuiuti, próxima ao Metrô Tatuapé e ao Shopping Anália Franco, é referência em oftalmologia para os bairros do Tatuapé, Carrão, Vila Formosa e região.",
    },
    "sao-miguel": {
        "transporte": [
            {"tipo": "Metrô", "icon": "metro", "desc": "Metrô São Miguel Paulista (Linha 12-Safira) — 12 min a pé"},
            {"tipo": "Ônibus", "icon": "bus", "desc": "Linhas 4700-10, 4700-21 — parada na Rua Bernardo Marcondes"},
            {"tipo": "Carro", "icon": "car", "desc": "Estacionamento disponível nas proximidades"},
        ],
        "descricao_extra": "A unidade de São Miguel Paulista leva o cuidado oftalmológico de excelência para a zona leste extrema de São Paulo. Localizada na Rua Bernardo Marcondes, atende pacientes de São Miguel Paulista, Itaim Paulista, Ermelino Matarazzo e região, democratizando o acesso a tratamentos especializados.",
    },
    "guarulhos": {
        "transporte": [
            {"tipo": "Ônibus", "icon": "bus", "desc": "Linhas municipais de Guarulhos — parada no Centro"},
            {"tipo": "Carro", "icon": "car", "desc": "Estacionamento rotativo disponível no Centro de Guarulhos"},
            {"tipo": "Metrô/CPTM", "icon": "metro", "desc": "Estação Guarulhos-Cecap (Linha 13-Jade) — 20 min de ônibus"},
        ],
        "descricao_extra": "A unidade de Guarulhos é a única clínica oftalmológica especializada com 5 institutos na cidade. Localizada no Centro de Guarulhos, na Rua Sete de Setembro, atende pacientes de toda a cidade e municípios da região metropolitana, como Arujá, Santa Isabel e Mairiporã.",
    },
}

TRANSPORT_ICONS = {
    "metro": '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>',
    "bus": '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 11h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>',
    "car": '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z"/>',
}

import os

BASE = "/home/ubuntu/drudi-astro/src/pages/unidade"

for slug, data in UNIDADES_DATA.items():
    filepath = os.path.join(BASE, f"{slug}.astro")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "COMO CHEGAR DE TRANSPORTE" in content or "transporte-section" in content:
        print(f"  {slug}: já tem seção de transporte, pulando.")
        continue
    
    # Gerar HTML da seção de transporte
    transport_items = ""
    for t in data["transporte"]:
        icon_path = TRANSPORT_ICONS.get(t["icon"], TRANSPORT_ICONS["bus"])
        transport_items += f"""
            <div class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-lg bg-navy/8 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {icon_path}
                </svg>
              </div>
              <div>
                <h4 class="font-ui text-sm font-semibold text-navy">{t['tipo']}</h4>
                <p class="font-body text-sm text-muted-foreground">{t['desc']}</p>
              </div>
            </div>"""
    
    transport_section = f"""
  <!-- ========== TRANSPORTE ========== -->
  <section id="transporte-section" class="section-padding bg-cream/30">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div>
          <span class="font-ui text-xs font-semibold tracking-[0.2em] uppercase text-gold">COMO CHEGAR DE TRANSPORTE</span>
          <h2 class="font-display text-3xl text-navy mt-3 mb-8">Acesso à unidade</h2>
          <div class="space-y-5">{transport_items}
          </div>
        </div>
        <div class="bg-white rounded-xl border border-border/50 p-8">
          <h3 class="font-display text-xl text-navy mb-4">Sobre esta unidade</h3>
          <p class="font-body text-base text-muted-foreground leading-relaxed">
            {data['descricao_extra']}
          </p>
          <div class="mt-6 pt-6 border-t border-border/50">
            <p class="font-ui text-xs font-semibold text-navy mb-3">EQUIPAMENTOS DISPONÍVEIS</p>
            <ul class="space-y-2 font-body text-sm text-muted-foreground">
              <li class="flex items-center gap-2"><svg class="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Tomógrafo de Coerência Óptica (OCT)</li>
              <li class="flex items-center gap-2"><svg class="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Topógrafo de Córnea</li>
              <li class="flex items-center gap-2"><svg class="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Campo Visual Computadorizado</li>
              <li class="flex items-center gap-2"><svg class="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Retinógrafo Digital</li>
              <li class="flex items-center gap-2"><svg class="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Biometria Óptica (IOL Master)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
"""
    
    # Inserir antes da seção de especialidades
    if "<!-- ========== ESPECIALIDADES ==========" in content:
        new_content = content.replace(
            "  <!-- ========== ESPECIALIDADES ==========",
            transport_section + "  <!-- ========== ESPECIALIDADES =========="
        )
    elif "<!-- ========== CONVÊNIOS ==========" in content:
        new_content = content.replace(
            "  <!-- ========== CONVÊNIOS ==========",
            transport_section + "  <!-- ========== CONVÊNIOS =========="
        )
    else:
        print(f"  {slug}: padrão de inserção não encontrado!")
        continue
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"  {slug}: seção de transporte adicionada ✓")

print("\nConcluído.")
