   // Mostrar ou esconder o campo "Nome da Igreja"
    document.addEventListener("DOMContentLoaded", () => {
        const select = document.getElementById("fazParteIgreja");
        const campoNomeIgreja = document.getElementById("campoNomeIgreja");

        select.addEventListener("change", () => {
            if (select.value === "1") {
                campoNomeIgreja.style.display = "block";
                document.getElementById("nomeIgreja").setAttribute("required", "required");
            } else {
                campoNomeIgreja.style.display = "none";
                document.getElementById("nomeIgreja").removeAttribute("required");
            }
        });
    });
  document.getElementById('pertenceIgreja').addEventListener('change', function () {
    const campoNomeIgreja = document.getElementById('campoNomeIgreja');
    if (this.value === '1') {
      campoNomeIgreja.style.display = 'block';
      document.getElementById('nomeIgreja').setAttribute('required', 'required');
    } else {
      campoNomeIgreja.style.display = 'none';
      document.getElementById('nomeIgreja').removeAttribute('required');
    }
  });