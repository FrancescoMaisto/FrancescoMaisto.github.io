console.log('NNX Random Car Generator - v.', 0.1);

// Store selected tier as an integer: A=1, B=2, C=3, D=4
// Expose `tier` on the window object so other scripts can use it.
// Default is 0 (none selected).
window.tier = 0;


// Holds loaded car data
window.carsData = [];

/**
 * Fetch cars from data file and store in `window.carsData`.
 */
function loadCars() {
    return fetch('data/cars.json')
        .then(function (res) {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(function (data) {
            window.carsData = Array.isArray(data) ? data : [];
        })
        .catch(function (err) {
            console.error('Failed to load car data:', err);
            window.carsData = [];
        });
}

/**
 * Pick a random car object for the given tier integer.
 * @param {number} tierInt
 * @returns {object|null}
 */
function pickRandomCarForTier(tierInt) {
    if (!tierInt) return null;
    var matches = window.carsData.filter(function (c) { return c.tier === tierInt; });
    if (!matches.length) return null;
    var idx = Math.floor(Math.random() * matches.length);
    return matches[idx];
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"'`]/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#96;'
        }[m];
    });
}

/**
 * Map tier letter to integer value.
 * @param {string} letter - One of 'A','B','C','D'
 * @returns {number} integer value for tier or 0 for invalid
 */
function tierLetterToInt(letter) {
    switch (letter) {
        case 'A': return 1;
        case 'B': return 2;
        case 'C': return 3;
        case 'D': return 4;
        default: return 0;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var select = document.getElementById('tier-select');
    if (!select) return;

    // initialize if a value is preselected
    if (select.value) {
        window.tier = tierLetterToInt(select.value);
    }

    // Ensure cars are loaded, then listen for changes
    loadCars().then(function () {
        select.addEventListener('change', function (e) {
            var val = e.target.value;
            window.tier = tierLetterToInt(val);
            console.log('Selected tier:', val, '->', window.tier);
            var car = pickRandomCarForTier(window.tier);
            renderCarInfo(car);
        });

        // If a tier was preselected, render a car immediately
        if (window.tier) {
            var car = pickRandomCarForTier(window.tier);
            renderCarInfo(car);
        }
    });
});