// ─── Banco de dados dos posts do blog ────────────────────────────────────────
// Arquivo separado para que getStaticPaths possa importar os dados corretamente

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  date: string;
  author: string;
  authorCRM: string;
  authorImg: string;
  keywords: string;
  content: string;
  relatedSlugs: string[];
}

export const allPosts: BlogPost[] = [
  {
    slug: "injecao-antivegf-o-que-e",
    title: "Injeção Intravítrea Anti-VEGF: O Que É, Para Quem É Indicada e Como Funciona",
    excerpt: "Descubra tudo sobre a injeção intravítrea anti-VEGF: o que é, para quem é indicada, como funciona o procedimento, frequência do tratamento, custo, cobertura por convênio e eficácia na Drudi e Almeida Oftalmologia.",
    category: "Retina",
    readTime: "10 min",
    image: "/images/blog-capa-injecao-intravitrea-XwivpU9Ad769VUTFChHBRt.webp",
    date: "2026-03-01",
    author: "Dr. Fernando Macei Drudi",
    authorCRM: "CRM-SP 139.300",
    authorImg: "/images/dr-fernando-800w.webp",
    keywords: "injeção intravítrea, anti-VEGF, DMRI, retinopatia diabética, tratamento retina São Paulo",
    content: `
      <h2>O que é a injeção intravítrea anti-VEGF?</h2>
      <p>A injeção intravítrea anti-VEGF é um dos tratamentos mais importantes da oftalmologia moderna para doenças que afetam a retina. O procedimento consiste na aplicação de um medicamento diretamente dentro do olho (no vítreo) para bloquear o VEGF — fator de crescimento vascular endotelial —, uma proteína que estimula o crescimento anormal de vasos sanguíneos frágeis e permeáveis.</p>
      <p>Esses vasos anormais são responsáveis por vazamentos, hemorragias e edemas que destroem progressivamente as células da retina, levando à perda de visão central. Ao bloquear o VEGF, o medicamento interrompe esse processo e, em muitos casos, permite a recuperação parcial ou total da visão.</p>
      <h2>Para quais doenças é indicada?</h2>
      <p>A injeção anti-VEGF é o tratamento de primeira linha para diversas condições graves da retina:</p>
      <ul>
        <li><strong>Degeneração Macular Relacionada à Idade (DMRI) úmida</strong> — principal causa de cegueira em maiores de 50 anos no mundo ocidental</li>
        <li><strong>Retinopatia Diabética Proliferativa</strong> — complicação do diabetes que afeta os vasos da retina</li>
        <li><strong>Edema Macular Diabético (EMD)</strong> — acúmulo de líquido na mácula causado pelo diabetes</li>
        <li><strong>Oclusão de Veia da Retina</strong> — bloqueio de veias retinianas que causa edema e hemorragias</li>
        <li><strong>Neovascularização Coroidal</strong> — crescimento de vasos anormais sob a retina em diversas condições</li>
      </ul>
      <h2>Como funciona o procedimento?</h2>
      <p>O procedimento é realizado em ambiente ambulatorial, com duração de aproximadamente 15 a 20 minutos. O paciente recebe anestesia tópica com colírio anestésico, e o olho é preparado com antisséptico (iodo-povidona) para prevenir infecções. O médico aplica o medicamento com uma agulha fina na parte branca do olho (esclera), a cerca de 3,5 a 4 mm do limbo corneano.</p>
      <p>Embora o procedimento possa causar desconforto leve, não é doloroso. Após a injeção, o paciente pode sentir uma leve pressão no olho e visão temporariamente turva, que se resolve em poucas horas. O retorno às atividades normais é possível no dia seguinte.</p>
      <h2>Com que frequência as injeções são necessárias?</h2>
      <p>A frequência varia conforme a doença e a resposta ao tratamento. Os protocolos mais comuns são:</p>
      <ul>
        <li><strong>Fase de ataque:</strong> 3 injeções mensais consecutivas para saturar o tecido com o medicamento</li>
        <li><strong>Fase de manutenção:</strong> injeções a cada 4 a 12 semanas, dependendo da atividade da doença</li>
        <li><strong>Protocolo treat-and-extend:</strong> o intervalo entre injeções é gradualmente aumentado conforme a doença é controlada</li>
      </ul>
      <p>O acompanhamento com OCT (tomografia de coerência óptica) é fundamental para monitorar a resposta ao tratamento e ajustar o protocolo.</p>
      <h2>Quais medicamentos anti-VEGF são utilizados?</h2>
      <p>No Brasil, os principais medicamentos aprovados são:</p>
      <ul>
        <li><strong>Ranibizumabe (Lucentis®)</strong> — fragmento de anticorpo desenvolvido especificamente para uso ocular</li>
        <li><strong>Aflibercepte (Eylea®)</strong> — proteína de fusão com alta afinidade pelo VEGF, com intervalo de aplicação mais longo</li>
        <li><strong>Bevacizumabe (Avastin®)</strong> — anticorpo monoclonal usado off-label, com custo reduzido</li>
        <li><strong>Faricimabe (Vabysmo®)</strong> — medicamento de nova geração que bloqueia dois alvos (VEGF e Ang-2)</li>
      </ul>
      <h2>O convênio cobre a injeção anti-VEGF?</h2>
      <p>Sim. A ANS obriga os planos de saúde a cobrirem a injeção intravítrea anti-VEGF para as indicações aprovadas, incluindo DMRI úmida, edema macular diabético e oclusão de veia da retina. A cobertura inclui o procedimento e o medicamento (ranibizumabe e aflibercepte estão no rol obrigatório).</p>
      <p>Na Drudi e Almeida, aceitamos Bradesco Saúde, Amil, Unimed, Prevent Senior, Mediservice, Pró-PM, Ameplam e outros. Entre em contato para verificar a cobertura do seu plano.</p>
      <h2>Qual o custo da injeção anti-VEGF particular?</h2>
      <p>O custo varia conforme o medicamento utilizado. O bevacizumabe (Avastin®) tem custo mais acessível, enquanto o ranibizumabe e o aflibercepte têm custo mais elevado. O procedimento em si (honorários médicos e materiais) tem custo separado do medicamento. Consulte nossa equipe para informações atualizadas de preços.</p>
      <h2>Quais são os riscos e efeitos colaterais?</h2>
      <p>A injeção intravítrea é um procedimento seguro quando realizado por especialista em ambiente adequado. Os riscos existem, mas são raros:</p>
      <ul>
        <li><strong>Endoftalmite</strong> (infecção intraocular) — risco de 0,01 a 0,05% por injeção</li>
        <li><strong>Descolamento de retina</strong> — risco muito baixo (&lt;0,01%)</li>
        <li><strong>Hemorragia vítrea</strong> — possível em casos com neovascularização ativa</li>
        <li><strong>Aumento transitório da pressão intraocular</strong> — comum nas primeiras horas, geralmente sem consequências</li>
      </ul>
      <h2>Conclusão</h2>
      <p>A injeção intravítrea anti-VEGF revolucionou o tratamento das doenças da retina, transformando condições que antes levavam inevitavelmente à cegueira em doenças controláveis. O diagnóstico precoce e o início imediato do tratamento são fundamentais para preservar a visão.</p>
      <p>Se você ou um familiar apresenta sintomas como visão distorcida, mancha escura no centro da visão ou perda súbita de visão, agende uma avaliação urgente com nosso Instituto da Retina.</p>
    `,
    relatedSlugs: ["tratamento-glaucoma-sp", "cirurgia-catarata-sp-preco"],
  },
  {
    slug: "crosslinking-ceratocone-sp",
    title: "Crosslinking para Ceratocone em SP: Preço, Convênio e Recuperação Completa [2026]",
    excerpt: "Descubra tudo sobre o crosslinking para ceratocone em São Paulo, incluindo como funciona, custos, cobertura por convênios e o processo de recuperação. Entenda por que este tratamento é essencial para estabilizar a doença.",
    category: "Ceratocone",
    readTime: "10 min",
    image: "/images/blog-capa-crosslinking-4aHuWSXtfzy92aLXe2Fz2S.webp",
    date: "2026-02-17",
    author: "Dra. Priscilla R. de Almeida",
    authorCRM: "CRM-SP 148.173 | RQE 59.216",
    authorImg: "/images/dra-priscilla-800w.webp",
    keywords: "crosslinking ceratocone São Paulo, preço crosslinking, convênio ceratocone, recuperação crosslinking",
    content: `
      <h2>O que é o Crosslinking e por que é tão importante no ceratocone?</h2>
      <p>O crosslinking (CXL) é o único tratamento capaz de <strong>estabilizar a progressão do ceratocone</strong> — uma doença em que a córnea progressivamente afina e assume uma forma cônica irregular, distorcendo a visão. Sem tratamento, o ceratocone pode evoluir para perda visual grave e necessidade de transplante de córnea.</p>
      <p>O procedimento funciona criando novas ligações químicas entre as fibras de colágeno da córnea, tornando-a mais rígida e resistente. É como "fortalecer" a estrutura da córnea para impedir que ela continue se deformando.</p>
      <h2>Como funciona o procedimento de Crosslinking?</h2>
      <p>O crosslinking convencional (Dresden) é realizado em três etapas:</p>
      <ol>
        <li><strong>Remoção do epitélio:</strong> A camada superficial da córnea (epitélio) é removida para permitir a penetração da riboflavina</li>
        <li><strong>Aplicação de riboflavina:</strong> Colírio de vitamina B2 (riboflavina) é aplicado a cada 3-5 minutos por 30 minutos</li>
        <li><strong>Irradiação com UV-A:</strong> A córnea saturada de riboflavina é exposta à luz ultravioleta (UV-A) por 30 minutos, criando as novas ligações de colágeno</li>
      </ol>
      <p>Existe também o crosslinking acelerado (A-CXL), que usa maior intensidade de UV-A por menor tempo (10 minutos), com resultados comparáveis ao convencional.</p>
      <h2>Quem pode fazer o Crosslinking?</h2>
      <p>O crosslinking é indicado para pacientes com ceratocone em progressão documentada. Os critérios incluem:</p>
      <ul>
        <li>Progressão do ceratocone confirmada por topografia (aumento de curvatura ≥1D em 12 meses)</li>
        <li>Espessura corneana mínima de 400 microns (para segurança do endotélio)</li>
        <li>Ausência de cicatrizes corneanas centrais densas</li>
        <li>Idade mínima geralmente de 14-16 anos (casos mais jovens podem ser tratados com progressão rápida)</li>
      </ul>
      <h2>Qual o preço do Crosslinking em São Paulo em 2026?</h2>
      <p>O custo do crosslinking varia conforme a técnica e o serviço. Em São Paulo, os valores aproximados são:</p>
      <ul>
        <li><strong>Crosslinking convencional (epitélio off):</strong> R$ 3.500 a R$ 5.500 por olho</li>
        <li><strong>Crosslinking acelerado:</strong> R$ 4.000 a R$ 6.000 por olho</li>
        <li><strong>Crosslinking com implante de anel de Ferrara:</strong> R$ 7.000 a R$ 12.000 por olho</li>
      </ul>
      <p>Consulte nossa equipe para orçamento personalizado e condições de parcelamento.</p>
      <h2>O convênio cobre o Crosslinking?</h2>
      <p>Sim. O crosslinking para ceratocone está no rol de procedimentos obrigatórios da ANS desde 2018 (código TUSS 31005079). Os planos de saúde são obrigados a cobrir o procedimento quando há indicação médica documentada de progressão do ceratocone.</p>
      <p>Na Drudi e Almeida, aceitamos Bradesco Saúde, Amil, Unimed, Prevent Senior, Mediservice e outros. Entre em contato para verificar a cobertura do seu plano e iniciar a autorização.</p>
      <h2>Como é a recuperação após o Crosslinking?</h2>
      <p>A recuperação do crosslinking convencional (epitélio off) é mais longa que a do acelerado:</p>
      <ul>
        <li><strong>Primeiros 3-5 dias:</strong> dor moderada, lacrimejamento e fotofobia. Lente de contato terapêutica é colocada para proteger a córnea durante a reepitelização</li>
        <li><strong>1ª semana:</strong> visão turva enquanto o epitélio se regenera. Uso de colírios antibióticos e anti-inflamatórios</li>
        <li><strong>1 mês:</strong> visão começa a estabilizar. Retorno às atividades normais</li>
        <li><strong>3-6 meses:</strong> estabilização da refração. Nova topografia para avaliar resultado</li>
        <li><strong>12-18 meses:</strong> avaliação final do resultado. Em muitos casos, há melhora da curvatura corneana</li>
      </ul>
      <h2>O Crosslinking cura o ceratocone?</h2>
      <p>Não — o crosslinking <strong>estabiliza</strong> a doença, mas não a reverte. O objetivo é impedir a progressão e preservar a visão que o paciente tem. Em muitos casos, há melhora da curvatura corneana e da acuidade visual após o procedimento, mas o resultado principal é a estabilização.</p>
      <p>Após o crosslinking, o paciente geralmente ainda precisará de lentes de contato especiais (esclerais ou rígidas) para correção da visão. Em casos selecionados, o implante de anéis intracorneanos (Ferrara) pode ser combinado ao crosslinking para melhorar a regularidade da córnea.</p>
      <h2>Conclusão</h2>
      <p>O crosslinking é um marco no tratamento do ceratocone. Realizado no momento certo — quando a doença está em progressão —, pode evitar a necessidade de transplante de córnea e preservar a qualidade de vida do paciente por décadas.</p>
      <p>Se você tem ceratocone e ainda não realizou o crosslinking, ou se suspeita que a doença está progredindo, agende uma avaliação com nossa especialista em córnea, Dra. Priscilla de Almeida.</p>
    `,
    relatedSlugs: ["lente-intraocular-monofocal-multifocal-trifocal", "cirurgia-catarata-sp-preco"],
  },
  {
    slug: "lente-intraocular-monofocal-multifocal-trifocal",
    title: "Lente Intraocular: Monofocal, Multifocal ou Trifocal? Qual é a Melhor para Você?",
    excerpt: "Entenda as diferenças entre lentes intraoculares monofocais, multifocais e trifocais para escolher a melhor opção para sua visão. Saiba como cada tipo funciona e qual se adapta ao seu estilo de vida.",
    category: "Catarata",
    readTime: "10 min",
    image: "/images/blog-capa-lente-intraocular-htSBo2x6P3ZoUFUbeM4vyf.webp",
    date: "2026-02-03",
    author: "Dr. Fernando Macei Drudi",
    authorCRM: "CRM-SP 139.300",
    authorImg: "/images/dr-fernando-800w.webp",
    keywords: "lente intraocular, lente monofocal, lente multifocal, lente trifocal, cirurgia catarata lente",
    content: `
      <h2>O que é uma lente intraocular (LIO)?</h2>
      <p>Durante a cirurgia de catarata, o cristalino opacificado é removido e substituído por uma lente intraocular (LIO) artificial. Essa lente permanece dentro do olho pelo resto da vida e é responsável por focar a luz na retina, permitindo a visão nítida.</p>
      <p>A escolha da lente certa é uma das decisões mais importantes da cirurgia de catarata, pois influencia diretamente a qualidade de vida do paciente no pós-operatório. Existem três categorias principais: monofocal, multifocal e trifocal.</p>
      <h2>Lente Monofocal: a opção clássica</h2>
      <p>A lente monofocal é a mais utilizada no mundo e a única coberta pelos planos de saúde no Brasil. Ela foca em uma única distância — geralmente longe —, o que significa que o paciente precisará de óculos para leitura e atividades de perto após a cirurgia.</p>
      <p><strong>Vantagens:</strong> Excelente qualidade de visão para longe, coberta pelos convênios, menor custo, mínimos efeitos de halos e glare.</p>
      <p><strong>Desvantagens:</strong> Necessidade de óculos para perto e intermediário.</p>
      <h2>Lente Multifocal: liberdade dos óculos</h2>
      <p>A lente multifocal possui múltiplos focos, permitindo enxergar bem de perto e de longe sem óculos. Funciona através de anéis concêntricos que dividem a luz entre as distâncias, e o cérebro aprende a selecionar o foco adequado para cada situação.</p>
      <p><strong>Vantagens:</strong> Independência dos óculos na maioria das situações, excelente para leitura e visão de longe.</p>
      <p><strong>Desvantagens:</strong> Halos e glare noturnos, custo mais elevado (não coberto pelo convênio).</p>
      <h2>Lente Trifocal: a evolução da multifocal</h2>
      <p>A lente trifocal é a tecnologia mais avançada disponível atualmente. Além de perto e longe, ela adiciona um terceiro foco para a distância intermediária (40-60 cm) — ideal para uso de computador, tablet e visão de prateleiras em supermercados.</p>
      <p><strong>Vantagens:</strong> Excelente visão nas três distâncias, menor dependência de óculos em todas as situações, menos halos que as multifocais de geração anterior.</p>
      <p><strong>Desvantagens:</strong> Custo mais elevado, ainda pode haver halos noturnos leves.</p>
      <h2>Qual lente é a melhor para mim?</h2>
      <p>A escolha da lente ideal depende de vários fatores individuais: estilo de vida, profissão, saúde ocular, expectativas e orçamento. A decisão deve ser tomada em conjunto com seu cirurgião, após avaliação completa dos seus olhos e estilo de vida.</p>
      <h2>Conclusão</h2>
      <p>Não existe uma lente "melhor" para todos — existe a lente mais adequada para cada paciente. Na Drudi e Almeida, realizamos uma avaliação pré-operatória completa com biometria óptica, topografia e análise do estilo de vida para indicar a lente mais adequada para você. Agende sua consulta.</p>
    `,
    relatedSlugs: ["cirurgia-catarata-convenio", "cirurgia-catarata-sp-preco"],
  },
  {
    slug: "cirurgia-catarata-convenio",
    title: "Cirurgia de Catarata pelo Convênio: Como Funciona, Quais Planos Cobrem e Passo a Passo",
    excerpt: "Entenda a cobertura da cirurgia de catarata pelos planos de saúde, a diferença entre lentes e o processo de autorização. Saiba como a Drudi e Almeida te ajuda em São Paulo e Guarulhos.",
    category: "Catarata",
    readTime: "10 min",
    image: "/images/blog-capa-catarata-convenio-Pb348WhNsLkbqVJALYEaJH.webp",
    date: "2026-01-20",
    author: "Dr. Fernando Macei Drudi",
    authorCRM: "CRM-SP 139.300",
    authorImg: "/images/dr-fernando-800w.webp",
    keywords: "cirurgia catarata convênio, plano de saúde catarata, bradesco catarata, amil catarata, unimed catarata",
    content: `
      <h2>A cirurgia de catarata é coberta pelo convênio?</h2>
      <p>Sim. A cirurgia de catarata é um procedimento coberto obrigatoriamente por todos os planos de saúde no Brasil, conforme determinação da ANS. Isso inclui a facoemulsificação (técnica moderna com ultrassom) e a lente intraocular monofocal.</p>
      <p>O que o convênio <strong>não cobre</strong> é a lente premium (multifocal ou trifocal). Se o paciente optar por uma lente premium, a diferença de valor é paga pelo próprio paciente.</p>
      <h2>Quais convênios a Drudi e Almeida aceita?</h2>
      <p>Atendemos os principais planos de saúde de São Paulo e Guarulhos: Bradesco Saúde, Amil, Unimed, Prevent Senior, Mediservice (MetLife), Pró-PM (Polícia Militar), Ameplam e outros — consulte nossa equipe.</p>
      <h2>Passo a passo para fazer a cirurgia pelo convênio</h2>
      <ol>
        <li><strong>Consulta oftalmológica:</strong> O médico examina o olho e confirma o diagnóstico de catarata com indicação cirúrgica</li>
        <li><strong>Solicitação de autorização:</strong> O médico emite a guia de solicitação com o código do procedimento (TUSS) para o convênio</li>
        <li><strong>Exames pré-operatórios:</strong> Biometria óptica, topografia e exames clínicos gerais</li>
        <li><strong>Autorização do convênio:</strong> O plano analisa e autoriza o procedimento (prazo de até 21 dias úteis pela ANS)</li>
        <li><strong>Agendamento da cirurgia:</strong> Com a autorização em mãos, a cirurgia é agendada</li>
        <li><strong>Cirurgia e recuperação:</strong> Procedimento de 15-20 minutos, retorno domiciliar no mesmo dia</li>
      </ol>
      <h2>O convênio pode negar a cirurgia de catarata?</h2>
      <p>O convênio pode solicitar documentação adicional ou questionar a indicação, mas não pode negar um procedimento que está no rol obrigatório da ANS quando há indicação médica documentada. Se houver negativa indevida, o paciente pode recorrer à ANS (0800 701 9656) ou ao Procon.</p>
      <h2>Conclusão</h2>
      <p>A cirurgia de catarata pelo convênio é um direito do paciente e um processo bem estabelecido. Com a documentação correta e um médico experiente, o processo é simples e rápido. Nossa equipe auxilia em todo o processo de autorização — do pedido ao agendamento.</p>
    `,
    relatedSlugs: ["cirurgia-catarata-sp-preco", "lente-intraocular-monofocal-multifocal-trifocal"],
  },
  {
    slug: "cirurgia-catarata-sp-preco",
    title: "Cirurgia de Catarata em SP: Preço, Convênio e Opções de Lentes [2026]",
    excerpt: "Descubra o que influencia o preço da cirurgia de catarata em São Paulo em 2026, incluindo tipos de lentes, convênios e o que esperar na Drudi e Almeida. Entenda suas opções e agende sua avaliação.",
    category: "Catarata",
    readTime: "10 min",
    image: "/images/blog-capa-catarata-preco-2026-SmukPnNqiheEsfuWRqWA9L.webp",
    date: "2026-01-06",
    author: "Dr. Fernando Macei Drudi",
    authorCRM: "CRM-SP 139.300",
    authorImg: "/images/dr-fernando-800w.webp",
    keywords: "preço cirurgia catarata São Paulo 2026, custo catarata SP, cirurgia catarata valor, quanto custa catarata",
    content: `
      <h2>Qual o preço da cirurgia de catarata em São Paulo em 2026?</h2>
      <p>O preço da cirurgia de catarata em São Paulo varia conforme o tipo de lente escolhida, a clínica e se o procedimento é particular ou pelo convênio. Em 2026, os valores aproximados são:</p>
      <ul>
        <li><strong>Pacote Monofocal (lente padrão):</strong> R$ 2.800 a R$ 4.500 por olho</li>
        <li><strong>Pacote Premium (lente multifocal):</strong> R$ 5.500 a R$ 9.000 por olho</li>
        <li><strong>Pacote Trifocal (lente trifocal):</strong> R$ 7.000 a R$ 12.000 por olho</li>
      </ul>
      <p>Esses valores geralmente incluem consulta pré-operatória, biometria, cirurgia, lente intraocular, honorários médicos e acompanhamento pós-operatório.</p>
      <h2>O que está incluído no preço da cirurgia de catarata?</h2>
      <p>Um pacote completo de cirurgia de catarata deve incluir: consulta oftalmológica pré-operatória, biometria óptica, topografia corneana, cirurgia de facoemulsificação, lente intraocular, honorários do cirurgião e equipe, materiais cirúrgicos e consultas de retorno pós-operatório.</p>
      <h2>Vale a pena pagar pela lente premium?</h2>
      <p>Depende do estilo de vida e das expectativas do paciente. A lente monofocal oferece excelente visão para longe com custo acessível (ou coberta pelo convênio). A lente multifocal ou trifocal oferece independência dos óculos, mas com custo adicional e possibilidade de halos noturnos.</p>
      <h2>Como parcelar a cirurgia de catarata?</h2>
      <p>Na Drudi e Almeida, oferecemos parcelamento em até 10x sem juros no cartão de crédito para cirurgias particulares. Também trabalhamos com financiamento médico para facilitar o acesso ao tratamento.</p>
      <h2>Conclusão</h2>
      <p>A cirurgia de catarata é um investimento na qualidade de vida. Com convênio, o custo pode ser zero (para lente monofocal). Particular, os pacotes completos na Drudi e Almeida começam em R$ 2.800 por olho. Entre em contato para receber um orçamento personalizado.</p>
    `,
    relatedSlugs: ["cirurgia-catarata-convenio", "lente-intraocular-monofocal-multifocal-trifocal"],
  },
  {
    slug: "glaucoma-tem-cura",
    title: "Glaucoma tem cura? Tratamento em São Paulo e o que esperar [2026]",
    excerpt: "Glaucoma não tem cura, mas tem controle. Entenda a diferença, a importância do diagnóstico precoce e os tratamentos disponíveis em São Paulo para preservar sua visão.",
    category: "Glaucoma",
    readTime: "6 min",
    image: "/images/blog-capa-glaucoma-tem-cura-Hk6YTNn5zDiDC3PM4qhFUX.webp",
    date: "2025-11-24",
    author: "Dr. Fernando Macei Drudi",
    authorCRM: "CRM-SP 139.300",
    authorImg: "/images/dr-fernando-800w.webp",
    keywords: "glaucoma tem cura, tratamento glaucoma São Paulo, glaucoma controle, diagnóstico glaucoma",
    content: `
      <h2>Glaucoma tem cura?</h2>
      <p>Não — o glaucoma <strong>não tem cura</strong>, mas tem <strong>controle eficaz</strong>. O glaucoma é uma doença crônica e progressiva que, uma vez instalada, não pode ser revertida. Porém, com tratamento adequado e acompanhamento regular, é possível preservar a visão por toda a vida.</p>
      <p>A visão já perdida pelo glaucoma não pode ser recuperada — as células do nervo óptico que foram danificadas não se regeneram. Por isso, o diagnóstico precoce é absolutamente essencial: quanto antes o tratamento for iniciado, menor será o dano acumulado.</p>
      <h2>O que é o glaucoma?</h2>
      <p>O glaucoma é um grupo de doenças caracterizadas pelo dano progressivo ao nervo óptico, geralmente associado ao aumento da pressão intraocular (PIO). O nervo óptico é responsável por transmitir as imagens captadas pela retina ao cérebro — quando danificado, ocorre perda progressiva do campo visual, começando pela visão periférica.</p>
      <p>O glaucoma é a segunda maior causa de cegueira irreversível no mundo, afetando mais de 80 milhões de pessoas. No Brasil, estima-se que metade dos portadores não sabe que tem a doença, pois ela é assintomática nos estágios iniciais.</p>
      <h2>Como o glaucoma é controlado?</h2>
      <p>O tratamento do glaucoma visa reduzir a pressão intraocular para um nível que o nervo óptico consiga tolerar sem progredir. As opções incluem:</p>
      <ul>
        <li><strong>Colírios hipotensores:</strong> primeira linha de tratamento. Devem ser usados diariamente, para sempre</li>
        <li><strong>Laser (trabeculoplastia):</strong> procedimento ambulatorial que melhora a drenagem do humor aquoso</li>
        <li><strong>Cirurgia (trabeculectomia, dispositivos de drenagem):</strong> indicada quando colírios e laser não controlam adequadamente a pressão</li>
        <li><strong>MIGS (cirurgias minimamente invasivas):</strong> procedimentos modernos com menor risco e recuperação mais rápida</li>
      </ul>
      <h2>Conclusão: diagnóstico precoce é a chave</h2>
      <p>O glaucoma não tem cura, mas com diagnóstico precoce e tratamento adequado, a grande maioria dos pacientes preserva a visão por toda a vida. Se você tem fatores de risco ou não faz exames oftalmológicos há mais de 2 anos, agende uma avaliação no Instituto do Glaucoma da Drudi e Almeida.</p>
    `,
    relatedSlugs: ["tratamento-glaucoma-sp", "injecao-antivegf-o-que-e"],
  },
  {
    slug: "tratamento-glaucoma-sp",
    title: "Tratamento de Glaucoma em SP: Colírios, Cirurgia e Convênios [2026]",
    excerpt: "Explore as opções de tratamento para glaucoma em São Paulo, incluindo colírios e cirurgias, cobertura por convênios como Bradesco, Amil, Unimed e Prevent Senior, e o custo do acompanhamento contínuo.",
    category: "Glaucoma",
    readTime: "8 min",
    image: "/images/blog-capa-glaucoma-coli-rio-cirurgia-bLh2VAfEArsQ7vLykE8F95.webp",
    date: "2025-11-10",
    author: "Dr. Fernando Macei Drudi",
    authorCRM: "CRM-SP 139.300",
    authorImg: "/images/dr-fernando-800w.webp",
    keywords: "tratamento glaucoma São Paulo, colírio glaucoma, cirurgia glaucoma SP, convênio glaucoma",
    content: `
      <h2>Como é o tratamento do glaucoma em São Paulo?</h2>
      <p>O tratamento do glaucoma em São Paulo segue os mesmos protocolos internacionais, com acesso a tecnologias avançadas de diagnóstico e tratamento. O objetivo central é reduzir a pressão intraocular (PIO) para um nível seguro — chamado de "pressão-alvo" — que impeça a progressão do dano ao nervo óptico.</p>
      <h2>Colírios para glaucoma: como funcionam?</h2>
      <p>Os colírios hipotensores são a primeira linha de tratamento do glaucoma. Existem várias classes, com mecanismos de ação diferentes:</p>
      <ul>
        <li><strong>Análogos de prostaglandinas (latanoprosta, bimatoprosta, travoprosta):</strong> aumentam o escoamento do humor aquoso. São os mais eficazes e geralmente usados uma vez ao dia à noite</li>
        <li><strong>Beta-bloqueadores (timolol):</strong> reduzem a produção de humor aquoso. Usados duas vezes ao dia</li>
        <li><strong>Inibidores da anidrase carbônica (dorzolamida, brinzolamida):</strong> reduzem a produção de humor aquoso. Usados 2-3 vezes ao dia</li>
        <li><strong>Alfa-agonistas (brimonidina):</strong> reduzem a produção e aumentam o escoamento. Usados 2-3 vezes ao dia</li>
      </ul>
      <p>O colírio deve ser usado todos os dias, sem interrupção. A falta de adesão ao tratamento é a principal causa de progressão do glaucoma.</p>
      <h2>Laser para glaucoma: trabeculoplastia seletiva (SLT)</h2>
      <p>A trabeculoplastia seletiva a laser (SLT) é um procedimento ambulatorial que melhora a drenagem do humor aquoso pela malha trabecular. O efeito do SLT dura em média 3-5 anos e pode ser repetido. O procedimento é indolor, dura cerca de 10 minutos e não requer internação.</p>
      <h2>Cirurgia de glaucoma: quando é indicada?</h2>
      <p>A cirurgia é indicada quando colírios e laser não controlam adequadamente a pressão intraocular. As principais opções são: Trabeculectomia, Dispositivos de drenagem (válvulas de Ahmed, Baerveldt) e MIGS (Micro-Invasive Glaucoma Surgery).</p>
      <h2>O convênio cobre o tratamento do glaucoma?</h2>
      <p>Sim. O glaucoma é uma doença coberta obrigatoriamente pelos planos de saúde. A cobertura inclui consultas de acompanhamento, exames de campo visual e OCT de nervo óptico, colírios (via farmácia do plano), laser e cirurgia.</p>
      <p>Na Drudi e Almeida, aceitamos Bradesco Saúde, Amil, Unimed, Prevent Senior, Mediservice e outros. Entre em contato para verificar a cobertura do seu plano.</p>
      <h2>Conclusão</h2>
      <p>O tratamento do glaucoma é um compromisso de longo prazo, mas é eficaz. Com adesão ao tratamento e acompanhamento regular, a grande maioria dos pacientes preserva a visão por toda a vida. Agende sua avaliação no Instituto do Glaucoma da Drudi e Almeida.</p>
    `,
    relatedSlugs: ["glaucoma-tem-cura", "injecao-antivegf-o-que-e"],
  },
  {
    slug: "cirurgia-estrabismo-adultos",
    title: "Cirurgia de Estrabismo em Adultos: Mitos, Verdades e o Impacto na Qualidade de Vida [2026]",
    excerpt: "Desvende mitos e verdades sobre a cirurgia de estrabismo em adultos. Entenda os resultados esperados, riscos, recuperação e o impacto na qualidade de vida e autoestima.",
    category: "Estrabismo",
    readTime: "5 min",
    image: "/images/blog-capa-estrabismo-adulto-jWeonVtExtxzHBdYHp59rP.webp",
    date: "2025-10-27",
    author: "Dra. Priscilla R. de Almeida",
    authorCRM: "CRM-SP 148.173 | RQE 59.216",
    authorImg: "/images/dra-priscilla-800w.webp",
    keywords: "cirurgia estrabismo adultos, estrabismo adulto tratamento, operação estrabismo adulto, resultado cirurgia estrabismo",
    content: `
      <h2>Adultos podem operar o estrabismo?</h2>
      <p>Sim — e com excelentes resultados. Um dos maiores mitos sobre o estrabismo é que a cirurgia só funciona em crianças. A realidade é que a cirurgia de estrabismo pode ser realizada em qualquer idade, e adultos frequentemente se beneficiam tanto quanto crianças em termos de alinhamento ocular e qualidade de vida.</p>
      <h2>Mitos e verdades sobre a cirurgia de estrabismo em adultos</h2>
      <p><strong>MITO: "Já passou da idade para operar"</strong><br>
      VERDADE: Não existe limite de idade para a cirurgia de estrabismo. Pacientes de 60, 70 ou 80 anos podem se beneficiar do procedimento.</p>
      <p><strong>MITO: "A cirurgia não vai funcionar porque o cérebro já se adaptou"</strong><br>
      VERDADE: Mesmo que o cérebro tenha suprimido a visão do olho desviado por décadas, o alinhamento cirúrgico melhora significativamente a aparência e pode restaurar algum grau de visão binocular.</p>
      <p><strong>MITO: "A recuperação é muito longa e dolorosa"</strong><br>
      VERDADE: A recuperação é relativamente rápida. A maioria dos adultos retorna ao trabalho em 3-7 dias e às atividades normais em 2 semanas.</p>
      <h2>Como funciona a cirurgia de estrabismo?</h2>
      <p>A cirurgia de estrabismo é realizada sob anestesia geral (ou local com sedação em adultos). O cirurgião acessa os músculos extraoculares através da conjuntiva e realiza recessão (enfraquecimento de um músculo), ressecção (fortalecimento de um músculo) ou transposição (realocação de um músculo).</p>
      <p>Em adultos, frequentemente são utilizadas <strong>suturas ajustáveis</strong> — técnica que permite ajustar o alinhamento no pós-operatório imediato (nas primeiras 24-48 horas), com o paciente acordado, para otimizar o resultado.</p>
      <h2>Qual o impacto na qualidade de vida?</h2>
      <p>Estudos mostram que a cirurgia de estrabismo em adultos tem impacto profundo na qualidade de vida: melhora significativa da autoestima e confiança, melhora nas relações interpessoais e profissionais, redução ou eliminação da visão dupla, melhora da percepção de profundidade e redução da fadiga visual.</p>
      <h2>Conclusão</h2>
      <p>A cirurgia de estrabismo em adultos é segura, eficaz e pode transformar a qualidade de vida. Se você convive com estrabismo há anos e nunca buscou tratamento por acreditar que "já passou da hora", saiba que nunca é tarde. Agende uma avaliação no Instituto de Estrabismo da Drudi e Almeida.</p>
    `,
    relatedSlugs: ["cirurgia-estrabismo-sp", "glaucoma-tem-cura"],
  },
  {
    slug: "cirurgia-estrabismo-sp",
    title: "Cirurgia de Estrabismo em SP: Preço, Convênios e O Que Esperar [2026]",
    excerpt: "Descubra tudo sobre a cirurgia de estrabismo em São Paulo: indicações para adultos e crianças, tipos de procedimento, recuperação, custos e cobertura por convênios.",
    category: "Estrabismo",
    readTime: "5 min",
    image: "/images/blog-capa-cirurgia-estrabismo-preco-ArxvuaKvForqdKjNYFefhA.webp",
    date: "2025-10-13",
    author: "Dra. Priscilla R. de Almeida",
    authorCRM: "CRM-SP 148.173 | RQE 59.216",
    authorImg: "/images/dra-priscilla-800w.webp",
    keywords: "cirurgia estrabismo São Paulo preço, custo operação estrabismo SP, convênio estrabismo, estrabismo criança adulto SP",
    content: `
      <h2>Cirurgia de estrabismo em São Paulo: o que você precisa saber</h2>
      <p>São Paulo concentra alguns dos melhores centros de tratamento de estrabismo do Brasil. A cirurgia de estrabismo é o procedimento definitivo para corrigir o desalinhamento dos olhos quando o tratamento clínico (óculos, tampão, exercícios) não é suficiente.</p>
      <h2>Qual o preço da cirurgia de estrabismo em SP em 2026?</h2>
      <p>O custo da cirurgia de estrabismo em São Paulo varia conforme a complexidade do caso e o número de músculos operados:</p>
      <ul>
        <li><strong>Cirurgia simples (1 olho, 1-2 músculos):</strong> R$ 4.000 a R$ 7.000</li>
        <li><strong>Cirurgia complexa (2 olhos ou músculos múltiplos):</strong> R$ 7.000 a R$ 12.000</li>
        <li><strong>Com suturas ajustáveis:</strong> pode ter acréscimo de R$ 1.000 a R$ 2.000</li>
      </ul>
      <p>Esses valores incluem honorários médicos, anestesia, materiais cirúrgicos e acompanhamento pós-operatório. Consulte nossa equipe para orçamento personalizado.</p>
      <h2>O convênio cobre a cirurgia de estrabismo?</h2>
      <p>Sim. A cirurgia de estrabismo está no rol de procedimentos obrigatórios da ANS e deve ser coberta por todos os planos de saúde quando há indicação médica. Na Drudi e Almeida, aceitamos Bradesco Saúde, Amil, Unimed, Prevent Senior, Mediservice, Pró-PM e outros.</p>
      <h2>Como é a recuperação após a cirurgia de estrabismo?</h2>
      <p>A recuperação é relativamente rápida: olho vermelho por 2-4 semanas (normal e esperado), retorno ao trabalho em 1 semana, atividades físicas leves em 2 semanas, e estabilização definitiva do alinhamento em 3-6 meses.</p>
      <h2>Qual a taxa de sucesso da cirurgia de estrabismo?</h2>
      <p>A taxa de sucesso (alinhamento satisfatório) na primeira cirurgia é de 60-90%, dependendo do tipo e grau do estrabismo. O uso de suturas ajustáveis melhora os resultados, especialmente em adultos. Cerca de 10-30% dos pacientes podem precisar de uma segunda cirurgia para ajuste fino do alinhamento.</p>
      <h2>Conclusão</h2>
      <p>A cirurgia de estrabismo em São Paulo é acessível, segura e com alta taxa de sucesso. Com convênio, o custo pode ser zero. Particular, os pacotes na Drudi e Almeida começam em R$ 4.000. Agende uma avaliação no Instituto de Estrabismo da Drudi e Almeida.</p>
    `,
    relatedSlugs: ["cirurgia-estrabismo-adultos", "cirurgia-catarata-sp-preco"],
  },
];
