document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formApagarTodos");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault(); // Evita envio automático

            Swal.fire({
                title: 'Tem certeza?',
                text: "Todos os pedidos do histórico serão apagados!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, apagar tudo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    form.submit(); // Envia o formulário se confirmado
                }
            });
        });
    }
});