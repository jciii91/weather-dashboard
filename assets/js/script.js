var APIKey = "f23bbad3e37047d134e737a642d50987";
var searchHistory = [];

function searchCity() {
    var city = document.getElementById("cityName").value;
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            let coord = {"lat" : data[0].lat,"lon" : data[0].lon};
            addToHistory(data[0].name);
            getWeather(coord);
        });
}

function getWeather(coord) {
    fetch("http://api.openweathermap.org/data/2.5/onecall?lat=" + coord["lat"] + "&lon=" + coord["lon"] + "&units=imperial&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            let weatherData = {
                "temp" : data.current.temp.toFixed(2),
                "wind" : data.current.wind_speed,
                "humidity" : data.current.humidity,
                "UVI" : data.current.uvi
            };
            //console.log(weatherData);
    });
}

function addToHistory(cityName) {
    buttonRow = document.createElement("div");
    buttonRow.setAttribute("class","row m-1 ml-3 mt-3 d-flex justify-content-start");

    newButton = document.createElement("button");
    newButton.setAttribute("type","button");
    newButton.setAttribute("class","historyButton w-100 btn btn-secondary");
    newButton.innerHTML = cityName;

    buttonRow.appendChild(newButton);
    document.getElementById("searchColumn").appendChild(buttonRow);
}

$("#primarySearch").on("click", function() {
    searchCity();
});