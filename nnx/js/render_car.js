let lineSpeed = 60;

// Utility to fetch and cache mileage tiers
window.mileageTiers = null;
function loadMileageTiers() {
    if (window.mileageTiers) return Promise.resolve(window.mileageTiers);
    return fetch('data/mileage_tiers.json')
        .then(function(res) {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(function(data) {
            window.mileageTiers = Array.isArray(data) ? data : [];
            return window.mileageTiers;
        })
        .catch(function(err) {
            console.error('Failed to load mileage tiers:', err);
            window.mileageTiers = [];
            return [];
        });
}

/**
 * Implements a shuffle-bag (weighted random selection) algorithm.
 * Creates a pool where each color appears N times based on its weight,
 * then randomly selects one from the pool.
 * 
 * @param {Array} colorArray - Array of {color_name, weight} objects
 * @returns {string|null} - The selected color_name, or null if array is empty
 */
function pickWeightedRandomColor(colorArray) {
    // Handle empty or invalid input
    if (!colorArray || !Array.isArray(colorArray) || colorArray.length === 0) {
        return null;
    }
    
    // If only one color, return it immediately
    if (colorArray.length === 1) {
        return colorArray[0].color_name;
    }
    
    // Build the shuffle bag: add each color N times (N = weight)
    var bag = [];
    for (var i = 0; i < colorArray.length; i++) {
        var color = colorArray[i];
        var weight = color.weight || 1; // Default to 1 if weight is missing
        // Add the color name 'weight' times to the bag
        for (var w = 0; w < weight; w++) {
            bag.push(color.color_name);
        }
    }
    
    // Randomly pick an index from the bag
    var randomIndex = Math.floor(Math.random() * bag.length);
    return bag[randomIndex];
}

// Pick a mileage tier based on probability
function pickRandomMileageTier(tiers) {
    var r = Math.random();
    var sum = 0;
    for (var i = 0; i < tiers.length; i++) {
        sum += tiers[i].probability;
        if (r < sum) return tiers[i];
    }
    // fallback: return last
    return tiers[tiers.length - 1];
}

// Pick a random integer in [min, max]
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Render car information including mileage, condition, mods, power, price,
 * and randomly selected colors (exterior, trim, interior) using weighted selection.
 * 
 * Displays information line-by-line with a delay for visual effect.
 * 
 * @param {Object} car - Car object with exterior_colors, trim_color, interior_color arrays
 */
function renderCarInfo(car) {

    Promise.all([
        // Load mileage tiers and mod rarities in parallel
        loadMileageTiers(),
        (typeof loadModRarity === 'function' ? loadModRarity() : Promise.resolve([]))
    ]).then(function(results) {

        // Ensure container exists. If not, create it and insert after tier select
        var container = document.getElementById('car-display');
        if (!container) {
            container = document.createElement('div');
            container.id = 'car-display';
            var select = document.getElementById('tier-select');
            if (select && select.parentNode) select.parentNode.insertBefore(container, select.nextSibling);
            else document.body.appendChild(container);
        }

        // SAFETY CHECK
        if (!car) {
            container.textContent = 'No car available for the selected tier.';
            return;
        }

        // PICK COLORS using weighted shuffle-bag algorithm
        // Each color's weight determines how likely it is to be selected
        var exteriorColor = pickWeightedRandomColor(car.exterior_colors || []);
        var trimColor = pickWeightedRandomColor(car.trim_color || []);
        var interiorColor = pickWeightedRandomColor(car.interior_color || []);

        // MILEAGE & CONDITION
        var tiers = results[0];
        var modRarities = results[1];
        if (!tiers.length) return;
        var tier = pickRandomMileageTier(tiers);
        var mileage = randomInt(tier.mileageRange.min, tier.mileageRange.max);
        var condition = randomInt(tier.conditionRange.min, tier.conditionRange.max);

        // MODS
        var mods = randomInt(tier.modsRange.min, tier.modsRange.max);
        var modTotalPrice = 0;
        var modLines = [];
        if (mods > 0 && modRarities && modRarities.length) {
            for (var m = 0; m < mods; m++) {
                var rarity = pickRandomModRarity(modRarities);
                modTotalPrice += rarity.price;
                modLines.push('<strong>Mod ' + (m+1) + ':</strong> ' + rarity.name + ' ($' + numberWithCommas(rarity.price) + ')<br>');
            }
        }        

        // POWER        
        var powerReduction = 1.01 - Math.exp(0.0000099 * mileage)/100;
        var powerReductionPercent = (1-powerReduction)*-100;
        var power = car.power * powerReduction;

        // PRICE
        var priceReduction = 1 + 0.12 * (1 - Math.exp(0.000007 * mileage));
        var priceReductionPercent = (1-priceReduction)*-100;
        var price = car.price * priceReduction;
        var priceFinal = price + modTotalPrice;

        // RENDER ON SCREEN, line by line with delay
        // Start with model name and selected colors
        var lines = [
                '<br><span class="title">CAR</span><br>',
            '<strong>Model:</strong> ' + escapeHtml(car.name) + '<br>',
                '<br><span class="title">MILEAGE</span><br>',
            '<strong>Mileage:</strong> ' + numberWithCommas(mileage) + ' miles <br>',
            '<strong>Condition:</strong> ' + condition + '% <br>',
                '<br><span class="title">MODS</span><br>',
            '<strong>Number of Mods:</strong> ' + mods + '<br>'
        ].concat(modLines).concat([
                '<br><span class="title">POWER</span><br>',
            '<strong>Power (original):</strong> ' + car.power + ' HP<br>',
            '<strong>Power Reduction:</strong> ' + powerReductionPercent.toFixed(2) + '% <br>',
            '<strong>Power:</strong> ' + power.toFixed(2) + ' HP <br>',
                '<br><span class="title">COLORS</span><br>',
            '<strong>Exterior Color:</strong> ' + escapeHtml(exteriorColor || 'N/A') + '<br>',
            '<strong>Trim Color:</strong> ' + escapeHtml(trimColor || 'N/A') + '<br>',
            '<strong>Interior Color:</strong> ' + escapeHtml(interiorColor || 'N/A') + '<br>',
                '<br><span class="title">PRICE</span><br>',
            '<strong>Price (new, unmodified car):</strong> $ ' + numberWithCommas(car.price) + '<br>',
            '<strong>Mileage depreciation:</strong> ' + priceReductionPercent.toFixed(2) + '% <br>',
            '<strong>Price after depreciation:</strong> $ ' + numberWithCommas(price.toFixed(0)) + '<br>',
            '<strong>FINAL PRICE with mods:</strong> $ ' + numberWithCommas(priceFinal.toFixed(0)) + '<br>'
        ]);

        // RENDER ON CONSOLE, for debugging
        console.log('Rendering car:', car);
        console.log('Mileage Tier:', tier);
        console.log('Selected Colors - Exterior:', exteriorColor, 'Trim:', trimColor, 'Interior:', interiorColor);

        // Clear previous info
        var old = document.getElementById('mileage-info');
        if (old) old.remove();
        
        // Create new info div
        var infoDiv = document.createElement('div');
        infoDiv.id = 'mileage-info';
        container.appendChild(infoDiv);
        
        // SHOW LINES ONE BY ONE with delay for visual effect
        function showLine(i) {
            if (i >= lines.length) return;
            infoDiv.insertAdjacentHTML('beforeend', lines[i]);
            setTimeout(function() { showLine(i + 1); }, lineSpeed);
        }
        showLine(0);
    });
}