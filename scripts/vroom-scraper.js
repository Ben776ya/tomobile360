// Vroom.be Car Data Scraper
// Run this script in your browser console while on https://www.vroom.be/fr/showroom

/**
 * INSTRUCTIONS:
 * 1. Open https://www.vroom.be/fr/showroom in your browser
 * 2. Scroll down to load all cars (if lazy loading)
 * 3. Open browser console (F12)
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 6. The script will extract car data and download a JSON file
 * 7. Upload that JSON file to the import page
 */

(function() {
  console.log('Starting vroom.be car data extraction...');

  const cars = [];

  // Try to find car elements - adjust selectors based on actual site structure
  const carElements = document.querySelectorAll('.car-item, .vehicle-card, .product-card, .car-listing, article');

  console.log(`Found ${carElements.length} potential car elements`);

  carElements.forEach((element, index) => {
    try {
      // Extract data - adjust selectors based on actual HTML structure
      const brand = element.querySelector('.brand, .car-brand, [class*="brand"]')?.textContent?.trim() || '';
      const model = element.querySelector('.model, .car-model, [class*="model"]')?.textContent?.trim() || '';
      const priceText = element.querySelector('.price, .car-price, [class*="price"]')?.textContent?.trim() || '0';
      const year = element.querySelector('.year, .car-year, [class*="year"]')?.textContent?.trim() || new Date().getFullYear().toString();

      // Extract price (remove non-numeric characters except dots)
      const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

      // Extract image
      const image = element.querySelector('img')?.src || '';

      // Extract other specs if available
      const fuelType = element.querySelector('[class*="fuel"], [class*="carburant"]')?.textContent?.trim() || '';
      const transmission = element.querySelector('[class*="transmission"], [class*="gearbox"]')?.textContent?.trim() || '';
      const horsepower = element.querySelector('[class*="power"], [class*="ch"], [class*="hp"]')?.textContent?.trim() || '';

      // Only add if we have at least brand and model
      if (brand && model) {
        cars.push({
          brand: brand,
          model: model,
          year: parseInt(year) || new Date().getFullYear(),
          price_min: price,
          fuel_type: mapFuelType(fuelType),
          transmission: mapTransmission(transmission),
          horsepower: parseInt(horsepower) || null,
          images: image ? [image] : [],
          is_available: true,
          is_new_release: true
        });
      }
    } catch (error) {
      console.error(`Error extracting car ${index}:`, error);
    }
  });

  // Helper functions
  function mapFuelType(fuel) {
    const f = fuel.toLowerCase();
    if (f.includes('essence') || f.includes('petrol') || f.includes('gasoline')) return 'Essence';
    if (f.includes('diesel')) return 'Diesel';
    if (f.includes('hybrid') || f.includes('hybride')) return 'Hybrid';
    if (f.includes('electric') || f.includes('électrique')) return 'Electric';
    if (f.includes('phev') || f.includes('plug')) return 'PHEV';
    return null;
  }

  function mapTransmission(trans) {
    const t = trans.toLowerCase();
    if (t.includes('manual') || t.includes('manuelle')) return 'Manual';
    if (t.includes('automatic') || t.includes('automatique')) return 'Automatic';
    if (t.includes('cvt')) return 'CVT';
    if (t.includes('dct')) return 'DCT';
    return null;
  }

  console.log(`Extracted ${cars.length} cars`);

  if (cars.length === 0) {
    console.error('No cars found! Please check the HTML structure and adjust selectors.');
    console.log('Inspecting first element:', carElements[0]);
    return;
  }

  // Show preview
  console.log('Preview of first 3 cars:');
  console.table(cars.slice(0, 3));

  // Download JSON file
  const json = JSON.stringify(cars, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vroom-cars-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ JSON file downloaded! Upload it to the import page.');

  return cars;
})();
