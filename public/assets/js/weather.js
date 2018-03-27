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

// OpenWeather API key
var weatherAPI = "44df1c912088b9675614938b52bcbd0e";

// Get weather details based on longitude and latitude
function getEventWeather(long, lat) {
    var latitude = lat;
    var longitude = long;

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

        // Convert temperature from Kelvin to Celsius
        var tempConverted = parseInt((data.main.temp * (9 / 5) - 459.67));

        // Convert sunrise & sunset times from UNIX format to military time
        var sunriseTime = moment.unix(data.sys.sunrise).format("HH:mm");
        var sunsetTime = moment.unix(data.sys.sunset).format("HH:mm");

        // Calculate the time of day
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
    });
}

// Sets weather details based on weather code and current temp
function setWeatherIcon(code, temp) {

    // Set static location for weather icons
    var imgSrc = "./assets/images/weather/";

    // Set static HTML to be used for displaying current temperature
    var tempHTML = "<span>Current Temp: " + temp + "&deg; </span>";

    // Set icons for daytime weather codes
    if (timeOfDay === "day") {

        // For each statement that is true, assign the appropriate temp and weather icon
        switch (true) {

            // Thunderstorms
            case ((code > 199) && (code < 300)):
                icon.src = imgSrc + "day_tstorms.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Light Rain
            case ((code > 299) && (code < 400)):
                icon.src = imgSrc + "day_rain_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Heavy Rain
            case ((code > 499) && (code < 600)):
                icon.src = imgSrc + "cloudy_heavy_showers.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Environmental Conditions (i.e. tornado, dust storms, etc.)
            case ((code > 699) && (code < 800)):
                icon.src = imgSrc + "cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Clear Skies
            case (code === 800):
                icon.src = imgSrc + "day_clear.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Light Clouds
            case ((code === 801) || (code === 803) || (code === 804)):
                icon.src = imgSrc + "day_cloudy_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Heavy Clouds
            case (code === 802):
                icon.src = imgSrc + "day_cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;
            default:
                console.log("Unable to get weather code.");
                break;
        }
    }

    // Set icon for nighttime weather codes
    else {

        // For each statement that is true, assign the appropriate temp and weather icon
        switch (true) {

            // Thunderstorms
            case ((code > 199) && (code < 300)):
                icon.src = imgSrc + "night_tstorms.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Light Rain
            case ((code > 299) && (code < 400)):
                icon.src = imgSrc + "night_rain_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Heavy Rain
            case ((code > 499) && (code < 600)):
                icon.src = imgSrc + "cloudy_heavy_showers.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Environmental Conditions (i.e. tornado, dust storms, etc.)
            case ((code > 699) && (code < 800)):
                icon.src = imgSrc + "cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Clear Skies
            case (code === 800):
                icon.src = imgSrc + "night_clear.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Light Clouds
            case ((code === 801) || (code === 803) || (code === 804)):
                icon.src = imgSrc + "night_cloudy_light.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;

            // Heavy Clouds
            case (code === 802):
                icon.src = imgSrc + "night_cloudy_heavy.ico";
                document.getElementById("weather").innerHTML = tempHTML;
                document.getElementById("weather").appendChild(icon);
                break;
            default:
                document.getElementById("weather").innerHTML = tempHTML;
                console.log("Unable to get weather code.");
                break;
        }
    }
}