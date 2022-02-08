// global variables
var APIKey = "f23bbad3e37047d134e737a642d50987";
var searchHistory = [];
var currentCity = "";
var momentObj = moment();
var todaysDate = momentObj.format(" (MM/DD/YYYY)");

// loads dates for today and 5-day forecast
function loadDates() {
    document.getElementById("currentCity").innerText = todaysDate;
    var allCards = $(".card").find($(".card-body"));
    for (var i = 0; i < 5; i++) {
        allCards[i].children[0].innerText = momentObj.add(i+1,"days").format(" MM/DD/YYYY");
        momentObj.subtract(i+1,"days");
    }
}

// loads search history from local storage, creates search history buttons if needed
function loadHistory() {
    if (JSON.parse(localStorage.getItem("searchHistory")) == null) {
        return;
    }
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    for (var i = 0; i < searchHistory.length; i++) {
        makeHistoryButton(searchHistory[i]);
    }
}

// gets coordinates of city to use the weather API, fires search history management function
function searchCity() {
    var city = document.getElementById("cityName").value;
    fetch("https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            let coord = {"lat" : data[0].lat,"lon" : data[0].lon};
            currentCity = data[0].name;
            addToHistory(data[0].name);
            getWeather(coord);
        });
}

// uses weather API to get weather information to be displayed
function getWeather(coord) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + coord["lat"] + "&lon=" + coord["lon"] + "&units=imperial&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            document.getElementById("currentCity").innerText = currentCity + todaysDate;
            document.getElementById("weatherIcon").setAttribute("src","https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
            
            // object to hold weather data for city being searched for
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
            
            // functions to load current and future weather data
            showWeatherData(weatherData);
            showFiveDay(weatherData.fiveday);
    });
}

// populates data from weatherData object onto the page
function showWeatherData(weatherData) {
    document.getElementById("currentTemp").innerText = weatherData.temp + " ℉";
    document.getElementById("currentWind").innerText = weatherData.wind + " MPH";
    document.getElementById("currentHumidity").innerText = weatherData.humidity + " %";
    setUVIColor(weatherData.uvi);
    document.getElementById("currentUVI").innerText = weatherData.uvi;
}

// chooses color for UV Index
function setUVIColor(uvi) {
    if (uvi < 3) {
        document.getElementById("currentUVI").setAttribute("style","background-color:green");
    } else if (uvi < 8) {
        document.getElementById("currentUVI").setAttribute("style","background-color:orange");
    } else {
        document.getElementById("currentUVI").setAttribute("style","background-color:red");
    }
}

// loads 5 day forecast into the cards
function showFiveDay(fiveDayArray) {
    var allCards = $(".card").find($(".card-body"));
    for (var i = 0; i < fiveDayArray.length; i++) {
        allCards[i].children[1].setAttribute("src","https://openweathermap.org/img/wn/" + fiveDayArray[i].weather[0].icon + "@2x.png");
        allCards[i].children[2].innerText = "Temp: " + fiveDayArray[i].temp.day + " ℉";
        allCards[i].children[3].innerText = "Wind: " + fiveDayArray[i].wind_speed + " MPH";
        allCards[i].children[4].innerText = "Humidity: " + fiveDayArray[i].humidity + " %";
    }
}

// checks if city already exists in search history, if not then adjust search history
function addToHistory(cityName) {
    duplicate = consolidateHistory(cityName);

    if(duplicate) {
        return;
    }

    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));

    // add/remove buttons from search history
    makeHistoryButton(cityName);
}

// creates buttons to search for cities in search history
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

// checks cityName against search history and proceeds based on different scenarios
function consolidateHistory(cityName) {
    // if no history exists, push searched city onto array
    if(searchHistory == null) {
        searchHistory.push(cityName);
        return false;
    }

    // if history exists, check if the city is already in the array. if yes, city is not added
    for (var i = 0; i < searchHistory.length; i++) {
        if (searchHistory[i] == cityName) {
            return true;
        }
    }

    // search history maxes out at 8 entries
    // if history is full, remove first entry to make room on the end for the new entry
    if (searchHistory.length > 7) {
        searchHistory.shift();
        searches = document.getElementById("searchColumn");
        searches.removeChild(searches.childNodes[7]);
    }

    // append city being searched to end of array
    searchHistory.push(cityName);
    return false;
}

// listener for blue search button
$("#primarySearch").on("click", function() {
    searchCity();
});

// if text entry is in focus, and Enter is pressed, search for the city that has been typed in
$(document).on("keypress", function(key) {
    if(key.which == 13) {
        if (document.activeElement === document.getElementById("cityName")) {
            searchCity();
        }
    }
});

// clicking a gray search history button will pull the weather information for the city on the button
$("#searchColumn").on("click",".historyButton", function() {
    document.getElementById("cityName").value = this.innerText;
    searchCity();
});

// load search history
loadHistory();
// load dates
loadDates();
