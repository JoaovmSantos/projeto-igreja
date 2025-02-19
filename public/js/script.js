document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!usuario || !senha) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Preencha todos os campos!',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
    });

    const result = await response.json();

    if (result.success) {
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: result.message,
            confirmButtonColor: '#3085d6'
        }).then(() => {
            window.location.href = '/pedidos';
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: result.message,
            confirmButtonColor: '#d33'
        });
    }
});