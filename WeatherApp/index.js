let API_KEY = '43fcd6ac1d1678d06afdba9352b8db56';

let cityInput = document.querySelector(".city-input");
let searBtn = document.querySelector(".search-btn");
let locationBtn = document.querySelector(".location-btn");
let currentWeatherCard = document.querySelectorAll(".left-side .weather-summary")[0];
let sunRiseCard = document.querySelector(".sunrise-card");


let tempInCelcius,feelsLikeCelcius,forecastHightTemp,forecastLowTemp,_fiveDaysForecast;

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if(!cityName) return;

    let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}` +
        `&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(response => response.json()).then((data) => {
        // console.log(data);

        let {name, lat, lon, country, state} = data[0];
        getWeatherDetails(name, lat, lon, country);


    }).catch((error) => {
        // console.log(error);
        alert(`Failed to fetch coordinates of ${cityName}`);
    })
}

function getWeatherDetails(name, lat, lon, country) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    let days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],
        months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

    fetch(WEATHER_API_URL).then(response => response.json()).then((data) => {
        console.log(data);

        tempInCelcius = data.main.temp;
        let {humidity, feels_like, pressure} = data.main;
        let windSpeed = data.wind.speed;
        feelsLikeCelcius = feels_like;



        let date = new Date();
        currentWeatherCard.innerHTML = `
            <div class="weather-img">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
            </div>
            <div class="temperature">
                <p><span class="value">${(tempInCelcius).toFixed(0)}</span>&deg; <span class="unit-format">C</span></p>
                <p class="weathertext">${data.weather[0].description}</p>
            </div>
            <hr>
            <div class="date-info">
                <p class="week-day">${days[date.getDay()]}</p>
                <p class="date">
                    <i class="fas fa-calendar-alt"></i>
                    ${date.getDate()}  ${months[date.getMonth()]}  ${date.getFullYear()}
                </p>
            </div>
            <div class="location-info">
                <p class="location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${name}, ${country}
                </p>
            </div>
        `;

        let { sunrise, sunset } = data.sys;
        let sunriseDate = new Date(sunrise * 1000);
        let sunsetDate = new Date(sunset * 1000);
        sunRiseCard.querySelector(".sunrise").textContent = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sunRiseCard.querySelector(".sunset").textContent = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });



        console.log(windSpeed);

        let {visibility} = data;

        document.querySelector(".wind").textContent = windSpeed;
        document.querySelector(".humidity").textContent = humidity;
        document.querySelector(".real-feel").textContent = feels_like.toFixed(0);
        document.querySelector(".pressure").textContent = pressure;
        document.querySelector(".visibility").textContent = visibility;


    }).catch((error) => {
        console.log(error);
        // alert('Failed to fetch current weather');
    })

    fetch(FORECAST_API_URL).then(response => response.json()).then((data) => {
        // console.log(data);

        let uniqueForecastDays = [];
        let fiveDaysForecast = data.list.filter( forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        })

        _fiveDaysForecast = fiveDaysForecast;

        // console.log(fiveDaysForecast);

        for(i = 1; i < fiveDaysForecast.length; i++) {
            let date = new Date(fiveDaysForecast[i].dt_txt);
            let forecastElement = document.querySelectorAll(".forecast-day")[i - 1];

            forecastElement.querySelector(".day").textContent = date.getDate();

            let iconCode = fiveDaysForecast[i].weather[0].icon;
            let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            forecastElement.querySelector(".forecast-icon img").src = iconUrl;

            forecastHightTemp = (fiveDaysForecast[i].main.temp_max).toFixed(1);
            forecastLowTemp = (fiveDaysForecast[i].main.temp_min).toFixed(1);


            forecastElement.querySelector(".temp-high").textContent = `High: ${forecastHightTemp}°C`;
            forecastElement.querySelector(".temp-low").textContent = `Low: ${forecastLowTemp}°C`;
        }
        updateTemperatureDisplay();


    }).catch((error) => {
        console.log(error);
        alert('Failed to fetch weather forecast');
    })
}




function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition((position) => {
        let { latitude, longitude } = position.coords;
        let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

        fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                let { name, country, state } = data[0];
                getWeatherDetails(name, latitude, longitude, country, state);
            })
            .catch(() => {
                alert('Failed to fetch user coordinates');
            });
    });
}


locationBtn.addEventListener("click", getUserCoordinates)

searBtn.addEventListener("click", getCityCoordinates);

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getCityCoordinates();
    }
});


function convertToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}




let celsiusRadio = document.getElementById("celsius");
let fahrenheitRadio = document.getElementById("fahrenheit");

function updateTemperatureDisplay() {
    if (celsiusRadio.checked) {
        currentWeatherCard.querySelector(".temperature .value").textContent = tempInCelcius.toFixed(0);
        currentWeatherCard.querySelector(".unit-format").textContent = "C";

        for(i = 1; i <6; i++) {
            let date = new Date(_fiveDaysForecast[i].dt_txt);
            let forecastElement = document.querySelectorAll(".forecast-day")[i - 1];

            forecastElement.querySelector(".day").textContent = date.getDate();

            forecastElement.querySelector(".temp-high").textContent = `High: ${forecastHightTemp}°C`;
            forecastElement.querySelector(".temp-low").textContent = `Low: ${forecastLowTemp}°C`;
        }

    } else if (fahrenheitRadio.checked) {
        let tempInFahrenheit = convertToFahrenheit(tempInCelcius);
        currentWeatherCard.querySelector(".temperature .value").textContent = tempInFahrenheit.toFixed(0);
        currentWeatherCard.querySelector(".unit-format").textContent = "F";
        document.querySelector(".feels-like").textContent = convertToFahrenheit(feelsLikeCelcius).toFixed(0) + "° F";


        for(i = 1; i < _fiveDaysForecast.length; i++) {
            let date = new Date(_fiveDaysForecast[i].dt_txt);
            let forecastElement = document.querySelectorAll(".forecast-day")[i - 1];

            forecastElement.querySelector(".day").textContent = date.getDate();

            forecastElement.querySelector(".temp-high").textContent = `High: ${convertToFahrenheit(forecastHightTemp).toFixed(0)}°F`;
            forecastElement.querySelector(".temp-low").textContent = `Low: ${convertToFahrenheit(forecastLowTemp).toFixed(0)}°F`;
        }

    }
}

celsiusRadio.addEventListener("change", updateTemperatureDisplay);
fahrenheitRadio.addEventListener("change", updateTemperatureDisplay);

