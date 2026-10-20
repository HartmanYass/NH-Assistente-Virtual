# NAYANE HARTMAN | ATENDIMENTO & GESTÃO PARA EMPRESÁRIAS DA BELEZA
## Site Institucional One-Page + Ficha de Diagnóstico & Contato

Projeto web profissional, mobile-first, leve e sofisticado desenvolvido sob medida para a **Nayane Hartman**, com identidade visual baseada na proposta comercial (Marrom Escuro `#58432F`, Bege Claro `#E8DED3`, Caramelo `#C9A98F`).

---

### 🌟 Destaques do Projeto

- **Foco em Conversão & Elegância:** Apresentação clara da Nayane, do Método NAY (N - Necessidade, A - Atenção, Y - Yes) e dos serviços de estruturação comercial, **sem exibir preços ou comissões**.
- **Mobile-First Responsivo:** Botões grandes e confortáveis ao toque, tipografia legível (Playfair Display com palavras-chave em itálico + Montserrat) e visual acolhedor.
- **Animações Interativas:** Contador animado que sobe suavemente de 0 até **+20 negócios transformados** ao rolar a página.
- **Ficha Inteligente com DDI Duplo:** Máscara e validação automática para **Brasil (+55)** e **Portugal (+351)**.
- **Anti-Spam Triplo:** Campo invisível *honeypot* para robôs + controle de taxa por visitante (*rate limiting*) + consentimento LGPD obrigatório.
- **Automação 100% Gratuita (Google Apps Script):**
  1. 📊 Salva todas as respostas em tempo real em uma planilha do **Google Sheets** com cabeçalhos automáticos.
  2. 💬 Notifica o **WhatsApp** da Nayane via **CallMeBot API**.
  3. 📧 Envia e-mail de reserva com resumo diagramado para **yasminhartman047@gmail.com**.
  4. 🔄 Contingência: A visitante sempre visualiza confirmação de sucesso, e conta com um botão direto de WhatsApp com mensagem pré-preenchida.

---

### 📂 Estrutura de Arquivos

```text
nayane-hartman/
│
├── index.html                   # Estrutura completa da página (Hero, Contador, Sobre, Método, Serviços, Ficha)
├── style.css                    # Folha de estilo com paleta de cores oficial e regras responsivas
├── script.js                    # Máscaras, validações, animações e envio para o Web App
│
├── assets/
│   └── images/                  # Fotos originais extraídas da proposta comercial em alta resolução
│       ├── logo-nh.png          # Monograma NH oficial transparente
│       ├── hero-bg.jpg          # Foto de café e notebook com textura aconchegante
│       ├── nayane-sobre.jpg     # Foto de Nayane sorrindo (bloco Sobre a Nay)
│       ├── pinceis-maquiagem.jpg# Foto dos pincéis de atendimento
│       ├── poltrona-cafe.jpg    # Poltrona e mesa de café do salão
│       ├── ambiente-salao.jpg   # Fundo escurecido da seção de resultados
│       ├── nayane-contato.jpg   # Retrato de Nayane para a seção da ficha
│       └── textura-servicos.jpg # Textura de tecido e iluminação
│
├── google-apps-script/
│   └── Code.gs                  # Código pronto para o Google Apps Script (Sheets + WhatsApp + E-mail)
│
└── README.md                    # Este manual passo a passo de publicação e configuração
```

---

### 🚀 Passo a Passo de Configuração das Integrações (Gratuito)

#### Passo 1: Criar a Planilha e o Script no Google

1. Acesse o seu Google Drive e crie uma nova planilha no **Google Sheets** (ex: *Fichas - Nayane Hartman*).
2. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
3. Apague qualquer código existente no editor e cole todo o conteúdo do arquivo [`google-apps-script/Code.gs`](file:///C:/Users/yasmi/.gemini/antigravity/scratch/nayane-hartman/google-apps-script/Code.gs).
4. Clique no ícone de **Salvar** (disquete).

---

#### Passo 2: Ativar o CallMeBot no WhatsApp da Nayane (Única vez)

O CallMeBot é uma ferramenta gratuita que permite que o Google Apps Script envie mensagens diretamente para o WhatsApp:

1. No celular com o número **+55 11 99442-0964**, adicione o contato do CallMeBot na agenda.
   *(O número oficial atualizado pode ser conferido em [callmebot.com/blog/free-api-whatsapp-messages](https://www.callmebot.com/blog/free-api-whatsapp-messages/))*.
2. Abra uma conversa com o contato do CallMeBot e envie exatamente esta mensagem:
   ```text
   I allow callmebot to send me messages
   ```
3. Em poucos segundos, o robô responderá com a sua chave:
   ```text
   API Key: 123456 (exemplo)
   ```
4. Guarde esse número da sua **apikey**.
5. No editor do **Apps Script** (aberto no Passo 1):
   - Clique no ícone de engrenagem à esquerda (**Configurações do projeto**).
   - Role até a seção **Propriedades do script** e clique em **Editar propriedades do script**.
   - Clique em **Adicionar propriedade do script**:
     - Propriedade: `CALLMEBOT_API_KEY`
     - Valor: cole o número da sua apikey (ex: `123456`).
   - Clique em **Salvar propriedades do script**.

---

#### Passo 3: Publicar o Web App do Google Apps Script

1. No topo direito do editor do Apps Script, clique no botão azul **Implantar** (Deploy) > **Nova implantação**.
2. Clique na engrenagem ao lado de "Selecione o tipo" e escolha **Aplicativo da Web** (Web App).
3. Preencha os campos:
   - **Descrição:** `Recepção de Fichas do Site Nayane`
   - **Executar como:** `Eu (seu e-mail do Google)`
   - **Quem pode acessar:** `Qualquer pessoa` *(essencial para que o formulário do site consiga enviar)*.
4. Clique em **Implantar**.
5. O Google solicitará que você autorize o acesso (clique em *Revisar permissões*, escolha sua conta Google, clique em *Avançado* e depois em *Acessar projeto*).
6. Copie a **URL do aplicativo da Web** gerada (começa com `https://script.google.com/macros/s/.../exec`).

---

#### Passo 4: Conectar a URL no Código do Site

1. Abra o arquivo [`script.js`](file:///C:/Users/yasmi/.gemini/antigravity/scratch/nayane-hartman/script.js).
2. Na linha 13, localize a variável `APPS_SCRIPT_URL` e substitua pelo endereço copiado:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx_SEU_CODIGO_AQUI/exec',
   ```
3. Salve o arquivo. Pronto! O site agora está conectado à planilha, ao WhatsApp e ao e-mail!

---

### 🌐 Como Publicar o Site Gratuitamente na Internet

Você pode colocar o site no ar em menos de 2 minutos sem custo algum:

#### Opção A: Netlify Drop (Mais simples e rápido)
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) (crie uma conta gratuita com e-mail ou GitHub).
2. Arraste a pasta inteira `nayane-hartman` para a janela do navegador.
3. Em 10 segundos o seu site estará no ar com HTTPS gratuito e um link do tipo `https://nayane-hartman.netlify.app`.

#### Opção B: Vercel
1. Acesse [vercel.com](https://vercel.com) e conecte sua conta.
2. Importe o repositório ou use o comando `vercel` no terminal para publicar instantaneamente.

#### Como Conectar seu Domínio Próprio (ex: `nayanehartman.com.br`):
1. No painel da Netlify ou Vercel, acesse a aba **Domain Management** / **Domains**.
2. Clique em **Add Custom Domain** e digite o seu domínio (ex: `nayanehartman.com.br`).
3. Siga as instruções do painel criando as duas entradas DNS na sua registradora (ex: Registro.br, Hostinger ou GoDaddy):
   - Registro `A` apontando para o IP indicado pela plataforma.
   - Registro `CNAME` para `www` apontando para o seu subdomínio na plataforma.
4. O certificado de segurança SSL (HTTPS) é ativado automaticamente e de graça!

---

### 📱 Teste de Envio & Contingência

1. Abra a página `index.html` em qualquer navegador.
2. Preencha a ficha com seus dados de teste e clique em **Enviar minha ficha**.
3. Verifique:
   - A confirmação com a mensagem: *"Recebido! A Nay vai falar com você em breve 🤍"*.
   - A nova linha preenchida na sua planilha do Google Sheets.
   - A mensagem de alerta no WhatsApp da Nayane.
   - O e-mail de resumo em `yasminhartman047@gmail.com`.
   - O botão verde de contingência que permite chamar a Nayane diretamente com a mensagem pré-formatada.
