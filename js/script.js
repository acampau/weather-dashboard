//Variables
var city;

//FUNCTIONS

function renderCurrent(currentBody) {
  var currentDate = currentBody.current.dt + currentBody.timezone_offset;

  var localDate = new Date(currentDate * 1000)
    .toUTCString()
    .split(" ")
    .slice(0, 4)
    .join(" ");
  $("#current-weather-date").text(localDate);
  var weatherIconUrl = currentBody.current.weather[0].icon;
  //list of icons from OpenWeatherMap
  var iconCurrent =
    "https://openweathermap.org/img/wn/" + weatherIconUrl + "@2x.png";
  $("#current-weather-icon").attr("src", iconCurrent);
  var temp = currentBody.current.temp;
  $("#current-weather-temp").text(temp);
  var humidity = currentBody.current.humidity;
  $("#current-weather-humidity").text(humidity);
  var wind = currentBody.current.wind_speed;
  $("#current-weather-wind").text(wind);

  var uvi = currentBody.current.uvi;
  $("#current-weather-uvi").text(uvi);
  //If UVI is less than 4, changes green
  if (uvi < 4) {
    $("#current-weather-uvi").css({
      color: "white",
      padding: "1px",
      background: "green",
    });
    //If UVI is between 4 and 6, chagnes yellow
  } else if (uvi < 6) {
    $("#current-weather-uvi").css({
      color: "black",
      padding: "1px",
      background: "yellow",
    });
    //If UVI is above 6, changes red
  } else {
    $("#current-weather-uvi").css({
      color: "white",
      padding: "1px",
      background: "red",
    });
  }
}
//Function that accepts forecast vars
function renderForecast(forecastBody) {
  var cityName = forecastBody.city.name;

  $("#current-weather-city").text(cityName);

  var noonTimes = forecastBody.list.filter(function (listItem) {
    return listItem.dt_txt.includes("21:00");
  });
  console.log(noonTimes);

  noonTimes.forEach(function (listItem, index) {
    var date = listItem.dt_txt.split(" ")[0];
    $("#forecast-date-" + index).text(date);
    var iconUrl = listItem.weather[0].icon;
    var icon = "https://openweathermap.org/img/wn/" + iconUrl + "@2x.png";
    $("#forecast-icon-" + index).attr("src", icon);
    var temp = listItem.main.temp;
    $("#forecast-temp-" + index).text(temp);
    var humidity = listItem.main.humidity;
    $("#forecast-humidity-" + index).text(humidity);
    var wind = listItem.wind.speed;
    $("#forecast-wind-" + index).text(wind);
  });
}

//Saves to localStorage
function saveCurrent(currentBody) {
  var cityData = localStorage.getItem("all-data");
  var storedData = JSON.parse(cityData);

  if (storedData == null) {
    storedData = {};
  }
  if (!storedData[city]) {
    storedData[city] = {};
  }
  storedData[city].current = currentBody;
  localStorage.setItem("all-data", JSON.stringify(storedData));
}

//Saves to localStorage
function saveForecast(forecastBody) {
  var cityData = localStorage.getItem("all-data");
  var storedData = JSON.parse(cityData);

  if (storedData == null) {
    storedData = {};
  }
  var cityNameStored = forecastBody.city.name;
  if (!storedData[cityNameStored]) {
    storedData[cityNameStored] = {};
  }
  storedData[cityNameStored].forecast = forecastBody;
  localStorage.setItem("all-data", JSON.stringify(storedData));
}

var weather = function (cityName) {
  //Key: d087fc41244c27da84e39f7fd175d3d7

  var fiveDayForecastUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    cityName +
    "&units=imperial&appid=d087fc41244c27da84e39f7fd175d3d7";

  fetch(fiveDayForecastUrl)
    .then(function (responseFiveDay) {
      return responseFiveDay.json();
    })
    .then(function (bodyFiveDay) {
      console.log(bodyFiveDay);

      renderForecast(bodyFiveDay);

      saveForecast(bodyFiveDay);

      var lat = bodyFiveDay.city.coord.lat;

      var lon = bodyFiveDay.city.coord.lon;

      city = bodyFiveDay.city.name;
      var currentWeatherUrl =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&exclude=minutely,hourly,daily,alerts&units=imperial&appid=d087fc41244c27da84e39f7fd175d3d7";

      return fetch(currentWeatherUrl);
    })
    .then(function (responseCurrent) {
      return responseCurrent.json();
    })
    .then(function (currentBody) {
      console.log(currentBody);
      renderCurrent(currentBody);
      saveCurrent(currentBody);
    });
};

//Event handler

$("#city-form").on("submit", saveHandler);
function saveHandler(event) {
  event.preventDefault();

  var cityName = $("#city-name").val();

  console.log(cityName);

  weather(cityName);
}
