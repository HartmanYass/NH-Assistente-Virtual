/**
 * NAYANE HARTMAN | ATENDIMENTO & GESTÃO PARA EMPRESÁRIAS DA BELEZA
 * Script Principal - Validações, Animações e Integrações
 */

// ==========================================================================
// 1. CONFIGURAÇÃO CENTRALIZADA (Fácil de editar)
// ==========================================================================
const CONFIG = {
  // Cole aqui a URL do seu Google Apps Script publicado como Web App:
  // Exemplo: 'https://script.google.com/macros/s/AKfycbx.../exec'
     APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyMAyo88xxAzELIUm-BMpewro9caUrsJfDeVMlimQnG9-1rcEiXxy5TCmCsp4vS-uziXA/exec',

  // Número do WhatsApp da Nayane (com DDI 55 e DDD 11):
  WHATSAPP_NUMBER: '5511994420964',

  // Meta do contador de negócios transformados:
  COUNTER_TARGET: 20,

  // Duração da animação do contador em milissegundos:
  COUNTER_DURATION: 1800,

  // Limite de envios por hora por visitante (proteção anti-spam no navegador):
  MAX_SUBMISSIONS_PER_HOUR: 3
};

// ==========================================================================
// 2. INICIALIZAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initHeaderScroll();
  initCounterAnimation();
  initPhoneFormatting();
  initFormValidationAndSubmission();
});

// Atualiza o ano no rodapé automaticamente
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ==========================================================================
// 3. NAVEGAÇÃO STICKY COM EFEITO DE VIDRO
// ==========================================================================
function initHeaderScroll() {
  const header = document.getElementById('topNav');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ==========================================================================
// 4. CONTADOR ANIMADO (+20 NEGÓCIOS TRANSFORMADOS)
// ==========================================================================
function initCounterAnimation() {
  const counterVal = document.querySelector('.counter-val');
  const counterSection = document.getElementById('contador');
  if (!counterVal || !counterSection) return;

  let hasAnimated = false;

  const startCount = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    const target = parseInt(counterVal.getAttribute('data-target') || CONFIG.COUNTER_TARGET, 10);
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / CONFIG.COUNTER_DURATION, 1);
      
      // Easing suave (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      counterVal.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counterVal.textContent = target;
      }
    };

    requestAnimationFrame(updateCount);
  };

  // Dispara quando o elemento entra na tela
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCount();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  observer.observe(counterSection);
}

// ==========================================================================
// 5. MÁSCARA E FORMATAÇÃO INTELIGENTE DE TELEFONE (BRASIL & PORTUGAL)
// ==========================================================================
function initPhoneFormatting() {
  const ddiSelect = document.getElementById('ddi');
  const phoneInput = document.getElementById('whatsapp');
  const paisSelect = document.getElementById('pais');
  if (!ddiSelect || !phoneInput) return;

  // Sincroniza DDI com País
  ddiSelect.addEventListener('change', () => {
    if (ddiSelect.value === '+55' && paisSelect) {
      paisSelect.value = 'Brasil';
      phoneInput.placeholder = '(11) 99999-9999';
    } else if (ddiSelect.value === '+351' && paisSelect) {
      paisSelect.value = 'Portugal';
      phoneInput.placeholder = '912 345 678';
    } else {
      if (paisSelect) paisSelect.value = 'Outro';
      phoneInput.placeholder = 'Número com código de área';
    }
    phoneInput.value = formatPhone(phoneInput.value, ddiSelect.value);
  });

  if (paisSelect) {
    paisSelect.addEventListener('change', () => {
      if (paisSelect.value === 'Brasil') {
        ddiSelect.value = '+55';
        phoneInput.placeholder = '(11) 99999-9999';
      } else if (paisSelect.value === 'Portugal') {
        ddiSelect.value = '+351';
        phoneInput.placeholder = '912 345 678';
      } else {
        ddiSelect.value = 'outro';
        phoneInput.placeholder = 'Número com código de área';
      }
      phoneInput.value = formatPhone(phoneInput.value, ddiSelect.value);
    });
  }

  // Aplica máscara enquanto digita
  phoneInput.addEventListener('input', (e) => {
    phoneInput.value = formatPhone(e.target.value, ddiSelect.value);
  });
}

function formatPhone(value, ddi) {
  const digits = value.replace(/\D/g, '');

  if (ddi === '+55') {
    // Formato Brasil: (11) 99999-9999 ou (11) 9999-9999
    if (digits.length <= 2) {
      return digits.length ? `(${digits}` : '';
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  } else if (ddi === '+351') {
    // Formato Portugal: 9 dígitos (ex: 912 345 678)
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }

  // Outros países: apenas mantém digitação limpa
  return digits;
}

// ==========================================================================
// 6. VALIDAÇÃO E ENVIO DA FICHA DE CONTATO
// ==========================================================================
function initFormValidationAndSubmission() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const btnSuccessWhatsApp = document.getElementById('btnSuccessWhatsApp');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpa erros anteriores
    clearErrors();

    // 1. Verificação Honeypot Anti-Spam
    const honeypot = document.getElementById('website_url');
    if (honeypot && honeypot.value.trim() !== '') {
      // É um robô! Simula sucesso sem enviar
      showSuccessView({ nome: 'Visitante' });
      return;
    }

    // 2. Proteção Anti-Spam (Rate Limit no LocalStorage)
    if (isRateLimited()) {
      alert('Você já enviou uma ficha recentemente. A Nayane entrará em contato em breve!');
      return;
    }

    // 3. Validação dos Campos
    const formData = extractAndValidateForm();
    if (!formData) {
      return; // Erros foram destacados nos campos
    }

    // 4. Feedback de Envio (Loading State)
    setButtonLoading(true);

    try {
      // Se a URL do Apps Script já estiver configurada, envia para a planilha, WhatsApp e E-mail:
      const isConfigured = CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('SUBSTITUA_PELA_SUA_URL');

      if (isConfigured) {
        await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        console.warn('APPS_SCRIPT_URL ainda não configurada. Veja o passo a passo no README.md para conectar seu Google Sheets.');
        // Simulação de delay de envio
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Registra no rate limit
      registerSubmission();

      // Atualiza link de contingência do WhatsApp com mensagem completa dos dados
      updateWhatsAppSuccessLink(formData, !isConfigured);

      // Exibe tela de sucesso
      showSuccessView(formData, !isConfigured);

    } catch (err) {
      console.error('Erro no envio da ficha:', err);
      // REQUISITO: "A visitante sempre vê 'Recebido!', mesmo que uma das ações falhe."
      updateWhatsAppSuccessLink(formData);
      showSuccessView(formData);
    } finally {
      setButtonLoading(false);
    }
  });

  // Validação em tempo real ao digitar
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const errEl = document.getElementById(`error-${input.name}`);
      if (errEl) errEl.textContent = '';
      input.classList.remove('input-error');
    });
  });

  function clearErrors() {
    const errorSpans = form.querySelectorAll('.field-error');
    errorSpans.forEach(span => span.textContent = '');
    const errorInputs = form.querySelectorAll('.input-error');
    errorInputs.forEach(inp => inp.classList.remove('input-error'));
  }

  function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.add('input-error');
    if (errEl) errEl.textContent = message;
    if (field) field.focus();
  }

  function extractAndValidateForm() {
    let isValid = true;

    // Nome (obrigatório, mínimo 3 letras)
    const nomeInput = document.getElementById('nome');
    const nome = nomeInput.value.trim();
    if (!nome || nome.length < 3) {
      setError('nome', 'Por favor, informe seu nome completo.');
      isValid = false;
    }

    // WhatsApp (obrigatório)
    const ddiSelect = document.getElementById('ddi');
    const phoneInput = document.getElementById('whatsapp');
    const ddi = ddiSelect.value;
    const rawPhoneDigits = phoneInput.value.replace(/\D/g, '');

    if (!rawPhoneDigits) {
      setError('whatsapp', 'Por favor, informe seu número de WhatsApp.');
      isValid = false;
    } else if (ddi === '+55' && rawPhoneDigits.length < 10) {
      setError('whatsapp', 'Número de WhatsApp incompleto. Inclua o DDD (ex: 11 99999-9999).');
      isValid = false;
    } else if (ddi === '+351' && rawPhoneDigits.length < 9) {
      setError('whatsapp', 'Número de Portugal incompleto. Deve conter 9 dígitos.');
      isValid = false;
    }

    // E-mail (opcional, mas se preenchido deve ser válido)
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('email', 'Por favor, informe um endereço de e-mail válido.');
        isValid = false;
      }
    }

    // Redes Sociais (obrigatório)
    const redesInput = document.getElementById('redes');
    const redes = redesInput.value.trim();
    if (!redes) {
      setError('redes', 'Por favor, informe suas redes sociais ou @ do Instagram.');
      isValid = false;
    }

    // Área de atuação (obrigatório)
    const areaSelect = document.getElementById('area');
    const area = areaSelect.value;
    if (!area) {
      setError('area', 'Selecione a sua principal área de atuação.');
      isValid = false;
    }

    // País (obrigatório)
    const paisSelect = document.getElementById('pais');
    const pais = paisSelect.value;

    // Negócio
    const negocioInput = document.getElementById('negocio');
    const negocio = negocioInput.value.trim() || 'Não informado';

    // Equipe (radio)
    const equipeChecked = form.querySelector('input[name="equipe"]:checked');
    const equipe = equipeChecked ? equipeChecked.value : 'Só eu';

    // Dificuldades (checkboxes múltiplos)
    const dificuldadesChecked = Array.from(form.querySelectorAll('input[name="dificuldades"]:checked')).map(cb => cb.value);
    const dificuldades = dificuldadesChecked.length > 0 ? dificuldadesChecked.join(', ') : 'Nenhuma selecionada';

    // Mensagem livre
    const mensagemInput = document.getElementById('mensagem');
    const mensagem = mensagemInput.value.trim() || 'Nenhuma observação extra.';

    // Consentimento LGPD (obrigatório)
    const consentInput = document.getElementById('consentimento');
    if (!consentInput.checked) {
      setError('consentimento', 'É necessário concordar para que a Nayane possa entrar em contato.');
      isValid = false;
    }

    if (!isValid) return null;

    const fullWhatsApp = `${ddi} ${phoneInput.value.trim()}`;

    return {
      nome,
      whatsapp: fullWhatsApp,
      whatsappRaw: `${ddi.replace('+', '')}${rawPhoneDigits}`,
      email: email || 'Não informado',
      negocio,
      redes,
      area,
      pais,
      equipe,
      dificuldades,
      mensagem,
      timestamp: new Date().toLocaleString('pt-BR')
    };
  }

  function setButtonLoading(isLoading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    
    if (isLoading) {
      submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnSpinner) btnSpinner.style.display = 'inline-flex';
    } else {
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  }

  function showSuccessView(data, isDemoMode) {
    form.style.display = 'none';
    formSuccess.style.display = 'block';

    const backupNote = formSuccess.querySelector('.backup-note');
    if (backupNote && isDemoMode) {
      backupNote.innerHTML = '⚠️ <strong>Planilha não vinculada ainda:</strong> Para que as respostas caiam automaticamente no Google Sheets e no E-mail, você precisa publicar o script no seu Google Drive (leva 2 minutos). Enquanto isso, você pode clicar no botão abaixo para enviar as respostas diretamente pelo WhatsApp:';
    }

    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function updateWhatsAppSuccessLink(data) {
    if (!btnSuccessWhatsApp) return;
    const textMsg = encodeURIComponent(
      `Nova ficha recebida 🤍\n\n` +
      `*Nome:* ${data.nome}\n` +
      `*WhatsApp:* ${data.whatsapp}\n` +
      `*E-mail:* ${data.email}\n` +
      `*Negócio:* ${data.negocio}\n` +
      `*Redes:* ${data.redes}\n` +
      `*Área:* ${data.area} | *País:* ${data.pais}\n` +
      `*Equipe:* ${data.equipe}\n` +
      `*Dificuldades:* ${data.dificuldades}\n\n` +
      `*Mensagem:* ${data.mensagem}`
    );
    btnSuccessWhatsApp.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${textMsg}`;
  }

  // Rate Limiting simples via localStorage
  function isRateLimited() {
    try {
      const history = JSON.parse(localStorage.getItem('nh_form_submissions') || '[]');
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recent = history.filter(ts => ts > oneHourAgo);
      return recent.length >= CONFIG.MAX_SUBMISSIONS_PER_HOUR;
    } catch {
      return false;
    }
  }

  function registerSubmission() {
    try {
      const history = JSON.parse(localStorage.getItem('nh_form_submissions') || '[]');
      history.push(Date.now());
      localStorage.setItem('nh_form_submissions', JSON.stringify(history));
    } catch {
      // Ignora falhas de localStorage se cookies estiverem desativados
    }
  }
}
