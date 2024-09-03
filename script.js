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

async function getWeather() {
    console.log("getWeather function called");
    const countrySelect = document.getElementById('country-select');
    const citySelect = document.getElementById('city-select');
    const weatherDataDiv = document.getElementById('weather-data');
    const country = countrySelect.value;
    const city = citySelect.value;

    if (!country || !city) {
        weatherDataDiv.innerHTML = 'אנא בחר מדינה ועיר';
        return;
    }

    weatherDataDiv.innerHTML = 'טוען נתונים...';

    try {
        const coordinates = getCityCoordinates(country, city);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,pressure_msl,windspeed_10m,winddirection_10m,uv_index,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&lang=he&forecast_days=6`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received data:", data);

        if (data.current_weather) {
            const currentHour = new Date().getHours();
            const weatherIcon = getWeatherIcon(data.current_weather.weathercode);
            let forecastHtml = '';
            for (let i = 1; i < 6; i++) {
                forecastHtml += `
                    <div class="forecast-day">
                        <p>${new Date(data.daily.time[i]).toLocaleDateString('he-IL', {weekday: 'short'})}</p>
                        <div class="forecast-icon">${getWeatherIcon(data.daily.weathercode[i])}</div>
                        <p>${Math.round(data.daily.temperature_2m_max[i])}°/${Math.round(data.daily.temperature_2m_min[i])}°</p>
                    </div>
                `;
            }
            weatherDataDiv.innerHTML = `
                <div class="weather-icon animated">${weatherIcon}</div>
                <h2>${getCityHebrewName(country, city)}</h2>
                <p>מזג אוויר: ${getWeatherDescription(data.current_weather.weathercode)}</p>
                <p>טמפרטורה: ${data.current_weather.temperature}°C</p>
                <p>טמפרטורה מקסימלית: ${data.daily.temperature_2m_max[0]}°C</p>
                <p>טמפרטורה מינימלית: ${data.daily.temperature_2m_min[0]}°C</p>
                <p>לחות: ${data.hourly.relativehumidity_2m[currentHour]}%</p>
                <p>לחץ אטמוספרי: ${data.hourly.pressure_msl[currentHour]} hPa</p>
                <p>מהירות רוח: ${data.current_weather.windspeed} קמ"ש</p>
                <p>כיוון הרוח: ${getWindDirection(data.current_weather.winddirection)}</p>
                <p>זריחה: ${new Date(data.daily.sunrise[0]).toLocaleTimeString('he-IL')}</p>
                <p>שקיעה: ${new Date(data.daily.sunset[0]).toLocaleTimeString('he-IL')}</p>
                <p>מדד UV: ${data.hourly.uv_index[currentHour]}</p>
                <p>הסתברות לגשם: ${data.hourly.precipitation_probability[currentHour]}%</p>
                <h3>תחזית ל-5 ימים הבאים</h3>
                <div class="forecast">${forecastHtml}</div>
            `;
        } else {
            weatherDataDiv.innerHTML = 'מידע לא זמין עבור עיר זו';
        }
    } catch (error) {
        console.error('שגיאה בקבלת נתוני מזג האוויר:', error);
        weatherDataDiv.innerHTML = `אירעה שגיאה בקבלת נתוני מזג האוויר: ${error.message}`;
    }
}

function getCityCoordinates(country, cityValue) {
    const cityData = countries[country].cities.find(c => c.value === cityValue);
    if (cityData) {
        return { lat: cityData.lat, lon: cityData.lon };
    }
    throw new Error('City not found');
}

function getCityHebrewName(country, cityValue) {
    const cityData = countries[country].cities.find(c => c.value === cityValue);
    return cityData ? cityData.name : cityValue;
}

// ... שאר הפונקציות נשארות ללא שינוי ...

document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country-select');
    const citySelect = document.getElementById('city-select');

    countrySelect.addEventListener('change', updateCities);
    updateCities(); // קריאה ראשונית לעדכון רשימת הערים

    function updateCities() {
        const selectedCountry = countrySelect.value;
        citySelect.innerHTML = '<option value="">בחר עיר</option>';
        
        if (selectedCountry && countries[selectedCountry]) {
            countries[selectedCountry].cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.value;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        }
    }
});
