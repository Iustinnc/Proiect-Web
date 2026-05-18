const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const sass = require('sass');
const sharp = require('sharp');
const pg = require('pg');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, 'resurse/scss'),
    folderCss: path.join(__dirname, 'resurse/css'),
    folderBackup: path.join(__dirname, 'backup')
};

function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis = numeFisExt.substring(0, numeFisExt.lastIndexOf("."));   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
        console.log(`Folderul creat: ${folder}`);
    }
}


console.log("Calea fisierului:", __filename);
console.log("Folder index.js:", __dirname);
console.log("Directorul de lucru (CWD):", process.cwd());

client = new pg.Client ({
    database: 'masini',
    user: 'iustin',
    password: 'iustin',
    host: 'localhost',
    port: 5432
})

client.connect()

// ========================================================
// SISTEMUL DE ERORI (Etapa 4)
// ========================================================

// ========================================================
// BONUS: VERIFICARE JSON ERORI
// ========================================================
function verificareDateJSON() {
    let caleJson = path.join(__dirname, 'resurse/json/erori.json');

    // BONUS 1: Nu există fișierul erori.json
    if (!fs.existsSync(caleJson)) {
        console.error("[EROARE FATALĂ] Fișierul erori.json nu există! Serverul se va închide.");
        process.exit(1); 
    }

    let continutString = fs.readFileSync(caleJson, 'utf8');

    // BONUS 6: Proprietate duplicată pe string
    let blocuri = continutString.split('{');
    for (let bloc of blocuri) {
        let interiorObiect = bloc.split('}')[0];
        let chei = [...interiorObiect.matchAll(/"([^"]+)"\s*:/g)].map(match => match[1]);
        let cheiUnice = new Set(chei);
        if (chei.length !== cheiUnice.size) {
            console.error(`[EROARE JSON] S-a găsit o proprietate duplicată în același obiect! Cheile găsite: ${chei.join(', ')}`);
        }
    }

    let obErori;
    try {
        obErori = JSON.parse(continutString);
    } catch (e) {
        console.error("[EROARE FATALĂ] Fișierul erori.json nu are un format JSON valid.");
        process.exit(1);
    }

    // BONUS 2: Lipsesc proprietățile principale
    if (!obErori.info_erori || !obErori.cale_baza || !obErori.eroare_default) {
        console.error("[EROARE JSON] Lipsesc proprietăți esențiale (info_erori, cale_baza sau eroare_default)!");
    }

    // BONUS 3: Eroare_default nu are titlu, text sau imagine
    if (obErori.eroare_default) {
        if (!obErori.eroare_default.titlu || !obErori.eroare_default.text || !obErori.eroare_default.imagine) {
            console.error("[EROARE JSON] Obiectul eroare_default este incomplet (lipsește titlu, text sau imagine).");
        }
    }

    // BONUS 4: Folderul din "cale_baza" nu există fizic
    if (obErori.cale_baza) {
        let caleFolderImagini = path.join(__dirname, obErori.cale_baza);
        if (!fs.existsSync(caleFolderImagini)) {
            console.error(`[EROARE FOLDER] Folderul specificat la cale_baza nu există: ${caleFolderImagini}`);
        }
    }

    // BONUS 5: Fișierele imagine nu există fizic & BONUS 7: Identificatori duplicați
    if (obErori.info_erori && Array.isArray(obErori.info_erori)) {
        let iduriGasite = new Set();
        let iduriDuplicate = new Set();

        for (let eroare of obErori.info_erori) {
            
            let caleImagine = path.join(__dirname, obErori.cale_baza, eroare.imagine);
            if (!fs.existsSync(caleImagine)) {
                console.error(`[EROARE IMAGINE] Imaginea asociată erorii ${eroare.identificator} nu a fost găsită: ${caleImagine}`);
            }

            if (iduriGasite.has(eroare.identificator)) {
                iduriDuplicate.add(eroare.identificator);
                console.error(`[EROARE DUPLICAT] S-a găsit un identificator duplicat: ${eroare.identificator}. Proprietățile ei sunt: Titlu="${eroare.titlu}", Text="${eroare.text}", Imagine="${eroare.imagine}"`);
            } else {
                iduriGasite.add(eroare.identificator);
            }
        }
    }
}
verificareDateJSON();



function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, 'resurse/json/erori.json'), 'utf8');
    obGlobal.obErori = JSON.parse(continut);
    
    obGlobal.obErori.eroare_default.imagine = obGlobal.obErori.cale_baza + '/' + obGlobal.obErori.eroare_default.imagine;

    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = obGlobal.obErori.cale_baza + '/' + eroare.imagine;
    }
}
initErori(); 

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    let caleAbsMic=path.join(caleAbs, "mic");
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini) {
        
        let numeOriginal = imag.fisier; 
        let [numeFis, ext] = numeOriginal.split("."); 
        
        // Calea absolută a fișierului original
        let caleFisAbs = path.join(caleAbs, numeOriginal);
        
        // Căile unde va salva sharp pozele noi
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");

        
        if (!fs.existsSync(caleFisMediuAbs)) {
            sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        }
        if (!fs.existsSync(caleFisMicAbs)) {
            sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs);
        }

        
        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp");
        imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp");
        imag.fisier = path.join("/", caleGalerie, numeOriginal);
    }
    // console.log(obGlobal.obImagini)
}
initImagini();

function verificaDateGalerie() {
    // 1. Calea către fișierul tău JSON (ajustează dacă e în alt folder)
    const caleJson = path.join(__dirname, 'resurse', 'json', 'galerie.json');

    // Verificăm dacă măcar JSON-ul în sine există
    if (!fs.existsSync(caleJson)) {
        console.error(`[Eroare Critică] Fișierul JSON nu a fost găsit la calea: ${caleJson}`);
        process.exit(1);
    }

    try {
        
        const dateRaw = fs.readFileSync(caleJson, 'utf8');
        const obiectJSON = JSON.parse(dateRaw);

        
        const caleFolderJson = obiectJSON.cale_galerie;
        const folderAbsolut = path.join(__dirname, caleFolderJson);

        
        if (!fs.existsSync(folderAbsolut)) {
            console.error(`[Eroare Galerie] Folderul specificat în "cale_galerie" ("${caleFolderJson}") NU există fizic în sistemul de fișiere! Te rog să verifici numele folderului sau să îl creezi.`);
            process.exit(1);
        }

        if (obiectJSON.imagini && Array.isArray(obiectJSON.imagini)) {
            obiectJSON.imagini.forEach(imagine => {
                const numePoza = imagine.fisier; 
                
                const calePozaAbsoluta = path.join(folderAbsolut, numePoza);

                if (!fs.existsSync(calePozaAbsoluta)) {
                    console.error(`[Eroare Galerie] Imaginea "${numePoza}" din folderul "${caleFolderJson}" este specificată în JSON, dar NU există fizic pe disc! Verifică extensia sau numele fișierului.`);
                    process.exit(1);
                }
            });
            console.log("Verificarea galeriei a fost finalizată cu succes (folder și fișiere prezente).");
        } else {
            console.error("[Eroare Galerie] Nu a fost găsit array-ul 'imagini' în fișierul JSON.");
            process.exit(1);
        }

    } catch (err) {
        console.error("[Eroare Galerie] A apărut o problemă la citirea sau parsarea fișierului JSON:", err.message);
        process.exit(1);
    }
}
verificaDateGalerie();

function getImaginiFiltrate() {
    
    let dataCurenta = new Date();
    
    // dataCurenta.setMonth(0);  
    // dataCurenta.setMonth(6);  
    //dataCurenta.setMonth(10); 
    
    let luna = dataCurenta.getMonth(); 
    let anotimpCurent;

    // 3. Logica anotimpurilor
    if (luna == 11 || luna == 0 || luna == 1) { // Decembrie, Ianuarie, Februarie
        anotimpCurent = "iarna";
    } else if (luna >= 2 && luna <= 4) {         // Martie, Aprilie, Mai
        anotimpCurent = "primavara";
    } else if (luna >= 5 && luna <= 7) {         // Iunie, Iulie, August
        anotimpCurent = "vara";
    } else {                                     // Septembrie, Octombrie, Noiembrie
        anotimpCurent = "toamna";
    }

    
    let imaginiFiltrare = obGlobal.obImagini.imagini.filter(img => {
        return img.anotimp === anotimpCurent || img.anotimp === "toate";
    });

    
    return imaginiFiltrare.slice(0, 10);
}

function generareGalerieAnimata() {
    
    const puteri = [2, 4, 8];
    const nrImagini = puteri[Math.floor(Math.random() * puteri.length)];

    
    let imaginiPare = obGlobal.obImagini.imagini.filter((img, index) => index % 2 === 0);
    
    
    let imaginiSelectate = imaginiPare.slice(0, nrImagini);
    
    
    let n = imaginiSelectate.length;

    
    let scssContent = `
        $nr-imagini: ${n};
        $time-per-image: 3s;
        $total-time: $nr-imagini * $time-per-image;
        $p-vizibil: 100% / $nr-imagini;
        $p-tranzitie: 5%;

        #galerie-animata {
            position: relative;
            width: 100%;
            max-width: 800px;
            height: 450px;
            margin: 40px auto;
            overflow: hidden;
            
            
            border: 20px solid red;
            border-image: url('/resurse/imagini/rama.jpg') 30 round; /* Pune o poză de border aici */

            
            &:hover figure {
                animation-play-state: paused;
            }

            figure {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                margin: 0;
                animation: anim-galerie #{$total-time} linear infinite;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                figcaption {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    text-align: center;
                    padding: 10px;
                }
            }

            
            @for $i from 1 through $nr-imagini {
                figure:nth-child(#{$i}) {
                    animation-delay: #{($i - 1) * $time-per-image};
                }
            }
        }

        
        @keyframes anim-galerie {
            0% {
                z-index: 10;
                opacity: 1;
                /* Imagine completă */
                clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 50%, 100% 50%, 100% 100%, 0 100%);
            }
            #{ $p-vizibil - $p-tranzitie } {
                z-index: 10;
                opacity: 1;
                clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 50%, 100% 50%, 100% 100%, 0 100%);
            }
            #{ $p-vizibil } {
                z-index: 10;
                opacity: 1;
                /* Imagine tăiată la maxim (rămân doar 2 dungi invizibile sus/jos) */
                clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0%, 0 100%, 100% 100%, 100% 100%, 0 100%);
            }
            #{ $p-vizibil + 0.001% } {
                z-index: 1; 
                opacity: 0; 
                /* Se ascunde tăcut în spate și își reface forma */
                clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%, 0 50%, 100% 50%, 100% 100%, 0 100%); 
            }
            #{ 100% - $p-tranzitie } {
                z-index: 1;
                opacity: 0;
            }
            #{ 100% - $p-tranzitie + 0.001% } {
                z-index: 9; /* Se pregătește chiar sub imaginea curentă */
                opacity: 1;
            }
            100% {
                z-index: 9;
                opacity: 1;
            }
        }

        /* Ascundem pe ecrane medii și mici */
        @media screen and (max-width: 1100px) {
            #galerie-animata {
                display: none;
            }
        }
    `;

    // 4. Compilăm string-ul SCSS și îl scriem într-un fișier fizic
    try {
        let scssCompiled = sass.compileString(scssContent);
        fs.writeFileSync(path.join(__dirname, 'resurse/css/galerie_animata.css'), scssCompiled.css);
    } catch (err) {
        console.log("Eroare la generarea galeriei animate:", err);
    }

    return imaginiSelectate;
}

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroareGasita = obGlobal.obErori.info_erori.find(err => err.identificator == identificator)
    let eroareDefault = obGlobal.obErori.eroare_default;

    if (eroareGasita.status) {
        res.status(identificator);
    }

    res.render('pagini/eroare', {
        titlu: titlu || eroareGasita?.titlu || eroareDefault.titlu,
        text: text || eroareGasita?.text || eroareDefault.text,
        imagine: imagine || eroareGasita?.imagine || eroareDefault.imagine
    });
}
// ========================================================

//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.use('/resurse', express.static(path.join(__dirname, 'resurse')));
app.use('/dist', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));


app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'resurse', 'imagini', 'favicon.ico'));
});

app.get(['/', '/index', '/home'], (req, res) => {
    res.render('pagini/index', { 
        ip: req.ip,
        imagini: obGlobal.obImagini.imagini,
        imagini_animate: generareGalerieAnimata()
    }); 
});


app.get("/*pagina", (req, res) => {

    if(req.url.startsWith('/resurse') && path.extname(req.url) == ''){
        afisareEroare(res, 403);
        return;
    }

    if(req.url.endsWith('.ejs')){
        afisareEroare(res, 400);
        return;
    }

    try{
        res.render(`pagini/${req.url.substring(1)}`, { ip: req.ip }, function(err, htmlRandat) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                }
                afisareEroare(res);
            }
            res.send(htmlRandat);
        });
    }
    catch(erroare){
        if(erroare.message.includes("Cannot find module")){
            return afisareEroare(res, 404);
        }
        afisareEroare(res);
    };
});


app.listen(8080, () => {
    console.log("Serverul rulează pe http://localhost:8080");
});