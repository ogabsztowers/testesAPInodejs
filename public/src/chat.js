const mensagemInput = document.getElementById('mensagem');
const fileInput = document.getElementById('fileInput');
const enviarMensagemBtn = document.getElementById('enviarMensagem');
const srcDestinatario = localStorage.getItem('conversaAtual');
const destinatario = JSON.parse(srcDestinatario);
const srcUsuario = localStorage.getItem('usuarioLogado');
const usuario = JSON.parse(srcUsuario);
const roomId = `chat_${Math.min(usuario.id, destinatario.id)}_${Math.max(usuario.id, destinatario.id)}`;
const socket = io();

const infoDiv = document.getElementById('info');

socket.on("connect", () => {
    socket.emit("entrarNaSala", { roomId, userId: usuario.id });
});

socket.on('statusOnline', (data) => {
    if (data.userId == destinatario.id) {
        infoDiv.innerText = `${destinatario.nome}: Online`;
    }
});

socket.on('statusOffline', (data) => {
    if (data.userId == destinatario.id) {
        infoDiv.innerText = `${destinatario.nome}: Offline`;
    }
});

socket.on("mensagemDeletada", (data) => {
    const chat = document.getElementById('chat');
    const mensagemElemento = chat.querySelector(`[data-message-id="${data.id}"]`);
    if (mensagemElemento) {
        mensagemElemento.remove();
    }
});

function rolarChatParaFinal() {
    const chatDiv = document.getElementById('chat');
    chatDiv.scrollTo({
        top: chatDiv.scrollHeight,
        behavior: 'smooth'
    });
}

function renderizarMensagem(mensagem, chat) {
    const p = document.createElement('p');
    p.dataset.messageId = mensagem.id;
    p.classList.add('contChat');
    if (mensagem.de === usuario.nome) {
        p.classList.add('minha-mensagem');
    } else {
        p.classList.add('outra-mensagem');
    }
    
    let nomeRemetente = mensagem.de == usuario.nome ? usuario.nome : destinatario.nome;

    if (mensagem.fileUrl) {
        const fileExtension = mensagem.fileUrl.split('.').pop().toLowerCase();
        p.innerText = `${nomeRemetente}: `;

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            const img = document.createElement('img');
            img.src = mensagem.fileUrl;
            img.alt = 'Imagem enviada';
            p.appendChild(img);
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
            const video = document.createElement('video');
            video.src = mensagem.fileUrl;
            video.controls = true;
            p.appendChild(video);
        } else {
            const a = document.createElement('a');
            a.href = mensagem.fileUrl;
            a.target = '_blank';
            a.innerText = `[Arquivo: ${fileExtension}]`;
            p.appendChild(a);
        }
    } else {
        p.innerText = `${nomeRemetente}: ${mensagem.texto}`;
    }

    chat.appendChild(p);
    return p;
}

function adicionarBotaoDeletar(msg, p) {
    const btnDelete = document.createElement('button');
    btnDelete.textContent = 'apagar';
    btnDelete.classList.add('btnDelet')
    if (msg.fileUrl) {
        btnDelete.dataset.fileUrl = msg.fileUrl;
    }
    btnDelete.addEventListener('click', async () => {
        const fileUrl = btnDelete.dataset.fileUrl;
        await fetch(`deletarMensagem/${msg.id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl, roomId })
        });
    });
    p.appendChild(btnDelete);
}

socket.on("mensagemRecebida", (mensagem) => {
    const chat = document.getElementById('chat');
    const p = renderizarMensagem(mensagem, chat);
    const mensagemFormatada = {
        id: mensagem.id,
        fileUrl: mensagem.fileUrl || null,
        texto: mensagem.texto || null,
        de: mensagem.de
    };
    
    if (mensagem.de === usuario.nome) {
        adicionarBotaoDeletar(mensagemFormatada, p);
    }
    rolarChatParaFinal();
});

async function buscarHistorico() {
    try {
        const response = await fetch(`/getMensagens/${usuario.id}/${destinatario.id}`);
        const mensagens = await response.json();
        const chat = document.getElementById('chat');
        chat.innerHTML = '';
        mensagens.forEach(msg => {
            const mensagemFormatada = {
                id: msg.id,
                de: msg.idRemetente == usuario.id ? usuario.nome : destinatario.nome,
                fileUrl: msg.mensagem.startsWith('/uploads/') ? msg.mensagem : null,
                texto: !msg.mensagem.startsWith('/uploads/') ? msg.mensagem : null,
                idRemetente: msg.idRemetente
            };
            const p = renderizarMensagem(mensagemFormatada, chat);
            if (mensagemFormatada.idRemetente === usuario.id) {
                adicionarBotaoDeletar(mensagemFormatada, p);
            }
        });
        rolarChatParaFinal();
    } catch (error) {
        console.error('Erro ao buscar histórico de mensagens:', error);
    }
}

function enviarMensagemDeTexto(texto) {
    const dados = {
        de: usuario.nome,
        para: destinatario.nome,
        texto: texto
    };
    fetch('/addMensagem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            mensagem: texto,
            idRemetente: usuario.id,
            idDestinatario: destinatario.id
        })
    }).then(response => response.json())
      .then(result => {
        const mensagemComId = { ...dados, id: result.insertId };
        socket.emit("enviarMensagem", { roomId, mensagem: mensagemComId });
      });
}

async function enviarArquivo(file) {
    const formData = new FormData();
    formData.append('arquivo', file); 
    try {
        const response = await fetch(`/upload/${roomId}`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        const dadosArquivo = {
            de: usuario.nome,
            para: destinatario.nome,
            fileUrl: result.url
        };
        const addMensagemResponse = await fetch('/addMensagem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                mensagem: dadosArquivo.fileUrl,
                idRemetente: usuario.id,
                idDestinatario: destinatario.id,
            })
        });
        const addMensagemResult = await addMensagemResponse.json();
        const mensagemComId = { ...dadosArquivo, id: addMensagemResult.insertId };
        socket.emit("enviarMensagem", { roomId, mensagem: mensagemComId });
    } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
    }
}

enviarMensagemBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const texto = mensagemInput.value;
    const file = fileInput.files[0];
    if (texto.trim()) {
        enviarMensagemDeTexto(texto);
    }
    if (file) {
        enviarArquivo(file);
    }
    mensagemInput.value = "";
    fileInput.value = null;
});

buscarHistorico();