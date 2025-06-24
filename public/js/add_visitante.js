document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("pertenceIgreja");
    const campoNomeIgreja = document.getElementById("campoNomeIgreja");

    select.addEventListener("change", () => {
        if (select.value === "sim") {
            campoNomeIgreja.style.display = "block";
            document.getElementById("nomeIgreja").setAttribute("required", "required");
        } else {
            campoNomeIgreja.style.display = "none";
            document.getElementById("nomeIgreja").removeAttribute("required");
        }
    });
});
