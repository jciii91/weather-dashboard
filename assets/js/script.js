var APIKey = "f23bbad3e37047d134e737a642d50987";
var searchHistory = [];
var currentCity = "";
var todaysDate = moment().format(" (MM/DD/YYYY)");

function searchCity() {
    var city = document.getElementById("cityName").value;
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            let coord = {"lat" : data[0].lat,"lon" : data[0].lon};
            currentCity = data[0].name;
            addToHistory(data[0].name);
            getWeather(coord);
        });
}

function getWeather(coord) {
    fetch("http://api.openweathermap.org/data/2.5/onecall?lat=" + coord["lat"] + "&lon=" + coord["lon"] + "&units=imperial&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById("currentCity").innerText = currentCity + todaysDate;
            document.getElementById("weatherIcon").setAttribute("src","http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
            document.getElementById("weatherIcon").setAttribute("height","45px");
            
            let weatherData = {
                "temp" : data.current.temp.toFixed(2),
                "wind" : data.current.wind_speed,
                "humidity" : data.current.humidity,
                "uvi" : data.current.uvi
            };
            
            console.log(weatherData);
            showWeatherData(weatherData)
    });
}

function showWeatherData(weatherData) {
    document.getElementById("currentTemp").innerText = weatherData.temp + " ℉";
    document.getElementById("currentWind").innerText = weatherData.wind + " MPH";
    document.getElementById("currentHumidity").innerText = weatherData.humidity + " %";
    setUVIColor(weatherData.uvi);
    document.getElementById("currentUVI").innerText = weatherData.uvi;
}

function setUVIColor(uvi) {
    if (uvi < 3) {
        document.getElementById("currentUVI").setAttribute("style","background-color:green");
    } else if (uvi < 8) {
        document.getElementById("currentUVI").setAttribute("style","background-color:orange");
    } else {
        document.getElementById("currentUVI").setAttribute("style","background-color:red");
    }
}

function addToHistory(cityName) {
    duplicate = consolidateHistory(cityName);

    if(duplicate) {
        return;
    }

    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));

    buttonRow = document.createElement("div");
    buttonRow.setAttribute("class","row m-1 ml-3 mt-3 d-flex justify-content-start");

    newButton = document.createElement("button");
    newButton.setAttribute("type","button");
    newButton.setAttribute("class","historyButton w-100 btn btn-secondary");
    newButton.innerHTML = cityName;

    buttonRow.appendChild(newButton);
    document.getElementById("searchColumn").appendChild(buttonRow);
}

function consolidateHistory(cityName) {
    for (var i = 0; i < searchHistory.length; i++) {
        if (searchHistory[i] == cityName) {
            return true;
        }
    }

    if (searchHistory.length > 7) {
        searchHistory.shift();
        searches = document.getElementById("searchColumn");
        searches.removeChild(searches.childNodes[7]);
    }

    searchHistory.push(cityName);
    return false;
}

$("#primarySearch").on("click", function() {
    searchCity();
});

document.getElementById("currentCity").innerText = todaysDate;