const cadastro = document.getElementById('btnCadastro');

if (cadastro) {
    cadastro.addEventListener('click', () => {
        const email = iptEmail.value;
        const senha = iptSenha.value;
        const nome = iptNome.value;

        if (email == '' || senha == '') {
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
                alert('cadasatro realizado com sucesso');
                window.location.href = 'login.html'
            } else {
                alert('erro ao realizar o cadastro')
            }
        })
    })
}
