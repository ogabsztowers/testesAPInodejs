const usuarioLogado = localStorage.getItem('usuarioLogado');
const usuario = JSON.parse(usuarioLogado);

const cardPerfil = document.getElementById('cardPerfil');
const cardTags = document.getElementById('cardTags');
const cardComunidade = document.getElementById('cardComunidade');

const secaoPerfil = document.getElementById('secaoPerfil');
const secaoTags = document.getElementById('secaoTags');
const secaoComunidade = document.getElementById('secaoComunidade');
const detalhesUsuario = document.getElementById('detalhesUsuario');

const gostosUsuarioDiv = document.getElementById('gostosUsuario');
const divGostos = document.getElementById('divGostos');
const divExibir = document.getElementById('divExibir');
const exibirGostos = document.getElementById('exibirGostos');

const iptGosto = document.getElementById('iptGosto');
const cadastrarGostoBtn = document.getElementById('idAddGosto');
const logOutBtn = document.getElementById('btnLogOut');
const btnVoltarComunidade = document.getElementById('btnVoltarComunidade');

const mostrarSecao = (secao) => {
    secaoPerfil.classList.add('oculto');
    secaoTags.classList.add('oculto');
    secaoComunidade.classList.add('oculto');
    detalhesUsuario.classList.add('oculto');
    secao.classList.remove('oculto');
};

// Funções para carregar dados
const carregarGostosUsuarioLogado = async () => {
    gostosUsuarioDiv.innerHTML = '<h3>Suas Tags</h3>';
    const src = await fetch(`/gostosUsuario/${usuario.id}`, { method: 'GET' });
    const gostos = await src.json();
    
    gostos.forEach(item => {
        const p = document.createElement('p');
        p.innerHTML = `<span>${item.nome_gosto}</span>`;
        
        const btnDeletar = document.createElement('button');
        btnDeletar.textContent = 'Deletar';
        btnDeletar.classList.add('btnDeletar');
        btnDeletar.addEventListener('click', async () => {
            try {
                await fetch(`/deletarGostoUsuario/${item.id}`, { method: 'DELETE' });
                alert('Tag deletada com sucesso!');
                carregarGostosUsuarioLogado(); 
            } catch (error) {
                alert('Erro ao deletar gosto.');
            }
        });
        
        p.appendChild(btnDeletar);
        gostosUsuarioDiv.appendChild(p);
    });
};

const carregarGostosGerais = async () => {
    divGostos.innerHTML = '<h3>Tags Disponíveis</h3>';
    const gostosSrc = await fetch('/exibirGostos', { method: 'GET' });
    const gostos = await gostosSrc.json();

    gostos.forEach(item => {
        const p = document.createElement('p');
        p.innerHTML = `<span>${item.nome}</span>`;
        
        const btnAdicionar = document.createElement('button');
        btnAdicionar.textContent = 'Adicionar';
        btnAdicionar.classList.add('btn');
        btnAdicionar.addEventListener('click', async () => {
            try {
                const response = await fetch('/gostoUsuarioAdd', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ idUsuario: usuario.id, nomeGosto: item.id })
                });
                
                if (response.ok) {
                    alert('Tag adicionada com sucesso!');
                    carregarGostosUsuarioLogado();
                } else {
                    alert('Você já tem essa tag!');
                }
            } catch (error) {
                alert('Erro ao adicionar a tag.');
            }
        });
        p.appendChild(btnAdicionar);
        divGostos.appendChild(p);
    });
};

const carregarComunidade = async () => {
    divExibir.innerHTML = '<h3>Membros da Comunidade</h3>';
    const srcExibir = await fetch('/exibir', { method: 'GET' });
    const exibir = await srcExibir.json();

    exibir.forEach(item => {
        const p = document.createElement('p');
        p.innerHTML = `<span>${item.nome}</span>`;

        const actionButtons = document.createElement('div');
        const btnDetalhes = document.createElement('button');
        btnDetalhes.textContent = 'Detalhes';
        btnDetalhes.classList.add('btn');
        btnDetalhes.addEventListener('click', () => {
            carregarDetalhesUsuario(item);
        });

        const btnChat = document.createElement('button');
        btnChat.textContent = 'Chat';
        btnChat.classList.add('btn');
        btnChat.addEventListener('click', () => {
            localStorage.setItem('conversaAtual', JSON.stringify(item));
            window.location.href = 'chat.html';
        });

        actionButtons.appendChild(btnDetalhes);
        actionButtons.appendChild(btnChat);
        p.appendChild(actionButtons);
        divExibir.appendChild(p);
    });
};

const carregarDetalhesUsuario = async (item) => {
    mostrarSecao(detalhesUsuario);
    exibirGostos.innerHTML = `<h3>Tags de ${item.nome}</h3>`;
    try {
        const response = await fetch(`/exibirDadosUsuario/${item.id}`, { method: 'GET' });
        const dadosUsuario = await response.json();
        dadosUsuario.forEach(dados => {
            const novoDado = document.createElement('p');
            novoDado.textContent = `${dados.gosto}`;
            exibirGostos.appendChild(novoDado);
        });
    } catch (error) {
        alert('Erro ao exibir dados do usuário.');
    }
};

cardPerfil.addEventListener('click', () => {
    mostrarSecao(secaoPerfil);
    carregarGostosUsuarioLogado();
});

cardTags.addEventListener('click', () => {
    mostrarSecao(secaoTags);
    carregarGostosGerais();
});

cardComunidade.addEventListener('click', () => {
    mostrarSecao(secaoComunidade);
    carregarComunidade();
});

btnVoltarComunidade.addEventListener('click', () => {
    mostrarSecao(secaoComunidade);
});

if (cadastrarGostoBtn) {
    cadastrarGostoBtn.addEventListener('click', async () => {
        const nome = iptGosto.value.trim();
        if (!nome || nome.includes(' ')) {
            return alert('A tag não pode estar vazia ou conter espaços.');
        }
        try {
            const response = await fetch('/addGosto', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ nome: nome })
            });
            if (response.ok) {
                alert('Tag criada com sucesso!');
                iptGosto.value = '';
                carregarGostosUsuarioLogado();
            } else {
                alert('Essa tag já existe!');
            }
        } catch (error) {
            alert('Erro ao criar a tag.');
        }
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nomeUsuario').textContent = usuario.nome;
    mostrarSecao(secaoPerfil);
    carregarGostosUsuarioLogado();
});