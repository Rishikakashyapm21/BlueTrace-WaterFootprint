document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculateForm');
    const resultsSection = document.getElementById('results');

    // Water footprint data (liters per kg)
    const cropData = {
        wheat: { base: 1300, drip: 0.85, sprinkler: 1.0, flood: 1.2 },
        rice: { base: 2500, drip: 0.9, sprinkler: 1.1, flood: 1.3 },
        corn: { base: 900, drip: 0.8, sprinkler: 0.95, flood: 1.15 },
        cotton: { base: 8000, drip: 0.75, sprinkler: 0.9, flood: 1.1 },
        sugarcane: { base: 150, drip: 0.7, sprinkler: 0.85, flood: 1.05 }
    };

    // Climate factors
    const climateFactors = {
        rainfall: {
            low: 1.2,    // <300mm
            medium: 1.0, // 300-800mm
            high: 0.8    // >800mm
        },
        temperature: {
            cool: 0.9,  // <20°C
            moderate: 1.0, // 20-30°C
            hot: 1.15    // >30°C
        }
    };

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateWaterFootprint();
    });

    function calculateWaterFootprint() {
        // Get form values
        const cropType = document.getElementById('cropType').value;
        const area = parseFloat(document.getElementById('area').value);
        const yieldVal = parseFloat(document.getElementById('yield').value);
        const irrigationMethod = document.querySelector('input[name="irrigation"]:checked').value;
        const rainfall = parseFloat(document.getElementById('rainfall').value);
        const temperature = parseFloat(document.getElementById('temperature').value);

        // Calculate climate factors
        const rainfallFactor = getRainfallFactor(rainfall);
        const tempFactor = getTemperatureFactor(temperature);

        // Calculate total water usage
        const baseWaterPerKg = cropData[cropType].base;
        const irrigationFactor = cropData[cropType][irrigationMethod];
        const adjustedWaterPerKg = baseWaterPerKg * irrigationFactor * rainfallFactor * tempFactor;
        
        const totalWater = adjustedWaterPerKg * yieldVal;
        const waterFootprint = adjustedWaterPerKg;

        // Display results
        document.getElementById('totalWater').textContent = totalWater.toLocaleString();
        document.getElementById('waterFootprint').textContent = waterFootprint.toLocaleString();
        
        // Generate recommendations
        generateRecommendations(cropType, irrigationMethod, waterFootprint);
        
        // Show results
        resultsSection.classList.remove('d-none');
    }

    function getRainfallFactor(rainfall) {
        if (rainfall < 300) return climateFactors.rainfall.low;
        if (rainfall > 800) return climateFactors.rainfall.high;
        return climateFactors.rainfall.medium;
    }

    function getTemperatureFactor(temperature) {
        if (temperature < 20) return climateFactors.temperature.cool;
        if (temperature > 30) return climateFactors.temperature.hot;
        return climateFactors.temperature.moderate;
    }

    function generateRecommendations(cropType, irrigationMethod, footprint) {
        const recommendations = [];
        const list = document.getElementById('recommendations');
        list.innerHTML = '';

        // General recommendations
        if (irrigationMethod !== 'drip') {
            recommendations.push("Consider switching to drip irrigation to reduce water usage by 15-25%");
        }

        if (footprint > cropData[cropType].base * 1.1) {
            recommendations.push("Your water footprint is higher than average for this crop. Check for leaks or inefficient water distribution.");
        }

        // Crop-specific recommendations
        if (cropType === 'rice' && irrigationMethod === 'flood') {
            recommendations.push("For rice, consider alternate wetting and drying (AWD) technique to reduce water use while maintaining yield");
        }

        if (cropType === 'cotton') {
            recommendations.push("Cotton is a water-intensive crop. Consider implementing soil moisture monitoring for optimal irrigation scheduling");
        }

        // Fallback if no specific recommendations
        if (recommendations.length === 0) {
            recommendations.push("Your current practices are efficient. Monitor soil moisture for further optimization opportunities");
        }

        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.className = 'recommendation-item';
            li.textContent = rec;
            list.appendChild(li);
        });
    }
});
