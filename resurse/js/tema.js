
    const temaSalvata = localStorage.getItem("tema") || "light";
    if (temaSalvata === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }

    document.addEventListener("DOMContentLoaded", function() {
        const switchTema = document.getElementById("switch-tema");

        if (temaSalvata === "dark" && switchTema) {
            switchTema.checked = true;
        }

        if (switchTema) {
            switchTema.onchange = function() {
                if (this.checked) {
                    document.documentElement.setAttribute("data-theme", "dark");
                    localStorage.setItem("tema", "dark");
                } else {
                    document.documentElement.removeAttribute("data-theme");
                    localStorage.setItem("tema", "light");
                }
            };
        }
    });