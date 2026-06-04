DROP TYPE IF EXISTS tip_caroserie;
DROP TYPE IF EXISTS stare_masina;

-- 1. Creăm enumerația pentru Categoria Mare (maxim 5 valori conform cerinței)
CREATE TYPE tip_caroserie AS ENUM ('Sedan', 'SUV', 'Hatchback', 'Coupe', 'Cabrio');
CREATE TYPE stare_masina AS ENUM ('Noaua', 'Rulata', 'Clasică');
-- 2. Creăm tabelul de produse (mașini)
CREATE TABLE IF NOT EXISTS masini (
    id SERIAL PRIMARY KEY,                                      -- Identificator unic numeric
    nume VARCHAR(100) NOT NULL,                                 -- Numele mașinii
    descriere TEXT,                                             -- Descriere detaliată
    imagine VARCHAR(255),                                       -- Calea către imagine (ex: /resurse/imagini/...)
    categorie tip_caroserie NOT NULL,                           -- Categoria mare (folosește ENUM-ul de sus)
    stare_masina VARCHAR(50),                                   -- Mod categorizare secundar (Noua, Rulata, Clasica)
    pret NUMERIC(10, 2) NOT NULL,                               -- Caracteristica numerică 1 (Preț)
    putere_cp INTEGER NOT NULL,                                 -- Caracteristica numerică 2 (Cai Putere)
	nr_km INTEGER NOT NULL,										-- Caracteristica numerica 3
    data_adaugare DATE DEFAULT CURRENT_DATE,                    -- Caracteristica de tip Date
    combustibil VARCHAR(50),                                    -- Caracteristică cu o singură valoare (Benzina/Diesel/etc)
    dotari TEXT,                                                -- Caracteristică multiplă (separate prin virgulă)
    inmatriculata BOOLEAN DEFAULT FALSE,                      -- Caracteristică booleană
    folder_imagini TEXT
);

INSERT INTO masini (nume, descriere, imagine, categorie, stare_masina, pret, putere_cp, nr_km, data_adaugare, combustibil, dotari, inmatriculata, folder_imagini) VALUES
('Dacia Logan', 'Masina ideala pentru familie, spatioasa si foarte economica pentru oras.', '/resurse/imagini/BD/logan.png', 'Sedan', 'Noua', 15000.00, 90, 25000, '2026-01-10', 'Benzina', 'aer condiționat, senzori parcare, bluetooth', true, 'logan'),
('Ford Kuga', 'SUV compact perfect pentru drumuri lungi si vacante in natura, tractiune integrala.', '/resurse/imagini/BD/kuga.png', 'SUV', 'Rulata', 24500.00, 150, 125000, '2025-11-15', 'Diesel', 'navigație, scaune încălzite, tracțiune 4x4, climatronic', false, 'kuga'),
('Volkswagen Golf 8', 'Hatchback-ul etalon, tehnologie de ultima generatie si tinuta de drum impecabila.', '/resurse/imagini/BD/golf8.png', 'Hatchback', 'Noua', 28000.00, 130, 15000, '2026-03-01', 'Hybrid', 'climatronic, faruri led, cockpit digital, cruise control', true, 'golf8'),
('Porsche 911 Carrera', 'Legenda sportiva germana, performante de top si design inconfundabil.', '/resurse/imagini/BD/porsche911.png', 'Coupe', 'Noua', 120000.00, 385, 8000, '2026-05-05', 'Benzina', 'scane piele, suspensie sport, evacuare activa, audio bose', true, 'porsche911'),
('Mazda MX-5 Miata', 'Cel mai bine vandut roadster din lume, placerea pura de a conduce cu plafonul coborat.', '/resurse/imagini/BD/miata.png', 'Cabrio', 'Rulata', 18500.00, 160, 85000, '2025-08-20', 'Benzina', 'interior piele, jante aliaj, sistem audio premium', false, 'miata'),
('Tesla Model Y', 'SUV complet electric, autonomie uriasa si acceleratie fulgeratoare.', '/resurse/imagini/BD/modely.png', 'SUV', 'Noua', 45000.00, 347, 42000, '2026-04-12', 'Electric', 'pilot automat, acoperiș panoramic, cameras 360, navigatie', true, 'modely'),
('BMW Seria 3', 'Sedan premium cu caracter sportiv accentuat si confort desavarsit.', '/resurse/imagini/BD/seria3.png', 'Sedan', 'Rulata', 32000.00, 190, 180000, '2025-12-05', 'Diesel', 'pachet m, faruri laser, senzori parcare, head-up display', false, 'seria3'),
('Renault Clio', 'Masina ideala de oras, usor de parcat si cu un consum extrem de redus.', '/resurse/imagini/BD/clio.png', 'Hatchback', 'Noua', 16500.00, 90, 15, '2026-02-18', 'Benzina', 'aer conditionat, senzori ploaie, camera spate', true, 'clio'),
('Audi A5 Cabriolet', 'Elegant si rafinat, decapotabila perfecta pentru faleza si zilele insorite.', '/resurse/imagini/BD/a5cabrio.png', 'Cabrio', 'Rulata', 38000.00, 204, 95000, '2025-07-30', 'Benzina', 'faruri matrix, piele nappa, încălzire în scaune, climatronic', false, 'a5cabrio'),
('Mercedes-Benz C-Coupe', 'Linii fluide si un interior luxos care intoarce toate privirile pe strada.', '/resurse/imagini/BD/ccoupe.png', 'Coupe', 'Rulata', 41000.00, 211, 110000, '2025-10-22', 'Benzina', 'pachet amg, trapă panoramică, interior piele, navigatie burmester', false, 'ccoupe'),
('Hyundai Tucson', 'Unul dintre cele mai populare SUV-uri, design futurist si tehnologie hibrida.', '/resurse/imagini/BD/tucson.png', 'SUV', 'Noua', 34000.00, 230, 38000, '2026-01-25', 'Hybrid', 'climatronic 3 zone, scaune ventilate, portbagaj electric', true, 'tucson'),
('Toyota Corolla', 'Cea mai fiabila masina din istorie, acum cu sistem hybrid ultra-eficient.', '/resurse/imagini/BD/corolla.png', 'Sedan', 'Noua', 26000.00, 140, 49500, '2026-04-02', 'Hybrid', 'toyota safety sense, camera marșalier, android auto', true, 'corolla'),
('Ford Mustang Fastback', 'Muscle car american pur, sunet de V8 inconfundabil si agresivitate vizuala.', '/resurse/imagini/BD/mustang.png', 'Coupe', 'Clasica', 55000.00, 450, 154000, '2025-05-14', 'Benzina', 'evacuare directă, jante custom, interior piele retro', false, 'mustang'),
('Mercedes-Benz W123', 'O adevarata masina clasica de colectie, cunoscuta pentru durabilitatea ei legendara.', '/resurse/imagini/BD/w123.png', 'Sedan', 'Clasica', 9500.00, 88, 450000, '1982-06-15', 'Diesel', 'interior catifea, trapă manuală, jante originale', false, 'w123'),
('Suzuki Vitara', 'SUV de buget mic, tractiune 4x4 robusta si costuri foarte mici de intretinere.', '/resurse/imagini/BD/vitara.png', 'SUV', 'Noua', 21000.00, 129, 25, '2026-03-20', 'Hybrid', 'tractiune 4x4, scaune încălzite, asistență coborâre pantă', true, 'vitara'),
('BMW Seria 3 E36', 'Legendara "Pisicuță", o masina clasica pentru pasionati care nu doar atrage priviri ci livreaza si putere', '/resurse/imagini/BD/e36.png', 'Coupe', 'Clasica', 7500.00, 192, 250000, '1998-07-27', 'Benzina', 'interior piele, pachet M, jante modulare', true, 'e36');