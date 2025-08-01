
    //localStorage
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const usuario = JSON.parse(usuarioLogado);

    //divs
    const exibirGostos = document.getElementById('exibirGostos');
    const exibirUsuariosDiv = document.getElementById('divExibir')
    const gostosUsuario = document.getElementById('gostosUsuario');
    const divGostos = document.getElementById('divGostos');

    //botoes
    const cadastrarGosto = document.getElementById('idAddGosto');
    const exibirUsuarios = document.getElementById('btnUsuario')
    const logOut = document.getElementById('btnLogOut');
    const btnGostosUsuario = document.getElementById('btnGostosUsuario');
    const btnGostosExibir = document.getElementById('btnGostos');

    //função de carregar os usuarios
    const carregarUsuarios = async () => {
        exibirUsuariosDiv.classList.remove('oculto')

        divExibir.innerHTML = ''

        const srcExibir = await fetch('/exibir', {
            method: 'GET'
        })
        const exibir = await srcExibir.json();

        const ocultar = document.createElement('button');
        ocultar.textContent = 'ocultar'
        ocultar.classList.add('btn')

        ocultar.addEventListener('click', () => {
            exibirUsuariosDiv.classList.add('oculto')


        })

        divExibir.innerHTML = `olá ${usuario.nome}<br><br>usuarios:<br><br>`
        exibir.forEach(item => {
            const p = document.createElement('p');
            p.textContent = `-nome: ${item.nome}`;

            const btnGostos = document.createElement('button');
            btnGostos.textContent = 'ver detalhes do usuario'
            btnGostos.classList.add('btn')

            btnGostos.addEventListener('click', async () => {
                exibirGostos.classList.remove('oculto')

                try {
                    const response = await fetch(`/exibirDadosUsuario/${item.id}`, {
                        method: 'GET'
                    })
                    const dadosUsuario = await response.json();

                    const btnOcultar = document.createElement('button')
                    btnOcultar.textContent = 'ocultar'
                    btnOcultar.classList.add('btn')
                    btnOcultar.addEventListener('click', () => {
                        exibirGostos.classList.add('oculto')
                    })
                    exibirGostos.innerHTML = ''
                    exibirGostos.innerHTML = `dados do usuario ${item.nome}:<br><br>`
                    dadosUsuario.forEach(dados => {
                        const novoDado = document.createElement('p')
                        novoDado.textContent = `-${dados.gosto}`
                        exibirGostos.appendChild(novoDado);
                    })
                    exibirGostos.appendChild(btnOcultar)
                    
                } catch (error) {
                    alert('erro ao exibir dados do usuario', error)
                }

            })

            p.appendChild(btnGostos);
            divExibir.appendChild(p);
            divExibir.appendChild(ocultar);
        })

    };

    //função dos gostos do usuario logado
    const carregarGostosUsuarioLogado = async () => {
        gostosUsuario.classList.remove('oculto');

        gostosUsuario.innerHTML = '';
        const src = await fetch(`/gostosUsuario/${usuario.id}`, {
            method: 'GET'
        });
        const gostos = await src.json();

        const btnOcultar = document.createElement('button');
        btnOcultar.textContent = 'ocultar';
        btnOcultar.classList.add('btn')

        btnOcultar.addEventListener('click', () => {
            gostosUsuario.classList.add('oculto');

        });

        gostosUsuario.innerHTML = 'seus gostos:<br><br>'
        gostos.forEach(item => {
            const p = document.createElement('p');
            p.textContent = `-${item.nome_gosto}`
            const btnDeletar = document.createElement('button');
            btnDeletar.textContent = 'deletar';
            btnDeletar.classList.add('btnDeletar')

            btnDeletar.addEventListener('click', async () => {
                try {
                    const response = await fetch(`/deletarGostoUsuario/${item.id}`, {
                        method: 'DELETE'
                    })
                    if (response.ok) {
                        alert('gosto deletado com sucesso')
                    } else {
                        alert('erro ao deletar gosto')
                    }
                    carregarGostosUsuarioLogado()
                } catch (error) {
                    alert('erro ao deletar gosto')
                }
            })

            p.appendChild(btnDeletar)
            gostosUsuario.appendChild(p)
        })
        gostosUsuario.appendChild(btnOcultar)

    };

    //função que exibe gostos gerais
    const carregarGostosGerais = async () => {
        divGostos.classList.remove('oculto')

        const gostosSrc = await fetch('/exibirGostos', {
            method: 'GET'
        })
        const gostos = await gostosSrc.json()

        const btnOcultar = document.createElement('button');
        btnOcultar.textContent = 'ocultar'
        btnOcultar.classList.add('btn')

        btnOcultar.addEventListener('click', () => {
            divGostos.classList.add('oculto')

        })

        divGostos.innerHTML = ''
        divGostos.innerHTML = 'gostos:<br><br>'
        gostos.forEach(item => {
            const p = document.createElement('p')
            p.textContent = `-${item.nome}`

            const btnAdicionar = document.createElement('button');
            btnAdicionar.textContent = 'adicionar gosto a usuario'
            btnAdicionar.classList.add('btn')
            btnAdicionar.addEventListener('click', async () => {
                try {

                    const response = await fetch('/gostoUsuarioAdd', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        }, body: JSON.stringify({
                            idUsuario: usuario.id,
                            nomeGosto: item.id
                        })
                    })

                    if (response.ok) {
                        alert('cadastro de gosto realizado com sucesso');
                    } else {
                        alert('gosto ja cadastrado nos dados do usuario');
                    }
                    if (!gostosUsuario.classList.contains('oculto')) {
                        carregarGostosUsuarioLogado()
                    }
                } catch (error) {
                    alert('erro ao realizar o cadastro do gosto');
                }

            })
            p.appendChild(btnAdicionar)
            divGostos.appendChild(p)

        })
        divGostos.appendChild(btnOcultar)
    };

    //botao que exibe usuarios
    if (exibirUsuarios) {
        exibirUsuarios.addEventListener('click', carregarUsuarios)
    }


    //botão dos gostos do usuario logado
    if (btnGostosUsuario) {
        btnGostosUsuario.addEventListener('click', carregarGostosUsuarioLogado)
    }

    //botao que exibe gostos gerais
    if (btnGostosExibir) {
        btnGostosExibir.addEventListener('click', carregarGostosGerais)
    }

    //botão de logout
    if (logOut) {
        logOut.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html'
        })
    }

    //cadastra gosto(não precisa colocar em algum botão)
    if (cadastrarGosto) {
        cadastrarGosto.addEventListener('click', () => {
            const nome = iptGosto.value;
            if (nome == '') {
                alert('insira algum valor')
                return
            }
            if (nome.includes(' ')) {
                alert('não inclua espaços')
                return
            }
            fetch('/addGosto', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                }, body: JSON.stringify({
                    nome: nome
                })
            }).then(response => {
                if (response.ok) {
                    alert('gosto cadastrado com sucesso')
                } else {
                    alert('gosto ja existe')
                }
                if (!divGostos.classList.contains('oculto')) {
                    carregarGostosGerais()
                }
            })
        })
    }