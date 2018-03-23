// Variables represent date and time data
var currentDate = moment().format("YYYYMMDD00");
var currentTime = moment().format("HH:mm");
var nextWeek = moment().add(7, "days").format("YYYYMMDD00");
var twoWeeks = moment().add(14, "days").format("YYYYMMDD00");
var timeOfDay = "";

// Variable to hold weather code returned from API
var weatherCode;

// Creates a new image of 90px by 90px
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
        setWeatherIcon(weatherCode, tempConverted);

        console.log("sunrise: " + sunriseTime);
        console.log("sunset: " + sunsetTime);
        console.log("Current temp: " + tempConverted);
        console.log("Weather code: " + weatherCode);
        console.log("Time of day: " + timeOfDay);
    });
}

// Sets weather details based on weather code and current temp
function setWeatherIcon(code, temp) {
    // var timeHTML = "<span>Current Time: " + moment().format("H:mm") + "</span><br/>";
    // var dateHTML = "<span>Current Date: " + moment().format("MM-DD-YYYY") + "</span><br/>";
    var imgSrc = "./assets/images/weather/";
    var tempHTML = "<span>Current Temp: " + temp + "&deg; </span>";


    // Set icons for daytime weather code
    if (timeOfDay === "day") {
        switch (code) {

            // Thunderstorms
            case (code > 199):
            case (code < 300):
                icon.src = imgSrc + "day_tstorms.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day thunderstorms");
                break;

            // Light Rain
            case (code > 299):
            case (code < 400):
                icon.src = imgSrc + "day_rain_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day light rain");
                break;

            // Heavy Rain
            case (code > 499):
            case (code < 600):
                icon.src = imgSrc + "day_rain_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day heavy rain");
                break;

            // Environmental Conditions (i.e. tornado, dust storms, etc.)
            case (code > 699):
            case (code < 800):
                icon.src = imgSrc + "cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day clouds");
                break;

            // Clear Skies
            case (code = 800):
                icon.src = imgSrc + "day_clear.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day clear");
                break;

            // Light Clouds
            case (code = 801):
            case (code = 803):
            case (code = 804):
                icon.src = "./assets/images/weather/cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day light clouds");
                break;

            // Heavy Clouds
            case (code = 802):
                icon.src = imgSrc + "day_cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("day heavy clouds");
                break;
            default:
                break;
        }
    }

    // Set icon for nighttime weather code
    else {
        switch (code) {

            // Thunderstorms
            case (code > 199):
            case (code < 300):
                icon.src = imgSrc + "night_tstorms.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night thunderstorms");
                break;

            // Light Rain
            case (code > 299):
            case (code < 400):
                icon.src = imgSrc + "night_rain_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night light rain");
                break;

            // Heavy Rain
            case (code > 499):
            case (code < 600):
                icon.src = imgSrc + "night_rain_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night heavy rain");
                break;

            // Environmental Conditions (i.e. tornado, dust storms, etc.)
            case (code > 699):
            case (code < 800):
                icon.src = imgSrc + "cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night clouds");
                break;

            // Clear Skies
            case (code = 800):
                icon.src = imgSrc + "night_clear.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night clear");
                break;

            // Light Clouds
            case (code = 801):
            case (code = 803):
            case (code = 804):
                icon.src = imgSrc + "night_cloudy_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night light clouds");
                break;

            // Heavy Clouds
            case (code = 802):
                icon.src = imgSrc + "night_cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                console.log("night heavy clouds");
                break;
            default:
                break;
        }
    }
}
