var APIKey = "f23bbad3e37047d134e737a642d50987";

function searchCity() {
    var city = document.getElementById("cityName").value;
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            let coord = {"lat" : data[0].lat,"lon" : data[0].lon};
            getWeather(coord);
        });
}

function getWeather(coord) {
    fetch("http://api.openweathermap.org/data/2.5/onecall?lat=" + coord["lat"] + "&lon=" + coord["lon"] + "&units=imperial&appid=" + APIKey)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let weatherData = {
                "temp" : data.current.temp.toFixed(2),
                "wind" : data.current.wind_speed,
                "humidity" : data.current.humidity,
                "UVI" : data.current.uvi
            };
            console.log(weatherData);
    });
}

$("#primarySearch").on("click", function() {
    searchCity();
});