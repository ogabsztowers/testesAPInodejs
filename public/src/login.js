const login = document.getElementById('btnLogin');

    if (login) {
        login.addEventListener('click', async () => {
            const email = iptEmail.value;
            const senha = iptSenha.value;

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
                    alert('login realizado com sucesso');
                    console.log('login realizado com sucesso');
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                    window.location.href = 'boasVindas.html';
                }else{
                    alert('email ou senha incorretos')
                }

            } catch (error) {
                alert('erro ao realizar o login', error);
                console.log('erro ao realizar o login');
            }

        })

    }
