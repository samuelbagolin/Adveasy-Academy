import { Course } from "./types";

export const courseData: Course = {
  title: "Transformando Consultas Gratuitas em Clientes Pagos",
  description: "O Método Adveasy para Advogados",
  modules: [
    {
      id: "m1",
      title: "1. Introdução",
      lessons: [
        {
          id: "l1-1",
          title: "1.1. Bem-vindo",
          content: `
# Bem-vindo ao Curso: Transformando Consultas Gratuitas em Clientes Pagos

Seja muito bem-vindo ao nosso curso, especialmente desenvolvido para você, advogado cadastrado na plataforma Adveasy! Aqui, você encontrará ferramentas e conhecimentos valiosos para transformar suas consultas gratuitas em clientes que pagam pelos seus serviços.

### Objetivos do Curso
Neste curso, nosso foco será:
* **Capacitar advogados** a identificar e entender a mentalidade dos clientes que utilizam consultas gratuitas.
* **Ensinar a construção de um funil de vendas jurídico eficaz**, abordando as etapas necessárias para a conversão dos leads.
* **Desenvolver habilidades de copywriting ético**, que ajudam a criar uma comunicação persuasiva e eficaz.
* **Preparar advogados para lidar com objeções**, transformando-as em oportunidades de fechamento.
* **Implementar estratégias para aumentar o ticket médio** através de uma escada de valor e ofertas complementares.

### O que você irá aprender
Durante o curso você irá:
* Entender a visão e as expectativas dos clientes em relação às consultas.
* Construir um funil de vendas estratégico que maximize suas conversões.
* Aplicar técnicas de copywriting que convertem leads em clientes efetivos.
* Lidar com objeções de forma eficaz, utilizando-as a seu favor.
* Aumentar o valor dos seus serviços com propostas completas que fidelizam seu cliente.
          `
        }
      ]
    },
    {
      id: "m2",
      title: "2. Mentalidade do Cliente",
      lessons: [
        {
          id: "l2-1",
          title: "2.1. A visão do cliente",
          content: `
# A Visão do Cliente

Quando falamos sobre consultas gratuitas, é crucial compreender a percepção que seus clientes têm desse serviço. Muitas vezes, os clientes chegam até você com altas expectativas, motivados pela promessa de uma orientação legal sem custos, mas é a expectativa que eles criam em torno desse atendimento que pode determinar seu nível de satisfação e, consequentemente, a possibilidade de converter essa consulta em um cliente pagante.

### Expectativas dos Clientes
Os clientes costumam imaginar que as consultas gratuitas são uma oportunidade perfeita para esclarecer suas dúvidas e obter soluções rápidas para seus problemas. Eles esperam não apenas uma escuta atenta, mas também uma orientação clara sobre as possíveis saídas para suas questões legais.

### Motivação para Buscar Consultas Gratuitas
As motivações podem variar:
* Falta de recursos financeiros.
* Maneira de avaliar a qualidade do serviço antes de se comprometerem financeiramente.

Compreender como os clientes percebem as consultas gratuitas é o primeiro passo para criar uma conexão genuína.
          `
        },
        {
          id: "l2-2",
          title: "2.2. Expectativas versus Realidade",
          content: `
# Expectativas versus Realidade

Existe uma diferença significativa entre o que o cliente espera receber e o que realmente pode ser oferecido em uma consulta gratuita.

### Expectativas do Cliente
* **Soluções Imediatas:** Esperam respostas rápidas e diretas.
* **Profissionalismo e Empatia:** Desejam ser ouvidos e respeitados.
* **Informação Clara:** Esperam explicações simples sobre caminhos legais.

### A Realidade dos Serviços
* **Limitações de Tempo:** Consultas gratuitas normalmente têm um tempo restrito.
* **Complexidade do Caso:** Questões legais podem ser mais complexas do que o cliente imagina.
* **Expectativa de Fechamento Imediato:** Nem sempre é viável fechar o contrato logo após a primeira conversa.

Gerenciar essas expectativas com clareza é fundamental para aumentar a chance de conversão.
          `
        },
        {
          id: "l2-3",
          title: "2.3. Identificando Necessidades",
          content: `
# Identificando Necessidades

Compreender as reais necessidades dos clientes durante a consulta inicial é crucial.

### A Importância da Escuta Ativa
Ao ouvir atentamente, você identifica não apenas os problemas imediatos, mas também as preocupações subjacentes. Faça perguntas abertas que incentivem o cliente a compartilhar mais sobre sua situação.

### Perguntas Estratégicas
* “Qual é o principal desafio que você está enfrentando?”
* “O que você espera alcançar com esta consulta?”
* Pergunte sobre experiências anteriores com advogados.

### Observação das Emoções
Preste atenção à linguagem corporal, tom de voz e expressões faciais. Isso fornece pistas sobre as verdadeiras preocupações por trás da situação apresentada.
          `
        },
        {
          id: "l2-4",
          title: "2.4. Objeções Comuns",
          content: `
# Objeções Comuns

Reconhecer objeções demonstra que você está ouvindo e oferece oportunidades para abordá-las de maneira eficaz.

### Tipos Comuns de Objeções
1. **Preocupação com o preço:** Hesitação devido ao custo.
2. **Dúvidas sobre a eficácia:** Questionamento se suas habilidades serão suficientes.
3. **Comparações com outros profissionais:** Comparação de valores e serviços.

### Estratégias de Abordagem
* **Escuta Atenta:** Demonstre que leva as preocupações a sério.
* **Respondendo com Empatia:** "Entendo que o custo é uma preocupação, e isso é completamente válido..."
* **Apresentando Valor:** Utilize exemplos concretos de sua experiência.
* **Oferecendo Alternativas:** Apresente diferentes pacotes de serviços.
          `
        },
        {
          id: "l2-5",
          title: "2.5. Construindo Confiança",
          content: `
# Construindo Confiança

A confiança é um dos pilares fundamentais na relação entre advogado e cliente.

### Táticas para Construir Credibilidade
* **Valorização do Relacionamento:** Abordagem acolhedora, sorriso e contato visual.
* **Comunicação Clara e Transparente:** Evite jargões jurídicos complexos.
* **Compartilhamento de Conhecimento:** Eduque o cliente sobre as nuances de sua questão.
* **Mostrando Empatia:** Valide as emoções do cliente.
* **Reforço Positivo:** Elogie o cliente por buscar ajuda.
* **Avaliações e Testemunhos:** Compartilhe casos de sucesso (respeitando a confidencialidade).
          `,
          quiz: [
            {
              id: "q1",
              text: "Quais são as principais expectativas dos clientes em relação às consultas gratuitas?",
              options: [
                "Soluções imediatas e profissionalismo",
                "Atendimento exclusivo e personalizado em tempos de crise",
                "Somente informações gerais sobre o processo legal",
                "Consulta sem custo e sem compromisso"
              ],
              correctAnswer: 0
            },
            {
              id: "q2",
              text: "Como a escuta ativa pode ajudar a identificar as necessidades dos clientes?",
              options: [
                "Permite que o advogado interrompa o cliente para dar a solução logo",
                "Serve apenas para fazer o cliente se sentir ouvido, sem impacto técnico",
                "Permite compreender as preocupações e motivações, facilitando uma conexão forte",
                "Ajuda a reduzir o tempo da consulta para atender mais pessoas"
              ],
              correctAnswer: 2
            },
            {
              id: "q3",
              text: "Qual é uma das objeções mais comuns que os clientes levantam durante a consulta?",
              options: [
                "Desejo de discutir apenas questões financeiras",
                "Incerteza sobre o custo dos serviços",
                "Preferência por consultas presenciais apenas",
                "Necessidade de uma consulta mais longa"
              ],
              correctAnswer: 1
            }
          ]
        }
      ]
    },
    {
      id: "m3",
      title: "3. Funil de Vendas Jurídico",
      lessons: [
        {
          id: "l3-1",
          title: "3.1. Entendendo o Cliente",
          content: `
# Entendendo o Cliente no Funil

Entender as nuances da mentalidade do cliente é fundamental para proporcionar uma experiência que supere expectativas.

### Motivação por trás da Busca
* **Preocupação financeira:** Hesitação em investir sem certeza de retorno.
* **Necessidade de validação:** Confirmar percepções sobre o problema legal.

A forma como você aborda a consulta inicial é o fator determinante nos próximos passos do cliente.
          `
        },
        {
          id: "l3-2",
          title: "3.2. Construindo o Funil de Vendas",
          content: `
# Etapas do Funil de Vendas Jurídico

1. **Captura de Leads:** Atração via marketing, redes sociais, e-books ou consulta gratuita.
2. **Qualificação de Leads:** Analisar quem tem maior potencial para se tornar cliente pagante.
3. **Apresentação de Propostas:** Comunicação clara sobre como seus serviços resolvem o problema.
4. **Acompanhamento (Follow-up):** Manter o interesse vivo e mitigar objeções após a proposta.
5. **Fechamento:** Formalização da contratação e celebração da decisão do cliente.
          `
        },
        {
          id: "l3-3",
          title: "3.3. Copywriting Persuasivo",
          content: `
# Fundamentos do Copywriting Ético

* **Ética:** Comunicação verdadeira e transparente. Evite promessas enganosas.
* **Conexão Emocional:** Fale diretamente sobre os sentimentos e dores do cliente.
* **Estrutura do Texto:** Títulos impactantes, corpo claro com benefícios e Call to Action (CTA) direta.
* **Linguagem Simples:** Evite jargões que confundem o cliente.
          `
        },
        {
          id: "l3-4",
          title: "3.4. Lidando com Objeções",
          content: `
# Transformando Desafios em Oportunidades

Objeções indicam áreas onde o cliente ainda não está convencido.

### Exemplos e Respostas
1. **'Estou sem dinheiro':** Apresente planos flexíveis e foque no retorno do investimento.
2. **'Preciso de tempo':** Ofereça informações adicionais ou uma sessão de esclarecimento.
3. **'Seu serviço é caro':** Reforce o valor e a distinção do seu serviço.

### Técnicas de Fechamento
* **Fechamento por resumo:** Resuma os benefícios discutidos.
* **Fechamento alternativo:** Ofereça opções de datas para início.
          `
        },
        {
          id: "l3-5",
          title: "3.5. Estratégias de Aumento de Ticket",
          content: `
# Elevando o Ticket Médio

### A Escada de Valor
Crie uma sequência de serviços. Comece com a consulta gratuita, passe para uma consulta paga profunda e chegue à assessoria completa.

### Ofertas Complementares
Proponha serviços adicionais (revisão de documentos, suporte contínuo) durante ou após a consulta.

### Acompanhamento
O acompanhamento fortalece o relacionamento e aumenta as chances de retorno e recomendações.
          `,
          quiz: [
            {
              id: "q4",
              text: "Qual é a primeira etapa do funil de vendas jurídico?",
              options: [
                "Qualificação de leads",
                "Atração de leads (Captura)",
                "Fechamento",
                "Apresentação de propostas"
              ],
              correctAnswer: 1
            },
            {
              id: "q5",
              text: "Como é possível transformar objeções em oportunidades de venda?",
              options: [
                "Finalizando a conversa rapidamente",
                "Ignorando as objeções",
                "Desconsiderando os feedbacks dos clientes",
                "Abordando as objeções com clareza e propondo soluções"
              ],
              correctAnswer: 3
            },
            {
              id: "q6",
              text: "Quais são as características de uma comunicação eficaz no copywriting jurídico?",
              options: [
                "Uso excessivo de termos latinos para demonstrar autoridade",
                "Promessas de ganho de causa garantido",
                "Persuasão, personalização para o cliente, destaque de valor e resolução de problemas",
                "Textos longos e complexos para justificar o preço"
              ],
              correctAnswer: 2
            }
          ]
        }
      ]
    },
    {
      id: "m4",
      title: "4. Copywriting Persuasivo",
      lessons: [
        {
          id: "l4-1",
          title: "4.1. Princípios do Copywriting",
          content: `
# Princípios Fundamentais

1. **Conheça Seu Público-Alvo:** Entenda dores, aspirações e motivações.
2. **Título Impactante:** A porta de entrada. Deve ser irresistível.
3. **Poder das Emoções:** Conecte-se emocionalmente para aumentar a conversão.
4. **Clareza e Simplicidade:** Frases curtas, sem jargões.
5. **CTA Convincente:** Direcione o leitor ao próximo passo.
6. **Teste e Aprimoramento:** Use métricas para refinar seu texto.
          `
        },
        {
          id: "l4-2",
          title: "4.2. Identificando o Cliente Ideal",
          content: `
# O Cliente Ideal (Persona)

Crie uma representação semi-fictícia baseada em dados reais.
* **Segmentação:** Divida por demografia, comportamento e necessidades.
* **Linguagem:** Use o vocabulário que ressoe com o seu público específico.
          `
        },
        {
          id: "l4-3",
          title: "4.3. Estrutura de uma Copy Eficaz",
          content: `
# A Estrutura Vencedora

* **O Título:** Deve prender a atenção imediatamente.
* **O Corpo:** Desenvolve a proposta de valor e usa histórias de sucesso.
* **A CTA:** O convite direto para a ação (ex: "Agende sua consulta agora").
          `
        },
        {
          id: "l4-4",
          title: "4.4. Técnicas de Persuasão (Cialdini)",
          content: `
# Os 6 Princípios de Cialdini na Advocacia

1. **Reciprocidade:** Ofereça valor (consulta gratuita) primeiro.
2. **Compromisso e Coerência:** Encoraje pequenos passos iniciais.
3. **Aprovação Social:** Use depoimentos e casos de sucesso.
4. **Autoridade:** Destaque sua formação e experiência.
5. **Escassez:** Crie urgência (vagas limitadas).
6. **Afinidade:** Construa uma relação amigável e genuína.
          `
        },
        {
          id: "l4-5",
          title: "4.5. Revisão e Melhoria",
          content: `
# O Processo de Refinamento

* **Distância Temporal:** Revise após algumas horas.
* **Leitura em Voz Alta:** Verifique a fluidez.
* **Foco no Público:** A mensagem ressoa com as necessidades dele?
* **A/B Testing:** Teste diferentes títulos e CTAs.
          `,
          quiz: [
            {
              id: "q7",
              text: "Qual dos seguintes princípios de persuasão é fundamental para estabelecer uma conexão de confiança?",
              options: [
                "Aprovação Social",
                "Autoridade",
                "Escassez",
                "Reciprocidade"
              ],
              correctAnswer: 3
            },
            {
              id: "q8",
              text: "Ao escrever uma copy, qual é a principal função da chamada para ação (CTA)?",
              options: [
                "Reduzir objeções dos clientes",
                "Oferecer informações adicionais",
                "Encaminhar o leitor a uma ação específica",
                "Atrair visitantes ao site"
              ],
              correctAnswer: 2
            },
            {
              id: "q9",
              text: "Quais são duas técnicas para aprimorar a conversão de uma copy?",
              options: [
                "Aumentar o preço e diminuir o texto",
                "Uso de A/B Testing e coleta de feedback",
                "Usar mais jargões e cores vibrantes",
                "Remover a CTA e focar apenas na história"
              ],
              correctAnswer: 1
            }
          ]
        }
      ]
    },
    {
      id: "m5",
      title: "5. Resumo",
      lessons: [
        {
          id: "l5-1",
          title: "5.1. Conclusão",
          content: `
# Parabéns!

Você completou o curso **'Transformando Consultas Gratuitas em Clientes Pagos: O Método Adveasy para Advogados'**.

Agora você está equipado com conhecimento e ferramentas práticas para:
* Identificar e entender a mentalidade dos clientes.
* Construir um funil de vendas jurídico eficaz.
* Desenvolver habilidades de copywriting ético e persuasivo.
* Lidar com objeções de forma profissional.
* Implementar estratégias de aumento de ticket médio.

Aproveite esse aprendizado para transformar sua prática jurídica e obter melhores resultados!
          `
        }
      ]
    }
  ]
};
