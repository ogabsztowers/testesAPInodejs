const container = document.querySelector('.container');

function signUp() {
    container.classList.add('right-panel-active');
}

function voltar() {
    container.classList.remove('right-panel-active');
}

async function signUpButton() {
    const email = emailLogin.value;
    const senha = senhaLogin.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }, body: JSON.stringify({
                email: email,
                senha: senha
            })
        })

        const data = await response.json()

        if (response.ok) {
            console.log('login realizado com sucesso');
            localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
            window.location.href = 'boasVindas.html';
        } else {
            alert('email ou senha incorretos')
        }

    } catch (error) {
        alert('erro ao realizar o login', error);
        console.log('erro ao realizar o login');
    }
}

function signInButton() {
    const email = emailCadastro.value;
    const senha = senhaCadastro.value;
    const nome = nomeCadastro.value;

    if (email == '' || senha == '' || nome == '') {
        alert('preencha todos os campos')
        return;
    }

    if (!email.includes('@')) {
        alert('email invalido')
        return;
    }

    let divide = email.split('@');

    if (divide[0] == '') {
        alert('favor preencha campo antes do @')
        return;
    }

    if (divide[1] == '') {
        alert('favor insira dominio')
        return;
    }

    if (!divide[1].includes('.')) {
        alert('adicione um dominio')
        return;
    }
    const dividePonto = divide[1].split('.');

    if (dividePonto[0] == '') {
        alert('preencha campo antes do .');
        return;
    }

    if (dividePonto[1] == '') {
        alert('preencha campo apos o .')
        return;
    }

    fetch('/cadastro', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify({
            email: email,
            senha: senha,
            nome: nome
        })
    }).then(response => {
        if (response.ok) {
            voltar();
        } else {
            alert('erro ao realizar o cadastro')
        }
    })
}