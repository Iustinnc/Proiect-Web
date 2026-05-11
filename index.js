const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const sass = require('sass');


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
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
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

function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroareGasita = obGlobal.obErori.info_erori.find(err => err.identificator == identificator);
    let eroareDefault = obGlobal.obErori.eroare_default;

    if (eroareGasita.status) {
        res.status(identificator);
    }

    res.render('pagini/eroare', {
        titlu: titlu || eroareGasita.titlu || eroareDefault.titlu,
        text: text || eroareGasita.text || eroareDefault.text,
        imagine: imagine || eroareGasita.imagine || eroareDefault.imagine
    });
}
// ========================================================

app.use('/resurse', express.static(path.join(__dirname, 'resurse')));


app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'resurse', 'imagini', 'favicon.ico'));
});

app.get(['/', '/index', '/home'], (req, res) => {
    res.render('pagini/index', { ip: req.ip }); 
});

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