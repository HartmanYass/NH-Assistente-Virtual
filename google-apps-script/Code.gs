/**
 * ============================================================================
 * NAYANE HARTMAN | ATENDIMENTO & GESTÃO PARA EMPRESÁRIAS DA BELEZA
 * Google Apps Script - Web App para Recepção da Ficha de Contato
 * ============================================================================
 * 
 * Este script faz 3 ações independentes e gratuitas ao receber a ficha:
 * 1. Grava no Google Sheets (com cabeçalhos automáticos se a planilha for nova)
 * 2. Envia WhatsApp instantâneo para a Nayane via CallMeBot (+55 11 99442-0964)
 * 3. Envia e-mail de reserva formatado para yasminhartman047@gmail.com
 */

// ============================================================================
// CONFIGURAÇÕES GERAIS
// ============================================================================
const CONFIG = {
  // Número de WhatsApp da Nayane que receberá o alerta (DDI + DDD + Número sem espaços)
  NAYANE_PHONE: '+5511994420964',

  // E-mail que receberá a cópia de reserva
  BACKUP_EMAIL: 'yasminhartman047@gmail.com',

  // Nome da aba da planilha onde os dados serão gravados
  SHEET_NAME: 'Fichas Recebidas',

  // Chave API do CallMeBot (opcional colocar direto aqui ou nas Propriedades do Script)
  // Recomenda-se configurar nas Propriedades do Script com a chave 'CALLMEBOT_API_KEY'
  DEFAULT_CALLMEBOT_APIKEY: '' 
};

/**
 * Ponto de entrada HTTP POST do Web App
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Aguarda até 10 segundos para evitar conflitos de concorrência na planilha
  lock.tryLock(10000);

  var responseResult = {
    status: 'success',
    sheets: false,
    whatsapp: false,
    email: false,
    errors: []
  };

  try {
    // 1. Extração dos dados enviados
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp    = data.timestamp || Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
    var nome         = data.nome || 'Não informado';
    var whatsapp     = data.whatsapp || 'Não informado';
    var email        = data.email || 'Não informado';
    var negocio      = data.negocio || 'Não informado';
    var redes        = data.redes || 'Não informado';
    var area         = data.area || 'Não informado';
    var pais         = data.pais || 'Não informado';
    var equipe       = data.equipe || 'Não informado';
    var dificuldades = data.dificuldades || 'Não informado';
    var mensagem     = data.mensagem || 'Não informado';

    // ========================================================================
    // AÇÃO A: GRAVAR NO GOOGLE SHEETS
    // ========================================================================
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) {
        // Se o script não estiver vinculado diretamente a uma planilha, cria ou abre
        throw new Error('Script não vinculado a uma planilha. Vincule abrindo Extensões > Apps Script na planilha.');
      }

      var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      }

      // Cria cabeçalho formatado se a planilha estiver vazia
      if (sheet.getLastRow() === 0) {
        var headers = [
          'Data / Hora',
          'Nome Completo',
          'WhatsApp',
          'E-mail',
          'Nome do Negócio',
          'Redes Sociais',
          'Área de Atuação',
          'País',
          'Equipe',
          'Dificuldades',
          'Mensagem / Objetivos'
        ];
        sheet.appendRow(headers);

        // Estilização do cabeçalho da planilha
        var headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground('#58432F');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setFontWeight('bold');
        headerRange.setFontFamily('Montserrat');
        sheet.setFrozenRows(1);
      }

      // Insere os dados da nova visitante
      sheet.appendRow([
        timestamp,
        nome,
        whatsapp,
        email,
        negocio,
        redes,
        area,
        pais,
        equipe,
        dificuldades,
        mensagem
      ]);

      responseResult.sheets = true;
    } catch (sheetErr) {
      Logger.log('Erro ao salvar no Google Sheets: ' + sheetErr.toString());
      responseResult.errors.push('Sheets: ' + sheetErr.toString());
    }

    // ========================================================================
    // AÇÃO B: WHATSAPP AUTOMÁTICO (CallMeBot Gratuito)
    // ========================================================================
    try {
      var scriptProps = PropertiesService.getScriptProperties();
      var apiKey = scriptProps.getProperty('CALLMEBOT_API_KEY') || CONFIG.DEFAULT_CALLMEBOT_APIKEY;

      if (apiKey && apiKey.trim() !== '') {
        var msgText = 
          "Nova ficha recebida 🤍\n\n" +
          "Nome: " + nome + "\n" +
          "WhatsApp: " + whatsapp + "\n" +
          "E-mail: " + email + "\n" +
          "Negócio: " + negocio + "\n" +
          "Redes sociais: " + redes + "\n" +
          "Área: " + area + " | País: " + pais + "\n" +
          "Equipe: " + equipe + "\n" +
          "Dificuldades: " + dificuldades + "\n\n" +
          "Mensagem:\n" + mensagem;

        var encodedText = encodeURIComponent(msgText);
        var cleanPhone = CONFIG.NAYANE_PHONE.replace('+', '').replace(/\s+/g, '');
        var callMeBotUrl = "https://api.callmebot.com/whatsapp.php?phone=" + cleanPhone + "&text=" + encodedText + "&apikey=" + apiKey.trim();

        var waResponse = UrlFetchApp.fetch(callMeBotUrl, {
          muteHttpExceptions: true
        });

        if (waResponse.getResponseCode() === 200) {
          responseResult.whatsapp = true;
        } else {
          Logger.log('Resposta CallMeBot: ' + waResponse.getContentText());
          responseResult.errors.push('CallMeBot code: ' + waResponse.getResponseCode());
        }
      } else {
        Logger.log('Chave CALLMEBOT_API_KEY ainda não configurada nas propriedades do script.');
      }
    } catch (waErr) {
      Logger.log('Erro ao disparar WhatsApp CallMeBot: ' + waErr.toString());
      responseResult.errors.push('WhatsApp: ' + waErr.toString());
    }

    // ========================================================================
    // AÇÃO C: E-MAIL DE RESERVA (MailApp)
    // ========================================================================
    try {
      var subject = "🤍 Nova Ficha Recebida: " + nome + " (" + area + " - " + pais + ")";

      var htmlBody = 
        '<div style="font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8F5F2; border-radius: 12px; overflow: hidden; border: 1px solid #E8DED3;">' +
          '<div style="background-color: #58432F; padding: 26px 20px; text-align: center; color: #FFFFFF;">' +
            '<h2 style="margin: 0; font-size: 22px; font-weight: 500; letter-spacing: 1px;">NAYANE HARTMAN</h2>' +
            '<p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C9A98F;">Atendimento & Gestão para Empresárias da Beleza</p>' +
          '</div>' +
          '<div style="padding: 28px 24px; color: #3D2D1F; line-height: 1.6;">' +
            '<h3 style="margin-top: 0; color: #58432F; font-size: 18px; border-bottom: 2px solid #C9A98F; padding-bottom: 8px;">✨ Nova Ficha de Diagnóstico Preenchida</h3>' +
            '<table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">' +
              '<tr><td style="padding: 8px 0; font-weight: bold; width: 130px; color: #58432F;">Nome:</td><td>' + nome + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">WhatsApp:</td><td><a href="https://wa.me/' + whatsapp.replace(/\D/g, '') + '" style="color: #2E7D32; font-weight: bold; text-decoration: none;">' + whatsapp + ' (clique para abrir)</a></td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">E-mail:</td><td>' + email + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">Negócio:</td><td>' + negocio + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">Redes Sociais:</td><td>' + redes + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">Área:</td><td>' + area + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">País:</td><td>' + pais + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">Equipe:</td><td>' + equipe + '</td></tr>' +
              '<tr><td style="padding: 8px 0; font-weight: bold; color: #58432F;">Dificuldades:</td><td style="color: #8C4820; font-weight: 500;">' + dificuldades + '</td></tr>' +
            '</table>' +
            '<div style="margin-top: 20px; background-color: #FFFFFF; padding: 16px; border-radius: 8px; border-left: 4px solid #C9A98F;">' +
              '<strong style="color: #58432F; display: block; margin-bottom: 6px;">Momento atual & Objetivos:</strong>' +
              '<p style="margin: 0; font-size: 14px; white-space: pre-wrap;">' + mensagem + '</p>' +
            '</div>' +
            '<div style="margin-top: 24px; text-align: center;">' +
              '<a href="https://wa.me/' + whatsapp.replace(/\D/g, '') + '" style="background-color: #25D366; color: #FFFFFF; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">' +
                'Chamar ' + nome.split(' ')[0] + ' no WhatsApp' +
              '</a>' +
            '</div>' +
          '</div>' +
          '<div style="background-color: #E8DED3; padding: 14px; text-align: center; font-size: 11px; color: #58432F;">' +
            'Recebido em ' + timestamp + ' através do site institucional' +
          '</div>' +
        '</div>';

      MailApp.sendEmail({
        to: CONFIG.BACKUP_EMAIL,
        subject: subject,
        htmlBody: htmlBody
      });

      responseResult.email = true;
    } catch (mailErr) {
      Logger.log('Erro ao enviar e-mail de reserva: ' + mailErr.toString());
      responseResult.errors.push('E-mail: ' + mailErr.toString());
    }

  } catch (globalErr) {
    responseResult.status = 'error';
    responseResult.errors.push('Global: ' + globalErr.toString());
  } finally {
    lock.releaseLock();
  }

  // Retorna resposta JSON
  return ContentService.createTextOutput(JSON.stringify(responseResult))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Responde a requisições GET com status simples (teste de saúde)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Web App da Nayane Hartman está ativo e pronto para receber fichas.',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
