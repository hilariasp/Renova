// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Chatbot Page Logic
    if (document.getElementById('userInput') && document.getElementById('messages')) {
        const userInput = document.getElementById('userInput');
        userInput.focus();
        userInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        const newChatButton = document.querySelector('a.new-chat[href="chatbot.html"]');
        if (newChatButton) {
            newChatButton.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('chatHistory');
                window.location.href = "chatbot.html";
            });
        }
    }

    // Quiz Generation Page Logic
    const quizGenerationForm = document.getElementById('quizGenerationForm');
    if (quizGenerationForm) {
        quizGenerationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tema = document.getElementById('tema').value.trim() || "Energia Eólica";
            const nivel = document.getElementById('nivel').value || "medio";
            const qtd_abertas = parseInt(document.getElementById('qtd_abertas').value) || 0;
            const qtd_fechadas = parseInt(document.getElementById('qtd_fechadas').value) || 0;
            
            // Limpa mensagens de erro anteriores
            const errorDiv = document.getElementById('errorMessage');
            if (errorDiv) {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }
            
            // Validação básica
            if (qtd_abertas === 0 && qtd_fechadas === 0) {
                showError('Adicione pelo menos uma pergunta!');
                return;
            }

            if (qtd_abertas < 0 || qtd_fechadas < 0) {
                showError('As quantidades não podem ser negativas!');
                return;
            }

            if (qtd_abertas > 20 || qtd_fechadas > 20) {
                showError('Máximo de 20 perguntas por tipo!');
                return;
            }

            // Verifica se a função ensureApiKey existe
            if (typeof ensureApiKey !== 'function') {
                showError('Erro: Função de API não encontrada. Verifique se ia_logic.js está carregado.');
                return;
            }

            const currentApiKey = ensureApiKey();
            if (!currentApiKey) {
                showError('Chave API é necessária para gerar o quiz.');
                return;
            }

            const submitBtn = document.getElementById('generateQuizBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Gerando com IA... <i class="bi bi-arrow-repeat spin"></i>';
            submitBtn.disabled = true;

            try {
                console.log('Iniciando geração do quiz com parâmetros:', {
                    tema, nivel, qtd_abertas, qtd_fechadas
                });

                // Verifica se a função generateRealQuiz existe
                if (typeof generateRealQuiz !== 'function') {
                    throw new Error('Função generateRealQuiz não encontrada. Verifique se ia_logic.js está carregado corretamente.');
                }

                const quizData = await generateRealQuiz(tema, nivel, qtd_abertas, qtd_fechadas, currentApiKey);
                
                console.log('Quiz gerado:', quizData);

                // Validação mais rigorosa do quiz retornado
                if (!quizData) {
                    throw new Error('Nenhum dado de quiz foi retornado.');
                }

                if (!quizData.perguntas || !Array.isArray(quizData.perguntas)) {
                    throw new Error('Formato de quiz inválido: perguntas não é um array.');
                }

                if (quizData.perguntas.length === 0) {
                    throw new Error('Nenhuma pergunta foi gerada.');
                }

                // Verifica se não há mensagens de erro nas perguntas
                const hasErrors = quizData.perguntas.some(pergunta => 
                    pergunta.enunciado && (
                        pergunta.enunciado.toLowerCase().includes('lamentamos') ||
                        pergunta.enunciado.toLowerCase().includes('erro') ||
                        pergunta.enunciado.toLowerCase().includes('problema')
                    )
                );

                if (hasErrors) {
                    throw new Error('A IA retornou erros na geração do quiz. Tente novamente.');
                }

                // Validação individual das perguntas
                for (let i = 0; i < quizData.perguntas.length; i++) {
                    const pergunta = quizData.perguntas[i];
                    
                    if (!pergunta.tipo || !pergunta.enunciado || !pergunta.resposta_correta) {
                        throw new Error(`Pergunta ${i + 1} está mal formatada.`);
                    }

                    if (pergunta.tipo === 'multipla_escolha') {
                        if (!pergunta.opcoes || !Array.isArray(pergunta.opcoes) || pergunta.opcoes.length === 0) {
                            throw new Error(`Pergunta de múltipla escolha ${i + 1} não possui opções válidas.`);
                        }
                        
                        // Verifica se a resposta correta está nas opções
                        if (!pergunta.opcoes.includes(pergunta.resposta_correta)) {
                            console.warn(`Pergunta ${i + 1}: resposta correta não encontrada nas opções. Corrigindo...`);
                            // Tenta corrigir colocando a resposta correta como primeira opção
                            pergunta.opcoes[0] = pergunta.resposta_correta;
                        }
                    }
                }

                // Salva o quiz no localStorage
                localStorage.setItem('currentQuiz', JSON.stringify(quizData));
                console.log('Quiz salvo no localStorage');
                
                // Redireciona para a página de questões
                window.location.href = 'questoes.html';

            } catch (error) {
                console.error("Erro detalhado ao gerar quiz:", error);
                
                let errorMessage = 'Ocorreu um erro ao gerar o quiz.';
                
                if (error.message) {
                    if (error.message.includes('API')) {
                        errorMessage = 'Erro na comunicação com a IA. Verifique sua chave API.';
                    } else if (error.message.includes('JSON')) {
                        errorMessage = 'A IA retornou dados mal formatados. Tente novamente.';
                    } else {
                        errorMessage = error.message;
                    }
                }
                
                showError(errorMessage);
                
                // Restaura o botão
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Quiz Questions Page Logic (if on questoes.html)
    const quizForm = document.getElementById('quizForm');
    if (quizForm) {
        loadQuizQuestions();
        quizForm.addEventListener('submit', handleQuizSubmission);
    }

    // Quiz Results Page Logic (if on resultados.html)
    if (document.getElementById('quizResultsContainer')) {
        loadQuizResults();
    }
});

// Função para mostrar erros
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}

// --- Chatbot Functions ---
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createMessageElement(content, isUser, messagesDiv) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user" : "bot"}`;

    const contentDiv = document.createElement("div");
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);

    const timeDiv = document.createElement("div");
    timeDiv.className = "timestamp";
    timeDiv.textContent = getCurrentTime();
    messageDiv.appendChild(timeDiv);
    
    messagesDiv.appendChild(messageDiv);
}

function createTypingIndicator(messagesDiv) {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typingIndicator";
    typingDiv.className = "message bot";
    const contentDiv = document.createElement("div");
    contentDiv.className = "typing-indicator";
    contentDiv.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    typingDiv.appendChild(contentDiv);
    messagesDiv.appendChild(typingDiv);
    return typingDiv;
}

function scrollToBottomMessages() {
    const messagesDiv = document.getElementById("messages");
    if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

async function handleSendMessage() {
    const userInput = document.getElementById("userInput");
    const messagesDiv = document.getElementById("messages");
    const personality = document.getElementById("personality").value;

    const messageText = userInput.value.trim();
    if (messageText === "") return;

    createMessageElement(messageText, true, messagesDiv);
    scrollToBottomMessages();
    userInput.value = "";
    userInput.focus();

    if (typeof ensureApiKey !== 'function') {
        createMessageElement("Erro: Função de API não encontrada. Verifique se ia_logic.js está carregado.", false, messagesDiv);
        scrollToBottomMessages();
        return;
    }

    const currentApiKey = ensureApiKey();
    if (!currentApiKey) {
        createMessageElement("Erro: Chave API não configurada. Não posso contatar a IA.", false, messagesDiv);
        scrollToBottomMessages();
        return;
    }

    const typingIndicator = createTypingIndicator(messagesDiv);
    scrollToBottomMessages();

    try {
        if (typeof getRealAIResponse !== 'function') {
            throw new Error('Função getRealAIResponse não encontrada.');
        }

        const botResponseText = await getRealAIResponse(messageText, personality, currentApiKey);
        
        if (document.getElementById('typingIndicator')) {
            messagesDiv.removeChild(document.getElementById('typingIndicator'));
        }
        
        createMessageElement(botResponseText, false, messagesDiv);
        scrollToBottomMessages();
        
    } catch (error) {
        console.error("Erro ao obter resposta da IA:", error);
        
        if (document.getElementById('typingIndicator')) {
            messagesDiv.removeChild(document.getElementById('typingIndicator'));
        }
        
        createMessageElement("Desculpe, tive um problema ao falar com a IA.", false, messagesDiv);
        scrollToBottomMessages();
    }
}

// --- Funções do Quiz ---
function loadQuizQuestions() {
    const quizDataString = localStorage.getItem('currentQuiz');
    const quizContainer = document.getElementById('quizQuestionsContainer');
    const quizForm = document.getElementById('quizForm');

    if (!quizDataString || !quizContainer || !quizForm) {
        if(quizContainer) {
            quizContainer.innerHTML = "<p>Não foi possível carregar o quiz. Por favor, tente gerar um novo.</p><a href='quiz.html'>Gerar Novo Quiz</a>";
        }
        return;
    }

    try {
        const quiz = JSON.parse(quizDataString);

        if (!quiz || !quiz.perguntas || !Array.isArray(quiz.perguntas)) {
            console.error("Formato de quiz inválido no localStorage", quiz);
            if(quizContainer) {
                quizContainer.innerHTML = "<p>Formato de quiz inválido. Tente gerar um novo.</p><a href='quiz.html'>Gerar Novo Quiz</a>";
            }
            return;
        }

        const quizTitleElement = document.getElementById('quizTitle');
        if (quizTitleElement) {
            quizTitleElement.textContent = quiz.titulo || "Quiz";
        }
        
        const hiddenQuizDataInput = document.getElementById('quizJsonData');
        if (hiddenQuizDataInput) {
            hiddenQuizDataInput.value = quizDataString;
        }

        quiz.perguntas.forEach((pergunta, perguntaIdx) => {
            const perguntaDiv = document.createElement('div');
            perguntaDiv.className = 'pergunta';
            perguntaDiv.dataset.perguntaIndex = perguntaIdx;

            const enunciadoDiv = document.createElement('div');
            enunciadoDiv.className = 'enunciado';
            enunciadoDiv.textContent = `${perguntaIdx + 1}. ${pergunta.enunciado}`;
            perguntaDiv.appendChild(enunciadoDiv);

            if (pergunta.tipo === "aberta") {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'aberta';
                input.name = `resposta_${perguntaIdx}`;
                input.placeholder = 'Sua resposta...';
                input.required = true;
                perguntaDiv.appendChild(input);
                
            } else if (pergunta.tipo === "multipla_escolha") {
                const opcoesDiv = document.createElement('div');
                opcoesDiv.className = 'opcoes';
                
                if (Array.isArray(pergunta.opcoes)) {
                    pergunta.opcoes.forEach((opcao, opcaoIdx) => {
                        const opcaoContainer = document.createElement('div');
                        opcaoContainer.className = 'opcao';

                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.name = `resposta_${perguntaIdx}`;
                        input.id = `op${perguntaIdx}_${opcaoIdx}`;
                        input.value = opcao;
                        input.required = true;

                        const label = document.createElement('label');
                        label.htmlFor = `op${perguntaIdx}_${opcaoIdx}`;
                        label.textContent = opcao;

                        opcaoContainer.appendChild(input);
                        opcaoContainer.appendChild(label);
                        opcoesDiv.appendChild(opcaoContainer);
                    });
                } else {
                    console.warn("Pergunta de múltipla escolha sem array de opções:", pergunta);
                    const errorOpt = document.createElement('p');
                    errorOpt.textContent = "Opções não disponíveis para esta pergunta.";
                    opcoesDiv.appendChild(errorOpt);
                }
                perguntaDiv.appendChild(opcoesDiv);
            }
            quizContainer.appendChild(perguntaDiv);
        });
        
    } catch (err) {
        console.error("Erro ao carregar perguntas do quiz:", err);
        if(quizContainer) {
            quizContainer.innerHTML = "<p>Erro ao processar dados do quiz. Tente gerar um novo.</p><a href='quiz.html'>Gerar Novo Quiz</a>";
        }
    }
}

function handleQuizSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const userAnswers = {};
    
    let allAnswered = true;
    const questionContainers = form.querySelectorAll('.pergunta');
    
    questionContainers.forEach((container) => {
        const questionIndex = container.dataset.perguntaIndex;
        const textInput = container.querySelector(`input[type="text"][name="resposta_${questionIndex}"]`);
        
        if (textInput && textInput.required && textInput.value.trim() === '') {
            allAnswered = false;
        }
        
        const radioInputs = container.querySelectorAll(`input[type="radio"][name="resposta_${questionIndex}"]`);
        if (radioInputs.length > 0 && radioInputs[0].required) {
            let oneRadioChecked = false;
            radioInputs.forEach((radio) => { 
                if (radio.checked) oneRadioChecked = true; 
            });
            if (!oneRadioChecked) allAnswered = false;
        }
    });

    if (!allAnswered) {
        alert('Por favor, responda todas as perguntas!');
        return;
    }

    const submitBtn = document.getElementById('submitQuizBtn');
    if(submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-arrow-repeat loading"></i> Corrigindo...';
        submitBtn.disabled = true;
    }

    for (let [key, value] of formData.entries()) {
        if (key !== 'quiz_json') {
            userAnswers[key] = value;
        }
    }
    
    const quizDataString = document.getElementById('quizJsonData').value;
    const quiz = JSON.parse(quizDataString);
    const results = [];

    quiz.perguntas.forEach((pergunta, index) => {
        const userAnswer = userAnswers[`resposta_${index}`] || "";
        const correctAnswer = pergunta.resposta_correta;
        const isCorrect = userAnswer.trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

        results.push({
            pergunta: pergunta.enunciado,
            resposta_usuario: userAnswer,
            correta: isCorrect,
            resposta_correta: correctAnswer,
            explicacao: pergunta.explicacao || "Explicação não disponível."
        });
    });

    localStorage.setItem('quizResults', JSON.stringify(results));
    localStorage.setItem('totalQuestions', JSON.stringify(quiz.perguntas.length));
    
    setTimeout(() => {
        window.location.href = 'resultados.html';
    }, 500);
}

function loadQuizResults() {
    const resultsDataString = localStorage.getItem('quizResults');
    const totalQuestions = JSON.parse(localStorage.getItem('totalQuestions') || '0');
    const resultsContainer = document.getElementById('quizResultsContainer');

    if (!resultsDataString || !resultsContainer) {
        if (resultsContainer) {
            resultsContainer.innerHTML = "<p>Não foi possível carregar os resultados. Por favor, tente fazer o quiz novamente.</p><a href='quiz.html'>Fazer Novo Quiz</a>";
        }
        return;
    }

    const resultados = JSON.parse(resultsDataString);
    const acertos = resultados.filter(r => r.correta).length;

    const resumoDiv = document.createElement('div');
    resumoDiv.className = 'resumo';
    resumoDiv.innerHTML = `Você acertou <span class="acertos">${acertos}</span> de <span class="total">${totalQuestions || resultados.length}</span> perguntas!`;
    resultsContainer.appendChild(resumoDiv);

    resultados.forEach(item => {
        const perguntaDiv = document.createElement('div');
        perguntaDiv.className = `pergunta ${item.correta ? 'correta' : 'incorreta'}`;

        perguntaDiv.innerHTML = `
            <p><strong>Pergunta:</strong> ${item.pergunta}</p>
            <p><strong>Sua resposta:</strong> ${item.resposta_usuario || "Não respondida"}</p>
            ${!item.correta ? `<p><strong>Resposta correta:</strong> ${item.resposta_correta}</p>` : ''}
            <div class="explicacao-container">
                <p class="explicacao-titulo"><i class="bi bi-info-circle-fill"></i> Explicação:</p>
                <p class="explicacao-texto">${item.explicacao}</p>
            </div>
        `;
        resultsContainer.appendChild(perguntaDiv);
    });
}

// Expõe a função globalmente para compatibilidade
window.handleSendMessage = handleSendMessage;