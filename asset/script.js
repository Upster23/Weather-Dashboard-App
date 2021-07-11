const apiKey="77754086d41ea62c6bb14a29692ad18b";

const inputCity = document.getElementById("input-city");
const todayContainer = document.querySelector(".today-container");
const forecastContainer = document.getElementById('forecasts-container');
const cityHistory = document.getElementById("city-history");
const searchButton = document.getElementById("city-search");

const cities = [];


// render the stored cities into the list items
function renderCities() {
     cityHistory.innerHTML = "";
     const cityName = localStorage.getItem("cityNames")   
     for (let i =0; i < cityName.length; i++) {
          var city = cityNames [i];
          var li = document.createElement("li");
          li.textContent = city;
          li.setAttribute("data-index", i);
          cityHistory.appendChild(li);
     }
}

function init() {
console.log("yess");
    const storedCities = JSON.parse(localStorage.getItem("cityNames"));
    if(storedCities !== null) {
        cities = storedCities;     
    }
       renderCities();
       
    }



function generateIconUrl(iconCode){
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

// output: the data as whole from both current weather api and the one call api
function fetchWeather(city) {
    return fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
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
        });
}

function fetchOnecall(lon, lat) {
    return fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
    ).then((response) => response.json());
}

function createTodayCard(cityName, temp, wind, humidity, uvi) {
    const article = document.createElement("article");
    article.setAttribute("class", "card");
    article.setAttribute("class", "border-radius:0");

    const h1 = document.createElement("h1");
    h1.textContent = cityName;

    article.appendChild(h1);

    const tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + temp + " °F";
    article.appendChild(tempEl);

    const windEl = document.createElement("p");
    windEl.textContent = "wind: " + wind + " km/h";
    article.appendChild(windEl);

    const humidityEl = document.createElement("p");
    humidityEl.textContent = "humidity: " + humidity + " %";
    article.appendChild(humidityEl);

    const uvEl = document.createElement("p");
    uvEl.textContent = "uv: " + uvi;
    article.appendChild(uvEl);

    return article;
}

function createForecastCard(date, icon, temp, wind, humidity) {
    const article = document.createElement("article");
    article.setAttribute("class", "card");

    const h1 = document.createElement("h3");
    h1.textContent = date;

    article.appendChild(h1);


    const iconEl = document.createElement("img");
    iconEl.src = generateIconUrl(icon)
    article.appendChild(iconEl);   
    const tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + temp + " °F";
    article.appendChild(tempEl);

    const windEl = document.createElement("p");
    windEl.textContent = "wind: " + wind + " km/h";
    article.appendChild(windEl);

    const humidityEl = document.createElement("p");
    humidityEl.textContent = "humidity: " + humidity + "%";
    article.appendChild(humidityEl);

    return article;
}

function fromUnix(unixTimestamp) {
    
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const date = new Date(unixTimestamp * 1000);

    const day = date.getDate();

    const month = date.getMonth();

    const year = date.getFullYear();

    const formattedTime =
        day + "-" + month + "-" + year;

    return formattedTime

}

function storeCities() {

    localStorage.setItem("cityNames", JSON.stringify(cities));
}


searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    //grab the user input
    const city = inputCity.value.trim();

    // Push user input into cities array    
    if (city === "") {
        return;
    }
    cities.push(city);    
    storeCities();

    // run fetch weather
    fetchWeather(city).then((response) => {
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
            todayUv
        );
        todayContainer.appendChild(card);

        // 5 day forecast
        const forecasts = response.onecallWeather.daily.slice(0, 5);

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
});

fetchWeather("perth");


