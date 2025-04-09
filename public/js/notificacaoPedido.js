document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formMarcarTodos");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            Swal.fire({
                title: 'Tem certeza?',
                text: "Todos os pedidos serão marcados como lido!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, marcar todos',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    form.submit();
                }
            });
        });
    }
});