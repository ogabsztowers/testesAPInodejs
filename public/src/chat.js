const divExibir = document.getElementById('divExibir');

const srcDestinatario = localStorage.getItem('conversaAtual');
const destinatario = JSON.parse(srcDestinatario);

const srcUsuario = localStorage.getItem('usuarioLogado');
const usuario = JSON.parse(srcUsuario);

const roomId = `chat_${Math.min(usuario.id, destinatario.id)}_${Math.max(usuario.id, destinatario.id)}`;

const socket = io("https://3d23ec468f38.ngrok-free.app");

document.getElementById('info').innerText = `de ${usuario.nome} / para ${destinatario.nome}`;

socket.on("connect", () => {
    socket.emit("entrarNaSala", roomId);
});

socket.on("mensagemRecebida", (mensagem) => {
    const chat = document.getElementById('chat');
    const p = document.createElement('p');
    p.innerText = `${mensagem.de}: ${mensagem.texto}`;
    chat.appendChild(p);
});

async function buscarHistorico() {
    try {
        const response = await fetch(`/getMensagens/${usuario.id}/${destinatario.id}`);
        const mensagens = await response.json();

        const chat = document.getElementById('chat');
        chat.innerHTML = ''; 

        mensagens.forEach(msg => {
            let nomeRemetente = msg.idRemetente == usuario.id ? usuario.nome : destinatario.nome;
            const p = document.createElement('p');
            p.innerText = `${nomeRemetente}: ${msg.mensagem}`;
            chat.appendChild(p);
        });

    } catch (error) {
        console.error('Erro ao buscar histórico de mensagens:', error);
    }
}

function enviarMensagem() {
    const texto = document.getElementById('mensagem').value;

    if (!texto.trim()) return;

    const dados = {
        de: usuario.nome,
        para: destinatario.nome,
        texto: texto
    };

    fetch('/addMensagem', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            mensagem: texto,
            idRemetente: usuario.id,
            idDestinatario: destinatario.id
        })
    });

    socket.emit("enviarMensagem", { roomId, mensagem: dados });
    document.getElementById("mensagem").value = "";
}

buscarHistorico();