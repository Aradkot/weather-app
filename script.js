async function getWeather() {
    console.log("getWeather function called");
    const citySelect = document.getElementById('city-select');
    const weatherDataDiv = document.getElementById('weather-data');
    const city = citySelect.value;

    if (!city) {
        weatherDataDiv.innerHTML = 'אנא בחר עיר';
        return;
    }

    weatherDataDiv.innerHTML = 'טוען נתונים...';

    try {
        const coordinates = getCityCoordinates(city);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,pressure_msl,windspeed_10m,winddirection_10m,uv_index,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=IST&lang=he&forecast_days=6`;
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
                <h2>${getCityHebrewName(city)}</h2>
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

function getCityCoordinates(city) {
    const coordinates = {
        'tel-aviv': { lat: 32.0853, lon: 34.7818 },
        'jerusalem': { lat: 31.7683, lon: 35.2137 },
        'haifa': { lat: 32.7940, lon: 34.9896 },
        'beer-sheva': { lat: 31.2524, lon: 34.7915 },
        'eilat': { lat: 29.5581, lon: 34.9482 }
    };
    return coordinates[city];
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

function getCityHebrewName(cityValue) {
    const cityMap = {
        'tel-aviv': 'תל אביב',
        'jerusalem': 'ירושלים',
        'haifa': 'חיפה',
        'beer-sheva': 'באר שבע',
        'eilat': 'אילת'
    };
    return cityMap[cityValue] || cityValue;
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