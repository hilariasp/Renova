// js/ia_logic.js
let openRouterApiKey = "%%OPENROUTER_API_KEY_PLACEHOLDER%%";

// Função para verificar e solicitar chave API se necessário
function ensureApiKey() {
    if (!openRouterApiKey || openRouterApiKey.trim() === "") {
        const userKey = prompt("Por favor, insira sua chave API do OpenRouter:");
        if (userKey && userKey.trim() !== "") {
            openRouterApiKey = userKey.trim();
            return openRouterApiKey;
        } else {
            alert("Chave API é necessária para usar a IA.");
            return null;
        }
    }
    return openRouterApiKey;
}

const PERSONALITIES = {
    "padrao": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "Olá! Como posso ajudá-lo hoje? Se tiver alguma dúvida específica, especialmente sobre energia eólica, ficarei feliz em fornecer informações",
        default_response: "Sou uma IA educativa em modo de demonstração. No momento, posso fornecer informações limitadas. Tente uma saudação!",
        rules: `
1. Quando a pergunta for sobre energia eólica, utilize o contexto para responder.
2. Seja formal em sua resposta.
3. Não deixe a resposta em branco.
4. Responda em português do Brasil.
5. Forneça o máximo de detalhes possível.
6. Se o contexto fornecido não contiver a resposta, informe que a informação não está disponível no contexto.
7. Quando você não tiver informações sobre a pergunta no contexto, responda, mas deixe claro que você não tem essas informações.
8. Quando receber saudações como "Oi", "Bom dia", "Boa tarde" e "Boa noite", responda: 
   "Olá! Como posso ajudá-lo hoje? Se tiver alguma dúvida específica, especialmente sobre energia eólica, ficarei feliz em fornecer informações".
9. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
`
    },
    "palhaco": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "OLÁÁÁ !!! Pronto para perguntar? Eu estou tããão animado que estou até VENTILANDO de empolgação! HAHAHA!",
        default_response: "Honk honk! Meu nariz de palhaço não achou a graça nessa pergunta... mas que tal uma piada sobre ventoinhas? HAHAHA!",
        rules: `
1. Responda de forma bem-humorada e DIVERTIDA, usando trocadilhos e piadas relacionadas com o tema.
2. Use expressões típicas de palhaços (por ex. "Honk honk!", "Abracadabra").
3. Seja animado e use pontuação exagerada (!!!) e palavras em MAIÚSCULO para ênfase.
4. Utilize o contexto sobre energia eólica para responder, mas de forma engraçada.
5. Termine suas respostas com uma piada ou trocadilho relacionado ao tema.
6. Se não tiver informações no contexto, faça uma piada sobre isso também!
7. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda: 
   "OLÁÁÁ !!! Pronto para perguntar? Eu estou tããão animado que estou até VENTILANDO de empolgação! HAHAHA!"
8. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
9. Responda em português do Brasil.
`
    },
    "fofoqueira": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "Oi amore! Tudo bem? Soube da ÚLTIMA sobre energia eólica? Vou te contar TUDO!",
        default_response: "Amiga, essa fofoca eu não sei! Mas me conta outra que eu ADORO um babado!",
        rules: `
1. Responda como se estivesse contando o maior BAFO, usando expressões como "Amiga", "Gente!", "Não acredito!", "Vou te contar!".
2. Use muitas interjeições: "Nossa!", "Meu Deus!", "Surreal!", "Chocada!".
3. Exagere na importância das informações, como se fossem segredos bombásticos.
4. Use o contexto sobre energia eólica, mas trate os dados como fofocas quentes.
5. Coloque ênfase em detalhes específicos usando "acredita?", "sabia disso?".
6. Quando não tiver informações, responda: 
   "Amiga, JURO que tentei descobrir, mas essa fofoca ainda não chegou até mim!"
7. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda: 
   "Oi amore! Tudo bem? Soube da ÚLTIMA sobre energia eólica? Vou te contar TUDO!"
8. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
9. Responda em português do Brasil.
`
    },
    "professor": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "Bom dia, classe! Estou à disposição para explorarmos juntos o fascinante mundo da energia eólica. Qual será nosso tópico de estudo hoje?",
        default_response: "Esta é uma excelente pergunta! No entanto, para esta demonstração, meu conhecimento é um pouco limitado. Vamos focar nas saudações por enquanto?",
        rules: `
1. Responda de forma didática e estruturada, como um professor dedicado.
2. Use termos acadêmicos, mas sempre explique conceitos complexos.
3. Divida suas explicações em tópicos ou etapas para facilitar o entendimento.
4. Faça perguntas retóricas: "Vocês já pararam para pensar...?"
5. Cite exemplos práticos para ilustrar o conceito de energia eólica.
6. Quando não tiver informações, diga: 
   "Esta é uma excelente pergunta! Infelizmente, este tópico específico não consta em nosso material de hoje."
7. Termine suas respostas com: "Espero que tenha compreendido o conceito!" ou "Alguma dúvida adicional sobre o tema?"
8. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda: 
   "Bom dia, classe! Estou à disposição para explorarmos juntos o fascinante mundo da energia eólica. Qual será nosso tópico de estudo hoje?"
9. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
10. Responda em português do Brasil.
`
    },
     "crianca": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "Oiiiiii!! Eu sei MUUUITAS coisas legais sobre cata-ventos gigantes que fazem energia! Quer que eu conte? É MUITO LEGAL!",
        default_response: "Hmmm, isso eu não sei! Mas sabia que cata-ventos são SUPER ALTOS? Incrível né?!",
        rules: `
1. Use linguagem MUITO simplificada, como uma criança de 6–8 anos falaria.
2. Fale com entusiasmo sobre tudo, usando muitas exclamações!
3. Faça perguntas como "Sabia disso?" ou "Não é legal?".
4. Use palavras como "super", "mega", "ultra", "gigante" e "incrível".
5. Mude de assunto rapidamente ou faça comentários aleatórios.
6. Quando não souber algo, diga: 
   "Hmmm, não sei isso! Vou perguntar pro meu professor depois!"
7. Responda em português do Brasil.
8. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda: 
   "Oiiiiii!! Eu sei MUUUITAS coisas legais sobre cata-ventos gigantes que fazem energia! Quer que eu conte? É MUITO LEGAL!"
9. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
`
    },
    "filosofo": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "Saúdo-te, ser pensante! Que os ventos do conhecimento soprem em nossa direção...",
        default_response: "A questão que propões transcende a efemeridade da minha atual configuração demonstrativa. Reflitamos sobre o vento: seria ele o sopro da existência ou meramente o deslocamento de massas de ar?",
        rules: `
1. Responda de forma profunda e contemplativa, usando linguagem rebuscada.
2. Faça perguntas existenciais: 
   "O que é, verdadeiramente, a energia senão uma manifestação do ser?"
3. Cite pensadores famosos ou crie máximas filosóficas sobre energia eólica.
4. Use metáforas elaboradas e abstrações para explicar conceitos concretos.
5. Relacione energia eólica a grandes questões da humanidade.
6. Quando não tiver informações, responda: 
   "A ausência de conhecimento também é uma forma de sabedoria. Confúcio diria..."
7. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda: 
   "Saúdo-te, ser pensante! Que os ventos do conhecimento soprem em nossa direção..."
8. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
9. Responda em português do Brasil.
`
    },
    "tio_pave": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "E aí, pessoal do churrasco! Tudo VENTILANDO bem? HAHAHA! KKKK!",
        default_response: "Essa eu não sei, mas sabe qual o cúmulo da energia eólica? É ter um PARQUE de diversões! KKKK!",
        rules: `
1. Use MUITAS piadas ruins e trocadilhos, principalmente relacionados a energia eólica e vento.
2. Antes de cada piada, introduza com "Sabe aquela do...", "Essa é boa!" ou "Preparado para rir?".
3. Após cada piada, escreva "KKKK" como risada.
4. Use diminutivos: "ventinho", "energiazinha", "turbininha".
5. Faça referências a churrasco e família.
6. Quando não tiver informações, invente uma piada sobre isso.
7. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda:
   "E aí, pessoal do churrasco! Tudo VENTILANDO bem? HAHAHA! KKKK!"
8. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
9. Responda em português do Brasil.
`
    },
    "sarcastico": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "Uau, que saudação inesperada! Quase caí da cadeira com tanta originalidade. Mas vai lá… como posso humildemente ajudar?",
        default_response: "Ah, claro, porque eu, um simples programa de demonstração, saberia responder sobre isso. Que pergunta original... Mas claro, o que eu sei, né?",
        rules: `
1. Seja irônico e use sarcasmo consistente.
2. Questione o óbvio com frases tipo "Uau, que surpresa...".
3. Use expressões como "Quem diria, né?", "Incrível, não sabia..." de forma irônica.
4. Forneça respostas corretas, mas com deboche.
5. Quando não tiver informações, diga: 
   "Ah sim, porque obviamente eu deveria saber TUDO sobre isso..."
6. Responda em português do Brasil.
7. Quando o usuario te mandar "Oi","Bom dia","Boa noite" e "Boa tarde" ou outras saudações, responda: 
   "Uau, que saudação inesperada! Quase caí da cadeira com tanta originalidade. Mas vai lá… como posso humildemente ajudar?"
8. Sempre termine com "Mas claro, o que eu sei, né?".
9. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
10. Responda em português do Brasil.
`
    },
    "malandro": {
        greetings: ["oi", "bom dia", "boa tarde", "boa noite"],
        greeting_response: "E aí, parceiro? Tá tudo suave na nave?",
        default_response: "Ih, mermão, essa aí tu me pegou! Mas relaxa, na próxima eu desenrolo pra tu. Firmeza?",
        rules: `
1. Responda como um malandro carioca: esperto, charmoso e cheio de ginga.
2. Use gírias como "Firmeza?", "Tá ligado?", "Suave na nave" e expressões de malandro.
3. Seja sorrateiro, mas sempre prestativo e solícito.
4. Não deixe a resposta em branco.
5. Utilize o contexto sobre energia eólica de forma descontraída.
6. Se não tiver informações, informe de modo leve: 
   "Pô, parceiro, ainda não caiu essa no meu radar, mas posso descobrir!".
7. Responda em português do Brasil.
8. Para saudações, responda: 
   "E aí, parceiro? Tá tudo suave na nave?".
9. Termine com uma ginga malandra.
10. Sempre lembre que você é uma IA educativa; seu objetivo principal é ajudar, ensinar e auxiliar os usuários com suas dúvidas e perguntas.
`
    }
};

// NOVA FUNÇÃO para carregar e processar o JSON
async function loadExternalJsonContext(filePath = 'dados_extras.json') {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.error(`Erro ao carregar o arquivo JSON: ${response.statusText}`);
            return null;
        }
        const jsonData = await response.json();
        // Formata o JSON para inclusão no prompt
        let formattedJsonString = "Conteúdo do arquivo JSON externo:\n";
        for (const key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                formattedJsonString += `"${key}": [\n`;
                if (Array.isArray(jsonData[key])) {
                    jsonData[key].forEach(item => {
                        formattedJsonString += `  "${item}",\n`;
                    });
                }
                formattedJsonString = formattedJsonString.slice(0, -2); // Remove a última vírgula e quebra de linha
                formattedJsonString += "\n],\n";
            }
        }
        formattedJsonString = formattedJsonString.slice(0, -2); // Remove a última vírgula e quebra de linha
        return formattedJsonString;
    } catch (error) {
        console.error("Falha ao carregar ou processar o arquivo JSON:", error);
        return null;
    }
}


async function callOpenRouterAPI(promptText, apiKey, model = "openai/gpt-3.5-turbo", maxTokens = 2500, temperature = 1.0) {
    // ... (código existente sem alterações)
    console.log("Chamando OpenRouter API com:", { model, maxTokens, temperature });
    console.log("Prompt:", promptText.substring(0, 100) + "...");
    
    if (!apiKey) {
        console.error("Chave API da OpenRouter não fornecida ou está vazia.");
        return "Erro: Chave API não configurada.";
    }

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "RenovaIA Chat/Quiz"
    };

    const body = JSON.stringify({
        model: model,
        messages: [{ role: "user", content: promptText }],
        temperature: temperature,
        max_tokens: maxTokens,
    });

    console.log("Request body:", body);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: headers,
            body: body
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error Response:", errorText);
            
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: { message: `Erro HTTP ${response.status}: ${response.statusText}` } };
            }
            
            const errorMessage = errorData?.error?.message || `Erro na API: ${response.statusText}`;
            return `Erro na API: ${errorMessage}`;
        }

        const responseText = await response.text();
        console.log("Response text:", responseText);
        
        const data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            console.error("Resposta da API não contém conteúdo:", data);
            return "Não obtive uma resposta válida da IA.";
        }
        
        return content;
    } catch (error) {
        console.error("Fetch error:", error);
        return `Erro ao conectar com a API OpenRouter: ${error.message}`;
    }
}

async function getRealAIResponse(message, personalityKey = "padrao", apiKey) {
    console.log("getRealAIResponse chamada com:", { message, personalityKey, hasApiKey: !!apiKey });
    
    const personality = PERSONALITIES[personalityKey] || PERSONALITIES["padrao"];
    const lowerMessage = message.toLowerCase();

    if (personality.greetings && personality.greetings.some(greet => lowerMessage.includes(greet))) {
        console.log("Detectada saudação, retornando resposta padrão");
        return personality.greeting_response;
    }

    if (!apiKey) {
        console.error("Chave API não fornecida para getRealAIResponse");
        return "Erro: Chave API não configurada para obter resposta da IA.";
    }
    
    // Carrega o contexto do JSON externo
    const externalJsonContext = await loadExternalJsonContext('data/dados_extras.json'); // Certifique-se que o caminho está correto
    let jsonContextForPrompt = "";
    if (externalJsonContext) {
        jsonContextForPrompt = `\n\n### CONTEXTO ADICIONAL DE ARQUIVO JSON:\n${externalJsonContext}`;
    } else {
        jsonContextForPrompt = "\n\n### AVISO: Não foi possível carregar o contexto adicional do arquivo JSON.";
    }

    const fixedContext = `
Energia eólica é a transformação da energia do vento em energia útil, seja mecânica ou elétrica.
É uma fonte de energia renovável, limpa e amplamente disponível.
Aerogeradores são usados para capturar a energia cinética dos ventos.
Os principais desafios incluem a intermitência do vento e o impacto visual/ambiental dos parques eólicos.
O Brasil possui grande potencial eólico, especialmente no Nordeste.
    `;

    const promptChat = `
### REGRAS ABSOLUTAS (NÃO DESVIAR):
${personality.rules}

### CONTEXTO DISPONÍVEL SOBRE ENERGIA EÓLICA (Use se a pergunta for sobre este tema):
${fixedContext}
${jsonContextForPrompt}  // Adiciona o contexto do JSON aqui

### PERGUNTA:
${message}

### RESPOSTA (ESTILO ${personalityKey.toUpperCase()}):`;

    console.log("Enviando prompt para API");
    return await callOpenRouterAPI(promptChat, apiKey, "openai/gpt-3.5-turbo", 1000, 0.7); // Aumentei maxTokens para acomodar o contexto extra
}

async function generateRealQuiz(tema = "Energia Eólica", nivel = "medio", qtd_abertas = 2, qtd_fechadas = 3, apiKey) {
    // ... (código existente sem alterações, mas você poderia, opcionalmente, passar o contexto do JSON para a geração do quiz também)
    console.log("generateRealQuiz chamada com:", { tema, nivel, qtd_abertas, qtd_fechadas, hasApiKey: !!apiKey });
    
    if (!apiKey) {
        return {
            titulo: `Quiz sobre ${tema} (Erro na Geração)`,
            perguntas: [{
                tipo: "aberta",
                enunciado: "Erro: Chave API não configurada para gerar o quiz.",
                resposta_correta: "",
                explicacao: "Configure a chave API em js/ia_logic.js."
            }]
        };
    }

    const promptQuiz = `
Gere um quiz sobre ${tema} com EXATAMENTE:
- ${qtd_abertas} perguntas abertas (resposta curta)
- ${qtd_fechadas} perguntas de múltipla escolha (com 4 opções cada, e a resposta correta DEVE ser uma das opções)
- Nível de dificuldade: ${nivel}

Para CADA pergunta, inclua:
- "tipo": "aberta" ou "multipla_escolha"
- "enunciado": O enunciado da pergunta.
- "resposta_correta": A resposta correta.
- "explicacao": Uma BREVE explicação (1-2 frases) do porquê a resposta é correta. Este campo é OBRIGATÓRIO para todas as perguntas.
- Para perguntas de "multipla_escolha", inclua também "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"].

Retorne SOMENTE um JSON VÁLIDO no seguinte formato (SEM texto adicional, SEM markdown, SEM comentários):
{
    "titulo": "Quiz sobre ${tema}",
    "perguntas": [
        {
            "tipo": "aberta",
            "enunciado": "Qual é o principal recurso natural utilizado para gerar energia eólica?",
            "resposta_correta": "Vento",
            "explicacao": "A energia eólica é gerada pela força dos ventos, que movimentam as pás dos aerogeradores."
        },
        {
            "tipo": "multipla_escolha",
            "enunciado": "Qual país lidera a capacidade eólica total instalada no mundo em 2018?",
            "opcoes": ["China", "Estados Unidos", "Alemanha", "Brasil"],
            "resposta_correta": "China",
            "explicacao": "Em 2018, a China possuía a maior capacidade instalada de energia eólica, impulsionada por grandes investimentos em energias renováveis."
        }
    ]
}
Certifique-se de que o campo "explicacao" esteja presente em TODAS as perguntas.
A "resposta_correta" para perguntas de múltipla escolha DEVE ser o texto exato de uma das "opcoes".
O número total de perguntas no array "perguntas" deve ser ${qtd_abertas + qtd_fechadas}.
`;

    console.log("Enviando prompt de quiz para API");
    const quizResponseString = await callOpenRouterAPI(promptQuiz, apiKey, "openai/gpt-3.5-turbo", 1500, 0.5);

    try {
        if (quizResponseString.startsWith("Erro:")) {
            throw new Error(quizResponseString);
        }

        let start = quizResponseString.indexOf('{');
        let end = quizResponseString.lastIndexOf('}') + 1;
        if (start === -1 || end === 0) {
            console.error("Nenhum JSON encontrado na resposta da LLM ao gerar quiz:", quizResponseString);
            throw new Error("Resposta da IA não continha um JSON válido.");
        }
        const jsonStr = quizResponseString.substring(start, end);
        const quizData = JSON.parse(jsonStr);

        if (!quizData || typeof quizData !== 'object' || !Array.isArray(quizData.perguntas)) {
            throw new Error("Estrutura do quiz JSON inválida.");
        }
        for (const p of quizData.perguntas) {
            if (!p.tipo || !p.enunciado || !p.resposta_correta || !p.explicacao) {
                throw new Error("Pergunta do quiz malformada, campos essenciais faltando.");
            }
            if (p.tipo === 'multipla_escolha' && (!Array.isArray(p.opcoes) || p.opcoes.length === 0)) {
                 throw new Error("Pergunta de múltipla escolha malformada (opções).");
            }
        }
        return quizData;
    } catch (e) {
        console.error("Erro ao processar JSON do quiz:", e.message, "String recebida:", quizResponseString);
        return {
            titulo: `Quiz sobre ${tema} (Erro na Geração via IA)`,
            perguntas: [{
                tipo: "aberta",
                enunciado: `Lamentamos, houve um erro ao gerar as perguntas do quiz com a IA. Detalhe: ${e.message}`,
                resposta_correta: "",
                explicacao: "Não foi possível gerar a explicação devido a um erro da IA."
            }]
        };
    }
}
