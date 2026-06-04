window.onload = function () {
    
    const ordineInitiala = Array.from(document.getElementsByClassName("produs"));

    const inpKm = document.getElementById("inp-km");
    const optKm = document.getElementById("opt-km") || document.getElementById("infoRangeKm");

    
    function eliminaDiacritice(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    
    function valideazaTextarea() {
        let txtArea = document.getElementById("inp-descriere");
        if (!txtArea) return true;
        let esteInvalid = txtArea.value.trim() !== "" && txtArea.value.split(",").some(bucata => bucata.trim() === "");

        txtArea.classList.toggle("is-invalid", esteInvalid);
        return !esteInvalid;
    }

    let txtArea = document.getElementById("inp-descriere");
    if (txtArea) txtArea.oninput = function () {
        valideazaTextarea();
        ruleazaFiltrare(); // Filtrează automat când se tastează în textarea
    };

    // ==========================================================================
    // FUNCȚIA AUTOMATĂ REUTILIZABILĂ DE FILTRARE
    // ==========================================================================
    function ruleazaFiltrare() {

        if (typeof valideazaTextarea === "function" && !valideazaTextarea()) return;


        let inpNume = eliminaDiacritice(document.getElementById("inp-nume").value.trim().toLowerCase());
        let inpDescriere = eliminaDiacritice(document.getElementById("inp-descriere").value.trim().toLowerCase());
        let inpKmMax = inpKm ? parseInt(inpKm.value) : 500000;
        let inpPutereMin = parseInt(document.getElementById("inp-putere-dl").value) || 0;
        let inpCategorie = document.getElementById("inp-categorie").value.trim();
        let inpPretMin = parseFloat(document.getElementById("inp-pret-min").value) || 0;
        let inpPretMax = parseFloat(document.getElementById("inp-pret-max").value) || Infinity;

        let bifatInmatDa = document.getElementById("chk-inmat-da").checked;
        let bifatInmatNu = document.getElementById("chk-inmat-nu").checked;

        if (inpKm) localStorage.setItem("filtruKm", inpKmMax);

        let grupRadio = document.getElementsByName("gr_rad_stare");
        let inpStare = "toate";
        for (let rad of grupRadio) { if (rad.checked) { inpStare = rad.value; break; } }

        let selectMult = document.getElementById("inp-combustibil-mult");
        let combustibiliBifati = selectMult ? Array.from(selectMult.selectedOptions).map(opt => opt.value.toLowerCase().trim()) : [];

        let produseBanateSesiune = JSON.parse(sessionStorage.getItem("produseBanate") || "[]");

        let productos = document.getElementsByClassName("produs");
        let masiniGasite = 0;

        for (let prod of productos) {
            prod.style.display = "none";


            if (produseBanateSesiune.includes(prod.id)) {
                continue;
            }

            if (prod.classList.contains("produs-pinned")) {
                prod.style.display = "flex";
                continue;
            }

            let nume = eliminaDiacritice(prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase());
            let descriere = eliminaDiacritice(prod.getElementsByClassName("val-descriere")[0] ? prod.getElementsByClassName("val-descriere")[0].innerHTML.trim().toLowerCase() : "");
            let km = parseInt(prod.getElementsByClassName("val-km")[0].innerHTML.trim()) || 0;
            let putere = parseInt(prod.getElementsByClassName("val-putere")[0]?.innerHTML.trim()) || 0;
            let categorie = prod.getElementsByClassName("val-categorie")[0] ? prod.getElementsByClassName("val-categorie")[0].innerHTML.trim() : "";
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0]?.innerHTML.trim()) || 0;
            let combustibil = prod.getElementsByClassName("val-combustibil")[0].innerHTML.trim().toLowerCase();
            let dotari = prod.getElementsByClassName("val-dotari")[0].innerHTML.trim().split(",").map(d => eliminaDiacritice(d.trim().toLowerCase()));
            let inmatriculata = prod.getElementsByClassName("val-inmatriculata")[0].innerHTML.trim().toLowerCase();

            let esteInmatriculata = (inmatriculata === "da" || inmatriculata === "true");

            let stare = "Clasica";
            if (prod.classList.contains("Noua")) stare = "Noua";
            if (prod.classList.contains("Rulata")) stare = "Rulata";

            let cond1 = nume.includes(inpNume);
            let cond2 = km <= inpKmMax;
            let cond3 = putere >= inpPutereMin;
            let cond4 = (categorie === inpCategorie || inpCategorie === "toate");
            let cond5 = (inpStare === "toate" || stare === inpStare);
            let cond6 = (esteInmatriculata && bifatInmatDa) || (!esteInmatriculata && bifatInmatNu);
            let cond7 = (pret >= inpPretMin && pret <= inpPretMax);
            let cond8 = inpDescriere === "" || inpDescriere.split(",").map(c => c.trim()).some(cuv => descriere.includes(cuv) || dotari.some(d => d.includes(cuv)));
            let cond9 = combustibiliBifati.includes(combustibil);


            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8 && cond9) {
                prod.style.display = "flex";
                masiniGasite++;
            }
            
        }

        let mesajLipsa = document.getElementById("mesaj-lipsa-produse");
        if (masiniGasite == 0) {
            mesajLipsa.style.display = "block";
        }
        else{
            mesajLipsa.style.display = "none";
        }
    }

    // ==========================================================================
    // SECTOR DISPECERAT EVENIMENTE (FILTRARE AUTOMATĂ ȘI BUTON CLASIC)
    // ==========================================================================

    const btnFiltrare = document.getElementById("filtrare");
    if (btnFiltrare) {
        btnFiltrare.onclick = ruleazaFiltrare;
    }


    document.getElementById("inp-nume").oninput = ruleazaFiltrare;
    document.getElementById("inp-putere-dl").oninput = ruleazaFiltrare;
    document.getElementById("inp-pret-min").oninput = ruleazaFiltrare;
    document.getElementById("inp-pret-max").oninput = ruleazaFiltrare;


    document.getElementById("inp-categorie").onchange = ruleazaFiltrare;
    document.getElementById("inp-combustibil-mult").onchange = ruleazaFiltrare;

    document.getElementById("chk-inmat-da").onchange = ruleazaFiltrare;
    document.getElementById("chk-inmat-nu").onchange = ruleazaFiltrare;

    let grupRadio = document.getElementsByName("gr_rad_stare");
    for (let rad of grupRadio) {
        rad.onchange = ruleazaFiltrare;
    }


    if (inpKm && optKm) {
        let kmSalvati = localStorage.getItem("filtruKm");
        if (kmSalvati) {
            inpKm.value = kmSalvati;
            optKm.innerHTML = `(${kmSalvati} km)`;
        } else {
            optKm.innerHTML = `(${inpKm.value} km)`;
        }

        inpKm.oninput = function () {
            optKm.innerHTML = `(${this.value} km)`;
            localStorage.setItem("filtruKm", this.value);
            ruleazaFiltrare();
        };
    }

    ruleazaFiltrare();

    // ==========================================================================
    // LOGICA CELOR TREI BUTOANE NOI DE PE CARDURI
    // ==========================================================================
    document.querySelectorAll(".btn-pin").forEach(btn => {
        btn.onclick = function (e) {
            e.preventDefault();
            let prodId = this.getAttribute("data-id");
            let prod = document.getElementById(prodId);
            if (prod) {
                prod.classList.toggle("produs-pinned");
                this.classList.toggle("active");
                let icon = this.querySelector("i");
                if (this.classList.contains("active")) icon.className = "bi bi-pin-angle-fill";
                else icon.className = "bi bi-pin-angle";
            }
        };
    });

    document.querySelectorAll(".btn-ascunde-temp").forEach(btn => {
        btn.onclick = function (e) {
            e.preventDefault();
            let prodId = this.getAttribute("data-id");
            let prod = document.getElementById(prodId);
            if (prod) prod.style.display = "none";
        };
    });

    document.querySelectorAll(".btn-ascunde-sesiune").forEach(btn => {
        btn.onclick = function (e) {
            e.preventDefault();
            let prodId = this.getAttribute("data-id");
            let prod = document.getElementById(prodId);
            if (prod) {
                prod.style.display = "none";
                let produseBanateSesiune = JSON.parse(sessionStorage.getItem("produseBanate") || "[]");
                if (!produseBanateSesiune.includes(prodId)) {
                    produseBanateSesiune.push(prodId);
                    sessionStorage.setItem("produseBanate", JSON.stringify(produseBanateSesiune));
                }
            }
        };
    });

    // ==========================================================================
    // OPERAȚIA DE RESETARE
    // ==========================================================================
    const btnReset = document.getElementById("resetare");
    if (btnReset) {
        btnReset.onclick = function () {
            let vreaReset = confirm("Ești sigur că vrei să resetezi toate filtrele și să anulezi sortarea?");
            if (!vreaReset) {
                return; 
            }

            localStorage.removeItem("filtruKm");
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-descriere").value = "";
            document.getElementById("inp-descriere").classList.remove("is-invalid");
            document.getElementById("inp-putere-dl").value = "";
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("chk-inmat-da").checked = true;
            document.getElementById("chk-inmat-nu").checked = true;

            let pMin = document.getElementById("inp-pret-min");
            let pMax = document.getElementById("inp-pret-max");
            if (pMin) pMin.value = pMin.min;
            if (pMax) pMax.value = pMax.max;

            if (inpKm && optKm) {
                inpKm.value = inpKm.max;
                optKm.innerHTML = `(${inpKm.max} km)`;
            }

            let grupRadio = document.getElementsByName("gr_rad_stare");
            for (let rad of grupRadio) { if (rad.value === "toate") rad.checked = true; }

            let selectMult = document.getElementById("inp-combustibil-mult");
            if (selectMult) {
                for (let opt of selectMult.options) opt.selected = true;
            }

            document.querySelectorAll(".produs").forEach(p => p.classList.remove("produs-pinned"));
            document.querySelectorAll(".btn-pin").forEach(b => {
                b.classList.remove("active");
                b.querySelector("i").className = "bi bi-pin-angle";
            });

            let container = document.querySelector(".grid-produse");
            for (let prod of ordineInitiala) { container.appendChild(prod); }

            ruleazaFiltrare();
        };
    }

    // ==========================================================================
    // SORTARE DUBLĂ DINAMICĂ PERSONALIZATĂ
    // ==========================================================================
    const btnSort = document.getElementById("btn-sorteaza");
    if (btnSort) {
        btnSort.onclick = function () {
            let cheie1 = document.getElementById("sel-sort1").value;
            let cheie2 = document.getElementById("sel-sort2").value;
            let semn = parseInt(document.getElementById("sel-ordine").value);

            let container = document.querySelector(".grid-produse");
            let masini = Array.from(document.getElementsByClassName("produs"));

            const extrageValoare = (el, cheie) => {
                let valRaw = el.getElementsByClassName(`val-${cheie}`)[0]?.innerHTML.trim() || "";
                if (cheie === "nume") return valRaw.toLowerCase();
                return parseFloat(valRaw) || 0;
            };

            masini.sort(function (a, b) {
                let valA1 = extrageValoare(a, cheie1);
                let valB1 = extrageValoare(b, cheie1);

                if (valA1 !== valB1) {
                    if (typeof valA1 === "string") return semn * valA1.localeCompare(valB1);
                    return semn * (valA1 - valB1);
                }

                let valA2 = extrageValoare(a, cheie2);
                let valB2 = extrageValoare(b, cheie2);

                if (typeof valA2 === "string") return semn * valA2.localeCompare(valB2);
                return semn * (valA2 - valB2);
            });

            for (let masina of masini) { container.appendChild(masina); }
            ruleazaFiltrare();
        };
    }

    // ==========================================================================
    // BUTON CALCULARE STATISTICI (Preț Mediu)
    // ==========================================================================
    const btnCalculare = document.getElementById("calculare");
    if (btnCalculare) {
        btnCalculare.onclick = function () {
            let Gridproduse = document.getElementsByClassName("produs");
            let suma = 0, contor = 0;

            for (let prod of Gridproduse) {
                if (prod.style.display !== "none") {
                    suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    contor++;
                }
            }

            let media = contor > 0 ? (suma / contor).toFixed(2) : 0;
            let divCalcul = document.createElement("div");

            divCalcul.innerHTML = `<h5>Preț Mediu Afișat</h5><p class="mb-0"><strong>${media} €</strong> (${contor} mașini)</p>`;
            divCalcul.className = "position-fixed bottom-0 end-0 m-4 p-3 bg-info text-dark rounded-3 shadow-lg fw-bold";
            divCalcul.style.zIndex = "99999";

            document.body.appendChild(divCalcul);
            setTimeout(function () { divCalcul.remove(); }, 2000);
        };
    }
};