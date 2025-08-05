document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startPresentationVisitantesBtn");

    if (!startBtn) return;

    startBtn.addEventListener("click", async () => {
        const cards = document.querySelectorAll("#visitante");
        if (cards.length === 0) {
            alert("Nenhum visitante disponível para apresentar.");
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
            container.style.position = "fixed";
            container.style.top = 0;
            container.style.left = 0;
            container.style.width = "100vw";
            container.style.height = "100vh";
            container.style.backgroundColor = "#000";
            container.style.zIndex = 9999;
            container.style.display = "flex";
            container.style.justifyContent = "center";
            container.style.alignItems = "center";
            container.style.flexDirection = "column";
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

            if (index >= cards.length) {
                clearInterval(interval);
                nextBtn.style.display = "none";

                const finalSlide = document.createElement("div");
                    finalSlide.className = "fullscreen-slide text-center text-white d-flex flex-column align-items-center justify-content-center";
                    finalSlide.style.height = "100vh";

                    finalSlide.innerHTML = `
                        <img src="/images/assembleia.png" alt="Logo" class="fullscreenLogo-img" style="height: 80vh; max-width: 100%;">
                        <p class="mt-4" style="font-size: 5rem;">Sois bem vindos em nome de Jesus!</p>
                    `;

                    container.appendChild(finalSlide);

                    setTimeout(async () => {
                        container.style.display = "none";
                        document.body.style.overflow = "auto";
                        await exitFullScreen();
                    }, 4000);

            }

            const visitante = cards[index];
            const cidade = visitante.querySelector(".card-header")?.textContent || "";
            const nomeTexto = visitante.querySelector(".card-title")?.textContent || "";

            const slide = document.createElement("div");
            slide.className = "fullscreen-slide d-flex flex-column justify-content-center align-items-center text-white text-center";
            slide.style.height = "100vh";

            slide.innerHTML = `
                <h1 style="font-size: 3rem;">${cidade}</h1>
                <p style="font-size: 5rem;">${nomeTexto}</p>
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
