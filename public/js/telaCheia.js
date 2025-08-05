document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startPresentationBtn");

    if (!startBtn) return;

    startBtn.addEventListener("click", async () => {
        const pedidos = document.querySelectorAll("#pedido");
        if (pedidos.length === 0) {
            alert("Nenhum pedido disponível para apresentar.");
            return;
        }

        const goFullScreen = async () => {
            const el = document.documentElement;
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) await el.msRequestFullscreen();
        };

        const exitFullScreen = async () => {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
            else if (document.msExitFullscreen) await document.msExitFullscreen();
        };

        await goFullScreen();

        let container = document.getElementById("presentationContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "presentationContainer";
            document.body.appendChild(container);
        }

        container.innerHTML = "";

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

        const nextBtn = document.createElement("button");
        nextBtn.id = "nextSlideBtn";
        nextBtn.className = "btn btn-dark position-absolute bottom-0 end-0 m-4 z-3";
        nextBtn.innerText = "Próximo";
        container.appendChild(nextBtn);

        container.style.display = "block";
        document.body.style.overflow = "hidden";

        let index = 0;

        const showSlide = () => {
            container.querySelectorAll(".fullscreen-slide").forEach(el => el.remove());

            if (index >= pedidos.length) {
                clearInterval(interval);
                nextBtn.style.display = "none";

                const finalSlide = document.createElement("div");
                finalSlide.className = "fullscreen-slide text-center text-white d-flex flex-column align-items-center justify-content-center";
                finalSlide.innerHTML = `
                    <img src="/images/assembleia.png" alt="Logo" class="fullscreenLogo-img" style="max-width: 300px;">
                    <p class="mt-4" style="font-size: 5rem;">Vamos Orar</p>
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
            const categoria = pedido.querySelector(".pedidoCategoria")?.textContent || "";
            const titulo = pedido.querySelector(".pedidoDescricao")?.textContent || "Pedido de oração";

            const slide = document.createElement("div");
            slide.className = "fullscreen-slide d-flex flex-column justify-content-center align-items-center text-white text-center";
            slide.style.height = "100vh";

            slide.innerHTML = `
                <h1 style="font-size: 3rem;">${titulo}</h1>
                <p style="font-size: 2rem; max-width: 80%;">${categoria}</p>
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
