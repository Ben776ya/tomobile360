# Guide d'Importation de Voitures

Ce guide explique comment importer des données de voitures depuis vroom.be ou d'autres sources dans votre site Tomobile 360.

## 🎯 Vue d'ensemble

Vous disposez de 3 méthodes pour importer des données de voitures:

1. **Scraper Browser** (Recommandé pour vroom.be)
2. **Import CSV** (Pour données manuelles)
3. **Import JSON** (Pour données structurées)

---

## Méthode 1: Scraper Browser pour vroom.be

### Étape 1: Accéder au site source
1. Ouvrez https://www.vroom.be/fr/showroom dans Chrome/Firefox/Edge
2. Faites défiler la page pour charger toutes les voitures
3. Appuyez sur **F12** pour ouvrir la console développeur

### Étape 2: Exécuter le scraper
1. Ouvrez le fichier `vroom-scraper.js` (dans le dossier du projet)
2. Copiez tout le contenu du fichier
3. Collez-le dans la console du navigateur
4. Appuyez sur **Entrée**

### Étape 3: Télécharger les données
- Le script va automatiquement:
  - Extraire toutes les voitures visibles
  - Afficher un aperçu dans la console
  - Télécharger un fichier JSON `vroom-cars-[timestamp].json`

### Étape 4: Importer dans votre site
1. Allez sur **http://localhost:3003/admin/import-cars**
2. Cliquez sur la zone de téléchargement
3. Sélectionnez le fichier JSON téléchargé
4. Cliquez sur "Importer les voitures"

---

## Méthode 2: Import CSV Manuel

### Format CSV Requis

Voici un exemple de fichier CSV:

```csv
brand,model,year,price_min,fuel_type,transmission,horsepower,seating_capacity
Dacia,Sandero,2024,89900,Essence,Manual,90,5
Toyota,Corolla,2024,189000,Hybrid,Automatic,140,5
Peugeot,208,2024,149000,Essence,Manual,100,5
Renault,Clio,2024,139000,Essence,Manual,90,5
Hyundai,i20,2024,129000,Essence,Manual,84,5
```

### Colonnes Disponibles

#### **Colonnes Obligatoires:**
- `brand` - Marque (ex: Dacia, Toyota, Peugeot)
- `model` - Modèle (ex: Sandero, Corolla, 208)
- `year` - Année (ex: 2024)

#### **Colonnes Optionnelles - Prix:**
- `price_min` - Prix minimum en MAD
- `price_max` - Prix maximum en MAD

#### **Colonnes Optionnelles - Technique:**
- `version` - Version/Finition
- `fuel_type` - Type de carburant: `Essence`, `Diesel`, `Hybrid`, `Electric`, `PHEV`
- `transmission` - Transmission: `Manual`, `Automatic`, `CVT`, `DCT`
- `engine_size` - Cylindrée en litres (ex: 1.2, 1.5)
- `cylinders` - Nombre de cylindres
- `horsepower` - Puissance en chevaux
- `torque` - Couple en Nm
- `acceleration` - 0-100 km/h en secondes
- `top_speed` - Vitesse maximale en km/h

#### **Colonnes Optionnelles - Consommation:**
- `fuel_consumption_city` - Consommation ville (L/100km)
- `fuel_consumption_highway` - Consommation route (L/100km)
- `fuel_consumption_combined` - Consommation mixte (L/100km)
- `co2_emissions` - Émissions CO2 (g/km)

#### **Colonnes Optionnelles - Dimensions:**
- `cargo_capacity` - Capacité coffre (litres)
- `seating_capacity` - Nombre de places

#### **Colonnes Optionnelles - Statut:**
- `is_available` - Disponible: `true` ou `false`
- `is_popular` - Populaire: `true` ou `false`
- `is_new_release` - Nouveauté: `true` ou `false`
- `is_coming_soon` - Bientôt disponible: `true` ou `false`

### Comment créer votre CSV:
1. Ouvrez Excel ou Google Sheets
2. Créez les colonnes ci-dessus
3. Remplissez les données
4. Exportez en CSV (UTF-8)
5. Importez sur http://localhost:3003/admin/import-cars

---

## Méthode 3: Import JSON

### Format JSON Requis

```json
[
  {
    "brand": "Dacia",
    "model": "Sandero",
    "version": "Stepway",
    "year": 2024,
    "price_min": 89900,
    "price_max": 120000,
    "fuel_type": "Essence",
    "transmission": "Manual",
    "engine_size": 1.0,
    "horsepower": 90,
    "torque": 160,
    "acceleration": 11.9,
    "top_speed": 180,
    "fuel_consumption_combined": 5.2,
    "co2_emissions": 118,
    "seating_capacity": 5,
    "cargo_capacity": 320,
    "features": [
      "Climatisation",
      "Écran tactile",
      "Caméra de recul"
    ],
    "safety_features": [
      "ABS",
      "ESP",
      "Airbags"
    ],
    "images": [
      "https://example.com/sandero-1.jpg",
      "https://example.com/sandero-2.jpg"
    ],
    "is_available": true,
    "is_popular": true,
    "is_new_release": true
  },
  {
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2024,
    "price_min": 189000,
    "fuel_type": "Hybrid",
    "transmission": "Automatic",
    "horsepower": 140,
    "seating_capacity": 5,
    "is_available": true
  }
]
```

---

## 🚀 Processus d'Importation

### Ce qui se passe lors de l'import:

1. **Validation** - Vérifie que chaque voiture a au minimum: marque, modèle, année
2. **Normalisation** - Standardise les noms de marques (ex: "vw" → "Volkswagen")
3. **Création de marques** - Crée automatiquement les marques manquantes
4. **Création de modèles** - Crée automatiquement les modèles manquants
5. **Détection de doublons** - Ignore les voitures déjà présentes
6. **Insertion** - Ajoute les nouvelles voitures à la base de données

### Résultats possibles:

- **Importées** ✓ - Nouvelles voitures ajoutées avec succès
- **Ignorées** ⊘ - Voitures déjà présentes dans la base
- **Échouées** ✕ - Voitures avec erreurs de validation

---

## 📊 Après l'Import

### Vérifier les données:

1. Allez sur **http://localhost:3003/neuf**
2. Vérifiez que les voitures apparaissent
3. Testez les filtres (marque, prix, type)
4. Cliquez sur une voiture pour voir les détails

### Statistiques:

Sur la page d'import, vous verrez:
- **Véhicules** - Nombre total de voitures
- **Marques** - Nombre de marques différentes
- **Modèles** - Nombre de modèles différents

---

## ⚠️ Résolution de Problèmes

### Erreur: "Brand is required"
- La colonne `brand` est vide ou manquante
- Vérifiez que chaque ligne a une marque

### Erreur: "Model is required"
- La colonne `model` est vide ou manquante
- Vérifiez que chaque ligne a un modèle

### Erreur: "Valid year is required"
- L'année est invalide (< 1900 ou > 2026)
- Vérifiez le format de l'année (nombre entier)

### Erreur: "Invalid fuel type"
- Type de carburant non reconnu
- Utilisez: `Essence`, `Diesel`, `Hybrid`, `Electric`, ou `PHEV`

### Erreur: "Invalid transmission type"
- Type de transmission non reconnu
- Utilisez: `Manual`, `Automatic`, `CVT`, ou `DCT`

### Aucune voiture trouvée
- Le fichier est vide ou mal formaté
- Vérifiez le format CSV/JSON
- Assurez-vous d'avoir les colonnes obligatoires

---

## 💡 Conseils

1. **Commencez petit** - Testez avec 5-10 voitures d'abord
2. **Vérifiez le format** - Utilisez les exemples fournis
3. **Nettoyez les données** - Supprimez les caractères spéciaux dans les noms
4. **Standardisez les prix** - En MAD (Dirhams Marocains)
5. **Images** - Utilisez des URLs complètes et valides
6. **Backup** - Sauvegardez vos données avant import massif

---

## 📝 Exemple Complet

### Fichier CSV d'exemple (sample-cars.csv)

Voir le fichier `sample-cars.csv` dans le dossier du projet.

### Commandes utiles:

```bash
# Voir les voitures importées dans Supabase
# Allez dans Supabase Dashboard > Table Editor > vehicles_new

# Supprimer toutes les voitures (si besoin de recommencer)
# ⚠️ ATTENTION: Ceci supprime TOUTES les données!
# DELETE FROM vehicles_new;
```

---

## 🎯 Workflow Recommandé

Pour importer depuis vroom.be:

1. ✅ Ouvrir vroom.be dans le navigateur
2. ✅ Exécuter le script scraper (vroom-scraper.js)
3. ✅ Télécharger le fichier JSON généré
4. ✅ Aller sur /admin/import-cars
5. ✅ Uploader le JSON
6. ✅ Cliquer sur "Importer"
7. ✅ Vérifier les résultats
8. ✅ Visiter /neuf pour voir les voitures

---

## 📚 Ressources

- **Admin Import**: http://localhost:3003/admin/import-cars
- **Voitures Neuves**: http://localhost:3003/neuf
- **Vroom.be**: https://www.vroom.be/fr/showroom
- **Script Scraper**: `vroom-scraper.js`
- **CSV Exemple**: `sample-cars.csv`

---

Bonne importation! 🚗💨
