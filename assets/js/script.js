const dateEl = $("#date");
const timeEl = $("#time");
const currentWeather = $("#today");
const APIKey = "e389f8348265793157f5a0cf6f5829b2";
const forecastEl = $("#forecast");
const WeatherHistoryEl = $("#history");
const searchInput = $("#search-input");
const searchButton = $("#search-button");
const clearButton = $("#clear");
const sidebar = WeatherHistoryEl;

let city;
let previousCities;

// Display the current date and time
const currentDate = dayjs().format("dddd D, MMMM YYYY");
$("#currentDay").text(currentDate);
const currentTime = dayjs().format("HH:mm:ss");
$("#time-display").text(currentTime);

// Enable/disable search button based on input value
searchInput.on("input", function (e) {
  const value = e.target.value.trim();
  searchButton.prop("disabled", value.length === 0);
});

// Clear local storage on clear button click
clearButton.on("click", function (event) {
  event.preventDefault();
  WeatherHistoryEl.empty();
  localStorage.clear();
});
// Search button click event
searchButton.on("click", function (event) {
    event.preventDefault();
    const inputCity = searchInput.val().trim();
    
  // Check if the inputCity is empty before making the API request
  if (!inputCity) {
    console.error("Input city is empty");
    // Handle the error, for example, by displaying a message to the user.
    return;
  }

  getCoordinates(inputCity);
});


// Load previous cities from local storage
function localStorageLoad() {
  const storedCities = localStorage.getItem("previousCities");
  if (storedCities) {
    const cityArray = JSON.parse(storedCities);
    cityArray.forEach((storedCity) => {
      const cityButton = $(`<button type="submit">${storedCity}</button>`);
      sidebar.append(cityButton);
    });
  }
}

// Weather history button click event
WeatherHistoryEl.on('click', 'button', function (event) {
  event.preventDefault();
  currentWeather.empty();
  forecastEl.empty();
  city = $(this).text();
  getCoordinates(city);
});

function getCoordinates(inputCity) {
    console.log("City in getCoordinates:", inputCity);
    city = inputCity;
    
    if (!city) {
        console.error("City is undefined or empty");
        // Handle the error, for example, by displaying a message to the user.
        return;
    }

    const geoQuery = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${APIKey}`;
    console.log(city);
    fetch(geoQuery)
    .then(response => {
        console.log("Geo Query Response:", response);
        return response.json();
    })
    .then(data => {
        console.log("Geo Query Data:", data);
            if (data && data.length > 0) {
                // Assume the first item in the array is the correct match
                const firstMatch = data[0];
                const latitude = firstMatch.lat;
                const longitude = firstMatch.lon;

                getWeather(latitude, longitude);
                console.log(data);
            } else {
                console.error("No valid matches found for the city:", city);
                // Handle the error
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            // Handle the error, 
        });
}
console.log();
// Fetch weather information based on coordinates
function getWeather(latitude, longitude) {
  console.log("Latitude:", latitude, "Longitude:", longitude);
  const query = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKey}`;
  fetch(query)
    .then(response => response.json())
    .then(data => {

      console.log("Weather API Response:", data);

      const todayTemp = data.list[0].main.temp;  // Correct index is 0
      const todayIcon = data.list[0].weather[0].icon;
      const todayIconUrl = `https://openweathermap.org/img/wn/${todayIcon}@2x.png`;

      console.log("Today's Weather Temp:", todayTemp);
      console.log("Today's Weather Icon:", todayIcon);

      const currentForecast = $(`<h2>${city} (${dayjs().format('D/M/YYYY')})</h2>
        <img class="today-icon" src="${todayIconUrl}" alt="${data.list[0].weather[0].description}" />
        <p>Temp: ${toCelsius(todayTemp)} &deg;C</p>
        <p>Wind: ${data.list[0].wind.speed} KPH</p>
        <p>Humidity: ${data.list[0].main.humidity} %</p>`);

        currentWeather.html(currentForecast);
      console.log("Today's weather content:", currentWeather.html());

      let futureForecast = $(`<h3>5-Day Forecast:</h3>`);
      forecastEl.html(futureForecast); // Clear previous forecast content
      
      // Get the current date
      const currentDate = dayjs().format('YYYY-MM-DD');
      
     // Filter the forecast data for the next 5 distinct days
const nextFiveDays = [];
const processedDates = [];

data.list.forEach(item => {
  const forecastDate = dayjs(item.dt_txt).format('YYYY-MM-DD');
  if (!processedDates.includes(forecastDate) && dayjs(forecastDate).isAfter(currentDate)) {
    nextFiveDays.push(item);
    processedDates.push(forecastDate);
  }
});

// Display the forecast for the next 5 days
const forecastContainer = $("#forecast");
forecastContainer.empty(); // Clear previous forecast content

nextFiveDays.slice(0, 5).forEach(item => {
  const icon = item.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  const date = dayjs(item.dt_txt).format('D/M/YYYY');
  const temp = item.main.temp;

  const forecastItem = $(`<div class="col-2">
    <h4>${date}</h4>
    <img class="future-icon" src="${iconUrl}" alt="${item.weather[0].description}" />
    <p>Temp: ${toCelsius(temp)} &deg;C</p>
    <p>Wind: ${item.wind.speed} KPH</p>
    <p>Humidity: ${item.main.humidity} %</p>
  </div>`);

  forecastContainer.append(forecastItem);
});

      


      if (!WeatherHistoryEl.find(`button:contains(${city})`).length) {
        const cityButton = $(`<button type="submit">${city}</button>`);
        sidebar.append(cityButton);
        // Update local storage with current list of cities
function localStorageUpdate() {
  const cityButtons = [];
  sidebar.find('button').each(function () {
    cityButtons.push($(this).text());
  });
  localStorage.setItem('previousCities', JSON.stringify(cityButtons));
}
      }
      
    })
      .catch(error => {
        console.error("Error fetching weather data:", error);
      
    });





// Update local storage with current list of cities
function localStorageUpdate() {
  const cityButtons = [];
  sidebar.find('button').each(function () {
    cityButtons.push($(this).text());
  });
  localStorage.setItem('previousCities', JSON.stringify(cityButtons));
}

// Convert temperature to Celsius
function toCelsius(temp) {
  return (temp - 273.15).toFixed(2);
}

// Initialize: Load previous cities from local storage
localStorageLoad();
}