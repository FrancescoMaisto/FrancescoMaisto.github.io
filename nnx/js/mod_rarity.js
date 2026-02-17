// Utility to fetch and cache mod rarity data
window.modRarityData = null;
function loadModRarity() {
    if (window.modRarityData) return Promise.resolve(window.modRarityData);
    return fetch('data/mod_rarity.json')
        .then(function(res) {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(function(data) {
            window.modRarityData = Array.isArray(data) ? data : [];
            return window.modRarityData;
        })
        .catch(function(err) {
            console.error('Failed to load mod rarity data:', err);
            window.modRarityData = [];
            return [];
        });
}

// Pick a mod rarity based on probability
function pickRandomModRarity(rarities) {
    var r = Math.random();
    var sum = 0;
    for (var i = 0; i < rarities.length; i++) {
        sum += rarities[i].probability;
        if (r < sum) return rarities[i];
    }
    // fallback: return last
    return rarities[rarities.length - 1];
}
