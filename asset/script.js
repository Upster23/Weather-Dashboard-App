const apiKey = "77754086d41ea62c6bb14a29692ad18b";

const inputCity = document.getElementById("input-city");
const todayContainer = document.querySelector(".today-container");
const forecastContainer = document.getElementById("forecasts-container");
const cityHistory = document.getElementById("city-history");
const searchButton = document.getElementById("city-search");
const formSearch = document.getElementById('form-search');
const currentDate = moment().format("DD-MM-YYYY");

// render the stored cities into the list items
function renderCities() {
    cityHistory.innerHTML = "";
    
    const cityNames = JSON.parse(localStorage.getItem("cityNames")) || [];
    for (let i = 0; i < cityNames.length; i++) {
        const city = cityNames[i];
        const li = document.createElement("li");
        li.setAttribute('class', 'clickable' )
        li.setAttribute('class', 'd-flex align-items-center text-capitalize')
        li.textContent = city;

        li.addEventListener('click', function(event){
            event.preventDefault();

            // run the main query
            queryWeatherDashboard(city);
        })

        cityHistory.appendChild(li);
    }
}

function init() {
    renderCities();
}


function generateIconImg(iconCode) {

    const img = document.createElement("img");
    img.src = generateIconUrl(iconCode);
    return img;
}


function generateIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// output: the data as whole from both current weather api and the one call api
function fetchWeather(city) {
    return fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    )
        .then((response) => response.json())
        .then((response) => {

            const lon = response.coord.lon;
            const lat = response.coord.lat;

            return fetchOnecall(lon, lat).then((onecallResponse) => {
                return {
                    currentWeather: response,
                    onecallWeather: onecallResponse,
                };
            });
        })
        .catch(function(err){
            console.log('not founddd');
            alert("City not found. Please enter a correct city name.")
        });
}

function fetchOnecall(lon, lat) {
    return fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    ).then((response) => response.json());
}

function createTodayCard(cityName, temp, wind, humidity, uvi, iconCode) {
    const article = document.createElement("article");
    article.setAttribute("class", "card");
    article.setAttribute("class", "border-radius:0");

    const capitaliseCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);

    const h2 = document.createElement("h1");
    h2.textContent = capitaliseCity + " " + currentDate;

    h2.appendChild(generateIconImg(iconCode));

    article.appendChild(h2);

    const tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + temp + " ??C";
    article.appendChild(tempEl);

    const windEl = document.createElement("p");
    windEl.textContent = "Wind: " + wind + " km/h";
    article.appendChild(windEl);

    const humidityEl = document.createElement("p");
    humidityEl.textContent = "Humidity: " + humidity + " %";
    article.appendChild(humidityEl);

    const uvEl = document.createElement("p");
    uvEl.textContent = "UV: " + uvi;
    article.appendChild(uvEl);

    return article;
}

function createForecastCard(date, icon, temp, wind, humidity) {
    const article = document.createElement("article");
    article.setAttribute("class", "card");

    const h1 = document.createElement("h3");
    h1.textContent = date;

    article.appendChild(h1);

    const iconEl = generateIconImg(icon);
    article.appendChild(iconEl);

    const tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + temp + " ??C";
    article.appendChild(tempEl);

    const windEl = document.createElement("p");
    windEl.textContent = "Wind: " + wind + " km/h";
    article.appendChild(windEl);

    const humidityEl = document.createElement("p");
    humidityEl.textContent = "Humidity: " + humidity + "%";
    article.appendChild(humidityEl);

    return article;
}

function fromUnix(unixTimestamp) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const date = new Date(unixTimestamp * 1000);

    const day = date.getDate();

    const month = date.getMonth() + 1;

    const year = date.getFullYear();

    const formattedTime = day + "-" + month + "-" + year;

    return formattedTime;
}

function storeCities(cities) {
    localStorage.setItem("cityNames", JSON.stringify(cities));
}


function queryWeatherDashboard(city){
    // clear the containers
    todayContainer.textContent = "";
    forecastContainer.textContent = "";


    

    // run fetch weather
    return fetchWeather(city).then((response) => {

        // today's section
        // temp
        const todayTemp = response.currentWeather.main.temp;

        // wind speed
        const todayWind = response.currentWeather.wind.speed;

        // humidity
        const todayHumidity = response.currentWeather.main.humidity;

        // uv index
        const todayUv = response.onecallWeather.current.uvi;

        const card = createTodayCard(
            city,
            todayTemp,
            todayWind,
            todayHumidity,
            todayUv,
            response.currentWeather.weather[0].icon
        );
        todayContainer.appendChild(card);

        // 5 day forecast
        const forecasts = response.onecallWeather.daily.slice(1, 6);

        // loop thru the forecast
        for (let index = 0; index < forecasts.length; index++) {
            const forecast = forecasts[index];
            // for each iteration
            // create a card, containing:
            // date
            // icon
            // temp
            // wind
            // humidity
            const card = createForecastCard(
                fromUnix(forecast.dt),
                forecast.weather[0].icon,
                forecast.temp.day,
                forecast.wind_speed,
                forecast.humidity
            );

            forecastContainer.appendChild(card);
        }
    });

    // put the data into the dom
}

formSearch.addEventListener("submit", function (event) {
    event.preventDefault();

    //grab the user input
    const city = inputCity.value.trim();
    const cities = JSON.parse(localStorage.getItem('cityNames')) || [];

    // Push user input into cities array
    if (city === "") {
        return;
    }

    if (cities.includes(city)) {
        return;
    }

    else {
        cities.push(city);

        storeCities(cities);
    }


    queryWeatherDashboard(city)
        .then(function() {
            renderCities();
        });



});

init();