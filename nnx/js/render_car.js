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

// Render mileage/condition/mods info
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
                modLines.push('<strong>Mod ' + (m+1) + ':</strong> ' + rarity.rarity + ' ($' + numberWithCommas(rarity.price) + ')<br>');
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
        var lines = [
            '<br><strong>MODEL:</strong> ' + escapeHtml(car.name) + '<br><br>',
            '<strong>Mileage:</strong> ' + numberWithCommas(mileage) + ' miles <br>',
            '<strong>Condition:</strong> ' + condition + '% <br><br>',
            '<strong>Number of Mods:</strong> ' + mods + '<br>'
        ].concat(modLines).concat([
            '<br><strong>Power (original):</strong> ' + car.power + ' HP<br>',
            '<strong>Power Reduction:</strong> ' + powerReductionPercent.toFixed(2) + '% <br>',
            '<strong>Power:</strong> ' + power.toFixed(2) + ' HP <br><br>',
            '<strong>Price (new, unmodified car):</strong> $ ' + numberWithCommas(car.price) + '<br>',
            '<strong>Mileage depreciation:</strong> ' + priceReductionPercent.toFixed(2) + '% <br>',
            '<strong>Price after depreciation:</strong> $ ' + numberWithCommas(price.toFixed(0)) + '<br>',
            '<strong>FINAL PRICE (with mods):</strong> $ ' + numberWithCommas(priceFinal.toFixed(0)) + '<br>'
        ]);

        // RENDER ON CONSOLE, for debugging
        console.log('Rendering car:', car);
        console.log('Mileage Tier:', tier);

        // Clear previous info
        var old = document.getElementById('mileage-info');
        if (old) old.remove();
        
        // Create new info div
        var infoDiv = document.createElement('div');
        infoDiv.id = 'mileage-info';
        container.appendChild(infoDiv);
        
        // SHOW LINES ONE BY ONE
        function showLine(i) {
            if (i >= lines.length) return;
            infoDiv.insertAdjacentHTML('beforeend', lines[i]);
            setTimeout(function() { showLine(i + 1); }, lineSpeed);
        }
        showLine(0);
    });
}