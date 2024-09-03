const countries = {
    'israel': {
        name: 'ישראל',
        cities: [
            { name: 'תל אביב', value: 'tel-aviv', lat: 32.0853, lon: 34.7818 },
            { name: 'ירושלים', value: 'jerusalem', lat: 31.7683, lon: 35.2137 },
            { name: 'חיפה', value: 'haifa', lat: 32.7940, lon: 34.9896 },
            { name: 'באר שבע', value: 'beer-sheva', lat: 31.2524, lon: 34.7915 },
            { name: 'אילת', value: 'eilat', lat: 29.5581, lon: 34.9482 },
            { name: 'אשדוד', value: 'ashdod', lat: 31.8040, lon: 34.6581 },
            { name: 'נתניה', value: 'netanya', lat: 32.3215, lon: 34.8532 },
            { name: 'רמת גן', value: 'ramat-gan', lat: 32.0684, lon: 34.8248 },
            { name: 'חולון', value: 'holon', lat: 32.0154, lon: 34.7792 },
            { name: 'פתח תקווה', value: 'petah-tikva', lat: 32.0868, lon: 34.8870 },
            { name: 'ערד', value: 'arad', lat: 31.2588, lon: 35.2128 }
        ]
    },
    'neighborhood': {
        name: 'מדינות בשכונה',
        cities: [
            { name: 'עזה', value: 'gaza', lat: 31.5017, lon: 34.4668 },
            { name: 'צור', value: 'tyre', lat: 33.2704, lon: 35.2037 },
            { name: 'בירות', value: 'beirut', lat: 33.8938, lon: 35.5018 },
            { name: 'רמת הגולן הסורית', value: 'golan-heights', lat: 32.9784, lon: 35.7738 },
            { name: 'טהרן', value: 'tehran', lat: 35.6892, lon: 51.3890 },
            { name: 'דמשק', value: 'damascus', lat: 33.5138, lon: 36.2765 },
            { name: 'חודידה', value: 'hodeidah', lat: 14.7616, lon: 42.9534 }
        ]
    },
    'europe': {
        name: 'אירופה',
        cities: [
            { name: 'לונדון', value: 'london', lat: 51.5074, lon: -0.1278 },
            { name: 'פריז', value: 'paris', lat: 48.8566, lon: 2.3522 },
            { name: 'ברלין', value: 'berlin', lat: 52.5200, lon: 13.4050 },
            { name: 'רומא', value: 'rome', lat: 41.9028, lon: 12.4964 },
            { name: 'מדריד', value: 'madrid', lat: 40.4168, lon: -3.7038 },
            { name: 'אמסטרדם', value: 'amsterdam', lat: 52.3676, lon: 4.9041 },
            { name: 'בריסל', value: 'brussels', lat: 50.8503, lon: 4.3517 },
            { name: 'וינה', value: 'vienna', lat: 48.2082, lon: 16.3738 },
            { name: 'סטוקהולם', value: 'stockholm', lat: 59.3293, lon: 18.0686 },
            { name: 'אתונה', value: 'athens', lat: 37.9838, lon: 23.7275 }
        ]
    },
    'usa': {
        name: 'ארצות הברית',
        cities: [
            { name: 'ניו יורק', value: 'new-york', lat: 40.7128, lon: -74.0060 },
            { name: 'לוס אנג\'לס', value: 'los-angeles', lat: 34.0522, lon: -118.2437 },
            { name: 'שיקגו', value: 'chicago', lat: 41.8781, lon: -87.6298 },
            { name: 'יוסטון', value: 'houston', lat: 29.7604, lon: -95.3698 },
            { name: 'פילדלפיה', value: 'philadelphia', lat: 39.9526, lon: -75.1652 }
        ]
    }
};

let selectedCities = [];

document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country-select');
    countrySelect.value = 'israel'; // קביעת ישראל כברירת מחדל
    updateCities();
    countrySelect.addEventListener('change', updateCities);
});

function updateCities() {
    const countrySelect = document.getElementById('country-select');
    const citiesContainer = document.getElementById('cities-container');
    const selectedCountry = countrySelect.value;
    
    citiesContainer.innerHTML = '';
    selectedCities = [];

    if (selectedCountry) {
        const cityCheckboxes = countries[selectedCountry].cities.map(city => `
            <label>
                <input type="checkbox" value="${city.value}" onchange="updateSelectedCities(this)">
                ${city.name}
            </label>
        `).join('');
        
        citiesContainer.innerHTML = `
            <h3>בחר עד חמש ערים ב${countries[selectedCountry].name}:</h3>
            ${cityCheckboxes}
        `;
    }
}

function updateSelectedCities(checkbox) {
    if (checkbox.checked) {
        if (selectedCities.length < 5) {
            selectedCities.push(checkbox.value);
        } else {
            checkbox.checked = false;
            alert('ניתן לבחור עד 5 ערים');
        }
    } else {
        selectedCities = selectedCities.filter(city => city !== checkbox.value);
    }
}

async function getWeather() {
    const weatherDataDiv = document.getElementById('weather-data');
    
    if (selectedCities.length === 0) {
        weatherDataDiv.innerHTML = 'אנא בחר לפחות עיר אחת';
        return;
    }

    weatherDataDiv.innerHTML = 'טוען נתונים...';

    try {
        const weatherPromises = selectedCities.map(async (cityValue) => {
            const country = Object.values(countries).find(country => 
                country.cities.some(city => city.value === cityValue)
            );
            const city = country.cities.find(city => city.value === cityValue);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,pressure_msl,windspeed_10m,winddirection_10m,uv_index,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&lang=he&forecast_days=6`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return { city, data };
        });

        const weatherResults = await Promise.all(weatherPromises);
        
        let weatherHtml = '';
        weatherResults.forEach(({ city, data }) => {
            // כאן תוכל להשתמש בפונקציות הקיימות שלך כמו getWeatherIcon, getWeatherDescription וכו'
            // ליצירת ה-HTML עבור כל עיר
            weatherHtml += `
                <div class="city-weather">
                    <h2>${city.name}</h2>
                    <div class="weather-icon animated">${getWeatherIcon(data.current_weather.weathercode)}</div>
                    <p>טמפרטורה: ${data.current_weather.temperature}°C</p>
                    <!-- הוסף עוד פרטי מזג אוויר כאן -->
                </div>
            `;
        });

        weatherDataDiv.innerHTML = weatherHtml;
    } catch (error) {
        console.error('שגיאה בקבלת נתוני מזג האוויר:', error);
        weatherDataDiv.innerHTML = `אירעה שגיאה בקבלת נתוני מזג האוויר: ${error.message}`;
    }
}

function getWeatherIcon(weatherCode) {
    if (weatherCode <= 3) {
        return '<i class="fas fa-sun" style="color: #FFD700;"></i>';
    } else if (weatherCode <= 48) {
        return '<i class="fas fa-cloud-sun" style="color: #87CEEB;"></i>';
    } else if (weatherCode <= 67) {
        return '<i class="fas fa-cloud-rain" style="color: #4682B4;"></i>';
    } else if (weatherCode <= 77) {
        return '<i class="fas fa-snowflake" style="color: #FFFFFF;"></i>';
    } else if (weatherCode <= 82) {
        return '<i class="fas fa-cloud-showers-heavy" style="color: #1E90FF;"></i>';
    } else {
        return '<i class="fas fa-bolt" style="color: #FFD700;"></i>';
    }
}

function getWeatherDescription(weatherCode) {
    if (weatherCode <= 3) return 'בהיר';
    if (weatherCode <= 48) return 'מעונן';
    if (weatherCode <= 67) return 'גשום';
    if (weatherCode <= 77) return 'שלג';
    if (weatherCode <= 82) return 'ממטרים';
    return 'סוער';
}

function getWindDirection(degree) {
    if (degree > 337.5 || degree <= 22.5) return 'צפון';
    if (degree > 22.5 && degree <= 67.5) return 'צפון-מזרח';
    if (degree > 67.5 && degree <= 112.5) return 'מזרח';
    if (degree > 112.5 && degree <= 157.5) return 'דרום-מזרח';
    if (degree > 157.5 && degree <= 202.5) return 'דרום';
    if (degree > 202.5 && degree <= 247.5) return 'דרום-מערב';
    if (degree > 247.5 && degree <= 292.5) return 'מערב';
    if (degree > 292.5 && degree <= 337.5) return 'צפון-מערב';
}
