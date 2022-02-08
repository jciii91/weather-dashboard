var APIKey = "f23bbad3e37047d134e737a642d50987";
var searchHistory = [];
var currentCity = "";
var momentObj = moment();
var todaysDate = momentObj.format(" (MM/DD/YYYY)");

function loadDates() {
    document.getElementById("currentCity").innerText = todaysDate;
    var allCards = $(".card").find($(".card-body"));
    for (var i = 0; i < 5; i++) {
        allCards[i].children[0].innerText = momentObj.add(i+1,"days").format(" MM/DD/YYYY");
        momentObj.subtract(i+1,"days");
    }
}

function loadHistory() {
    if (JSON.parse(localStorage.getItem("searchHistory")) == null) {
        return;
    }
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    for (var i = 0; i < searchHistory.length; i++) {
        makeHistoryButton(searchHistory[i]);
    }
}

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
            document.getElementById("currentCity").innerText = currentCity + todaysDate;
            document.getElementById("weatherIcon").setAttribute("src","http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
            
            let weatherData = {
                "temp" : data.current.temp.toFixed(2),
                "wind" : data.current.wind_speed,
                "humidity" : data.current.humidity,
                "uvi" : data.current.uvi,
                "fiveday" : [
                    data.daily[1],
                    data.daily[2],
                    data.daily[3],
                    data.daily[4],
                    data.daily[5]
                ]
            };
            
            showWeatherData(weatherData);
            showFiveDay(weatherData.fiveday);
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

function showFiveDay(fiveDayArray) {
    var allCards = $(".card").find($(".card-body"));
    for (var i = 0; i < fiveDayArray.length; i++) {
        allCards[i].children[1].setAttribute("src","http://openweathermap.org/img/wn/" + fiveDayArray[i].weather[0].icon + "@2x.png");
        allCards[i].children[2].innerText = "Temp: " + fiveDayArray[i].temp.day + " ℉";
        allCards[i].children[3].innerText = "Wind: " + fiveDayArray[i].wind_speed + " MPH";
        allCards[i].children[4].innerText = "Humidity: " + fiveDayArray[i].humidity + " %";
    }
}

function addToHistory(cityName) {
    duplicate = consolidateHistory(cityName);

    if(duplicate) {
        return;
    }

    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));

    makeHistoryButton(cityName);
}

function makeHistoryButton(cityName) {
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
    if(searchHistory == null) {
        searchHistory.push(cityName);
        return false;
    }

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

$(document).on("keypress", function(key) {
    if(key.which == 13) {
        if (document.activeElement === document.getElementById("cityName")) {
            searchCity();
        }
    }
});

$("#searchColumn").on("click",".historyButton", function() {
    document.getElementById("cityName").value = this.innerText;
    searchCity();
});

loadHistory();
loadDates();