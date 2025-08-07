const mensagemInput = document.getElementById('mensagem');
const fileInput = document.getElementById('fileInput');
const enviarMensagemBtn = document.getElementById('enviarMensagem');
const srcDestinatario = localStorage.getItem('conversaAtual');
const destinatario = JSON.parse(srcDestinatario);
const srcUsuario = localStorage.getItem('usuarioLogado');
const usuario = JSON.parse(srcUsuario);
const roomId = `chat_${Math.min(usuario.id, destinatario.id)}_${Math.max(usuario.id, destinatario.id)}`;
const socket = io();

document.getElementById('info').innerText = `de ${usuario.nome} / para ${destinatario.nome}`;

socket.on("connect", () => {
    socket.emit("entrarNaSala", roomId);
});

function renderizarMensagem(mensagem, chat) {
    const p = document.createElement('p');
    let nomeRemetente = mensagem.de == usuario.nome ? usuario.nome : destinatario.nome;

    if (mensagem.fileUrl) {
        const fileExtension = mensagem.fileUrl.split('.').pop().toLowerCase();
        
        p.innerText = `${nomeRemetente}: `;

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          
            const img = document.createElement('img');
            img.src = mensagem.fileUrl;
            img.alt = 'Imagem enviada';
            img.style.maxWidth = '250px';
            p.appendChild(img);
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        
            const video = document.createElement('video');
            video.src = mensagem.fileUrl;
            video.controls = true;
            video.style.maxWidth = '250px';
            p.appendChild(video);
        } else {
            
            const a = document.createElement('a');
            a.href = mensagem.fileUrl;
            a.target = '_blank';
            a.innerText = `[Arquivo: ${fileExtension}]`;
            p.appendChild(a);
        }
        chat.appendChild(p);
    } else {
       
        p.innerText = `${nomeRemetente}: ${mensagem.texto}`;
        chat.appendChild(p);
    }

    chat.scrollTop = chat.scrollHeight;
}


socket.on("mensagemRecebida", (mensagem) => {
    const chat = document.getElementById('chat');
    renderizarMensagem(mensagem, chat);
});


async function buscarHistorico() {
    try {
        const response = await fetch(`/getMensagens/${usuario.id}/${destinatario.id}`);
        const mensagens = await response.json();

        const chat = document.getElementById('chat');
        chat.innerHTML = '';

        mensagens.forEach(msg => {
            const mensagemFormatada = {
                de: msg.idRemetente == usuario.id ? usuario.nome : destinatario.nome,
                fileUrl: msg.mensagem.startsWith('/uploads/') ? msg.mensagem : null,
                texto: !msg.mensagem.startsWith('/uploads/') ? msg.mensagem : null
            };
            
            renderizarMensagem(mensagemFormatada, chat);
        
            const p = chat.lastChild;
            if (p) {
                const btnDelete = document.createElement('button');
                btnDelete.textContent = 'deletar';
                btnDelete.addEventListener('click', () => {
                    fetch(`deletarMensagem/${msg.id}`, { method: 'DELETE' });
                    buscarHistorico();
                });
                p.appendChild(btnDelete);
            }
        });
        chat.scrollTop = chat.scrollHeight;
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
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            mensagem: texto,
            idRemetente: usuario.id,
            idDestinatario: destinatario.id
        })
    });

    socket.emit("enviarMensagem", { roomId, mensagem: dados });
}


async function enviarArquivo(file) {
    const formData = new FormData();
    formData.append('arquivo', file); 

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        console.log('Upload de arquivo bem-sucedido:', result);

        const dadosArquivo = {
            de: usuario.nome,
            para: destinatario.nome,
            fileUrl: result.url
        };

        fetch('/addMensagem', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                mensagem: dadosArquivo.fileUrl,
                idRemetente: usuario.id,
                idDestinatario: destinatario.id,
            })
        });

        socket.emit("enviarMensagem", { roomId, mensagem: dadosArquivo });
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