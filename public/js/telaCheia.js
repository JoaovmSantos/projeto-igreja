document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startPresentationBtn");

    if (!startBtn) return;

    startBtn.addEventListener("click", async () => {
        const pedidos = document.querySelectorAll("#pedido");
        if (pedidos.length === 0) {
            alert("Nenhum pedido disponível para apresentar.");
            return;
        }

        // Força tela cheia
        const goFullScreen = async () => {
            const el = document.documentElement;
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) await el.msRequestFullscreen();
        };

        // Sair do modo tela cheia
        const exitFullScreen = async () => {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
            else if (document.msExitFullscreen) await document.msExitFullscreen();
        };

        await goFullScreen();

        // Cria o container da apresentação se ainda não existe
        let container = document.getElementById("presentationContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "presentationContainer";
            document.body.appendChild(container);
        }

        container.innerHTML = ""; // Limpa qualquer conteúdo anterior

        // Botão de fechar
        const closeBtn = document.createElement("button");
        closeBtn.id = "closePresentationBtn";
        closeBtn.className = "btn btn-light position-absolute top-0 end-0 m-3 z-3";
        closeBtn.innerText = "Fechar";
        closeBtn.addEventListener("click", async () => {
            clearInterval(interval);
            container.style.display = "none";
            document.body.style.overflow = "auto";
            await exitFullScreen();
        });
        container.appendChild(closeBtn);

        // Botão próximo
        const nextBtn = document.createElement("button");
        nextBtn.id = "nextSlideBtn";
        nextBtn.className = "btn btn-dark position-absolute bottom-0 end-0 m-4 z-3";
        nextBtn.innerText = "Próximo";
        container.appendChild(nextBtn);

        // Mostra container
        container.style.display = "block";
        document.body.style.overflow = "hidden";

        let index = 0;

        const showSlide = () => {
            // Remove slides antigos (exceto botões)
            container.querySelectorAll(".fullscreen-slide").forEach(el => el.remove());

            if (index >= pedidos.length) {
                clearInterval(interval);
                nextBtn.style.display = "none";

                // Mostra logo no final
                const finalSlide = document.createElement("div");
                finalSlide.className = "fullscreen-slide";
                finalSlide.innerHTML = `
                    <img src="/images/assembleia.png" alt="Logo" class="logo-img" style="max-width: 300px;">
                    <p class="mt-4" style="font-size: 2rem;">Vamos Orar</p>
                `;
                container.appendChild(finalSlide);

                setTimeout(async () => {
                    container.style.display = "none";
                    document.body.style.overflow = "auto";
                    await exitFullScreen();
                }, 4000);
                return;
            }

            const pedido = pedidos[index];
            const slide = document.createElement("div");
            slide.className = "fullscreen-slide";

            const nome = pedido.querySelector("h4")?.textContent || "Pedido de oração";
            const categoria = pedido.querySelector(".badge")?.textContent || "";

            slide.innerHTML = `
                <h1>${categoria}</h1>
                <p>${nome}</p>
            `;

            container.appendChild(slide);
        };

        const nextSlide = () => {
            index++;
            showSlide();
        };

        nextBtn.addEventListener("click", () => {
            clearInterval(interval); 
            nextSlide();
        });

        showSlide();
        const interval = setInterval(nextSlide, 500000);
    });
});
