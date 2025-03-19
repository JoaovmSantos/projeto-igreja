// Popup para enviar pedidos de oração
document.addEventListener("DOMContentLoaded", function () {
const form = document.querySelector("#formPedido");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries()); 
        const jsonString = JSON.stringify(formObject);

        console.log("Enviando dados:", formObject); // Para depuração

        fetch("/pedidoOracao", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: jsonString
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: "Pedido enviado!",
                    text: "Seu pedido de oração foi registrado com sucesso.",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    form.reset();
                });
            } else {
                Swal.fire({
                    title: "Erro!",
                    text: data.message,
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            Swal.fire({
                title: "Erro!",
                text: "Ocorreu um erro ao enviar o pedido.",
                icon: "error",
                confirmButtonText: "OK"
            });
        });
    });
});

document.getElementById("btnAddDescricao").addEventListener("click", function() {
    var descricaoContainer = document.getElementById("descricaoContainer");
    descricaoContainer.style.display = descricaoContainer.style.display === "none" ? "block" : "none";
});