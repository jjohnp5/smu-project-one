// Variable to hold the date range
var currentDate = moment().format("YYYYMMDD00");
var currentTime = moment().format("HH:mm");
var nextWeek = moment().add(7, "days").format("YYYYMMDD00");
var twoWeeks = moment().add(14, "days").format("YYYYMMDD00");
var timeOfDay = "";
var weatherCode;
var icon = new Image(90, 90);

var weatherAPI = "44df1c912088b9675614938b52bcbd0e";

console.log(currentDate);
console.log(nextWeek);
console.log(twoWeeks);


// Get weather details
function getEventWeather(long, lat) {
    var latitude = lat;
    var longitude = long;
    console.log("Longitude: " + long);
    console.log("Latitude: " + lat);

    // Create weather object to use for API calls
    var weatherObj = {
        url: "https://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        data: {
            appid: weatherAPI,
            lat: latitude,
            lon: longitude
        },
    };

    // Weather AJAX Call
    $.ajax(weatherObj).then(data => {
        weatherCode = data.weather[0].id;
        var tempConverted = parseInt((data.main.temp * (9 / 5) - 459.67));
        var sunriseTime = moment.unix(data.sys.sunrise).format("HH:mm");
        var sunsetTime = moment.unix(data.sys.sunset).format("HH:mm");

        // Get the time of day
        switch (true) {
            case (currentTime < sunriseTime):
            case (currentTime >= sunsetTime):
                timeOfDay = "night";
                break;
            case (currentTime >= sunriseTime):
            case (currentDate < sunsetTime):
                timeOfDay = "day";
            default:
                ("Unable to get time of day.");
                break;
        }
        // Set the icons based on weather code
        setWeatherIcon(weatherCode);

        console.log("sunrise: " + sunriseTime);
        console.log("sunset: " + sunsetTime);
        console.log("Current temp: " + tempConverted);
        console.log("Weather code: " + weatherCode);
        console.log("Time of day: " + timeOfDay);
    });
}

function setWeatherIcon(code) {
    console.log("inside setWeatherIcon");
    if (timeOfDay === "day") {
        console.log("Inside day switch");
        switch (code) {
            // Check for daytime thunderstorms
            case (code > 199):
            case (code < 300):
                icon.src = "../images/weather/day_tstorms.ico";
                console.log("day thunderstorms");
                break;
            // Check for daytime light rain
            case (code > 299):
            case (code < 400):
                icon.src = "../images/weather/day_rain_light.ico";
                console.log("day light rain");
                break;
            // Check for daytime heavy rain
            case (code > 499):
            case (code < 600):
                icon.src = "../images/weather/day_rain_heavy.ico";
                console.log("day heavy rain");
                break;
            // Check for environmental conditions i.e. tornado, dust storms, etc.
            case (code > 699):
            case (code < 800):
                icon.src = "../images/weather/cloudy_heavy.ico";
                console.log("day clouds");
                break;
            // Check for daytime clear skies
            case (code = 800):
                icon.src = "../images/weather/day_clear.ico";
                console.log("day clear");
                break;
            // Check for daytime light clouds
            case (code = 801):
            case (code = 803):
            case (code = 804):
                icon.src = "../images/weather/day_cloudy_light.ico";
                console.log("day light clouds");
                break;
            // Check for daytime heavy clouds
            case (code = 802):
                icon.src = "../images/weather/day_cloudy_heavy.ico";
                console.log("day heavy clouds");
                break;
            default:
                break;
        }

        if (timeOfDay === "night") {
            switch (code) {
                // Check for nighttime thunderstorms
                case (code > 199):
                case (code < 300):
                    icon.src = "../images/weather/night_tstorms.ico";
                    console.log("night thunderstorms");
                    break;
                // Check for daytime light rain
                case (code > 299):
                case (code < 400):
                    icon.src = "../images/weather/night_rain_light.ico";
                    console.log("night light rain");
                    break;
                // Check for daytime heavy rain
                case (code > 499):
                case (code < 600):
                    icon.src = "../images/weather/night_rain_heavy.ico";
                    console.log("night heavy rain");
                    break;
                // Check for environmental conditions i.e. tornado, dust storms, etc.
                case (code > 699):
                case (code < 800):
                    icon.src = "../images/weather/cloudy_heavy.ico";
                    console.log("night clouds");
                    break;
                // Check for daytime clear skies
                case (code = 800):
                    icon.src = "../images/weather/night_clear.ico";
                    console.log("night clear");
                    break;
                // Check for daytime light clouds
                case (code = 801):
                case (code = 803):
                case (code = 804):
                    icon.src = "../images/weather/night_cloudy_light.ico";
                    console.log("night light clouds");
                    break;
                // Check for daytime heavy clouds
                case (code = 802):
                    icon.src = "../images/weather/night_cloudy_heavy.ico";
                    console.log("night heavy clouds");
                    break;
                default:
                    break;
            }
        }
    }
}