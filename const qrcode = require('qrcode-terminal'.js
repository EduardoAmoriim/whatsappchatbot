const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

// Objeto para armazenar os tempos de último atendimento humano
const ultimosAtendimentos = {};

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Confirmação de conexão
client.on('ready', () => {
    console.log('WhatsApp conectado com sucesso!');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// Função para verificar se passaram 24 horas desde o último atendimento
function podeResponder(numero) {
    if (!ultimosAtendimentos[numero]) return true;
    
    const agora = new Date();
    const diferencaHoras = (agora - ultimosAtendimentos[numero]) / (1000 * 60 * 60);
    return diferencaHoras >= 24;
}

// Função para registrar atendimento humano
function registrarAtendimentoHumano(numero) {
    ultimosAtendimentos[numero] = new Date();
}

// Funil de atendimento
client.on('message', async msg => {
    // Ignora mensagens de grupos e mensagens fora do período de resfriamento
    if (!msg.from.endsWith('@c.us') || !podeResponder(msg.from)) return;

    // Saudação inicial
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|bom|tarde|boa|agendar|agendamento|opa|iniciar)/i)) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname || 'cliente';

        await chat.sendStateTyping();
        await delay(1000);
        
        await client.sendMessage(msg.from, `👋 Olá *${name.split(" ")[0]}*! Sou o assistente da *Unic Barbearia*.\n\nPor favor, escolha uma opção:\n\n` +
                                        `*1* - Agendar horário 📅\n` +
                                        `*2* - Ver localização 📍\n` +
                                        `*3* - Falar com atendente 👨‍💼`);
    }

    // Opção 1 - Agendamento geral
    if (msg.body === '1') {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(800);
        
        await client.sendMessage(msg.from, '📅 *Agendamento Online* - Escolha seu barbeiro:\n\n' +
            '• *Izaque*: \n\n' +
            '• *Anderson*:\n\n ' +
            '• *Geovene*: \n\n' +
            '• *Agendamento online*:  https://barb.page.link/NNjgc\n\n' + 
            '🕒 *Horários disponíveis:* \n\n' +
            'Segunda a Sexta: 08:00 às 19:00\n\n' +
            'Sábados: 07:30 às 18:30\n\n' +
            'Precisa de ajuda com o agendamento? Digite *3* para falar com nosso atendente.');
    }

    // Opção 2 - Localização
    if (msg.body === '2') {
        const chat = await msg.getChat();
        
        await chat.sendStateTyping();
        await delay(800);
        
        await client.sendMessage(msg.from, '📍 *Nossa Localização:*\n' +
                                        'R. Primeiro de Maio, 73 - centro\n\n' +
                                        'Link do Google Maps:\n' +
                                        'https://l1nk.dev/unicbarbearia\n\n' +
                                        'Digite *3* para falar com atendente sobre direções.');
    }

    // Opção 3 - Falar com atendente
    if (msg.body === '3') {
        await transferirParaAtendente(msg.from);
    }
});

// Função para transferir para atendente 
async function transferirParaAtendente(from) {
    const chat = await client.getChatById(from);
    
    await chat.sendStateTyping();
    await delay(1000);
    
    await client.sendMessage(from, '🔃 *Transferindo para atendente *...\n\n' +
                                'Por favor, aguarde um momento enquanto conectamos você com nosso time.\n\n' +
                                'Obrigado por escolher a *Unic Barbearia*! ✂️');
    
    // Registrar o atendimento humano
    registrarAtendimentoHumano(from);
    
    // Aqui você pode adicionar lógica para notificar seu time sobre o novo atendimento
    // Por exemplo, enviar para um grupo de atendentes
    // Exemplo:
    // await client.sendMessage('grupo-de-atendentes@chat.whatsapp.com', `Novo atendimento solicitado por: ${from}`);
}