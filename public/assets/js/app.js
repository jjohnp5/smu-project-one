;(function(){
  
    let user = "";
    let db = firebase.database();
    let provider = new firebase.auth.GoogleAuthProvider();
    $(document).on('click', '.google-signin', function () {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function () {
            return firebase.auth().signInWithPopup(provider);

            // })
            // ..then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            //   var token = result.credential.accessToken;
            // The signed-in user info.
            //   var user = result.user;
            // ...
            //   console.log(user);

            //   $('.event-list').append($('<button>').text("Auth").on('click', function(e){
            //       db.ref(`${user.uid}/events`).push("event");
            //   }))
            //   db.ref(`${user.uid}/events`).on('value', function(d){
            //       console.log(d.val());
            //   })
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    });
    firebase.auth().onAuthStateChanged(function (user) {
        $('.authentication').empty();
        if (user) {
            $('.authentication').append($('<button class="sign-out btn btn-outline-danger my-2 my-sm-0">').text("Sign Out"));
            user = user;
            console.log(user);

        } else {
            $('.authentication').append($('<button class="google-signin btn btn-outline-primary my-2 my-sm-0">').text("Sign in with Google"));
        }
    })
    $(document).on('click', '.sign-out', function () {
        firebase.auth().signOut();
    })


    let $listItems;
    function show_alert(loc, cat) {
        var lat = "";
        var long = "";
        var weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
        var weatherAPI = "44df1c912088b9675614938b52bcbd0e";
        var now = moment();

        var oArgs = {
            method: 'GET',
            url: "https://api.eventful.com/json/events/search",
            data: {
                app_key: "2DXR829kvdp9JrdB",

                location: loc,
                category: cat,
                // page_size: 25,
                sort_order: 'popularity',
                date: "Next Week"
            },
            dataType: 'jsonp',
            crossDomain: true

        };

        var weatherObj = {
            url: "https://api.openweathermap.org/data/2.5/weather",
            method: "GET",
            data: {
                appid: weatherAPI,
                q: loc
            },
        };

        $.ajax(oArgs)
            .then(function (oData) {
                if (!oData.events) {
                    alert('No events on the city selected, please try again.');
                    $('#location').val('').focus();
                    return;
                }
                lat = parseFloat(oData.events.event[0].latitude);
                long = parseFloat(oData.events.event[0].longitude)
                console.log(oData);
                let eventData = {
                    title: oData.events.event[0].title,
                    venue_name: oData.events.event[0].venue_name,
                    venue_address: oData.events.event[0].venue_address,
                    city_name: oData.events.event[0].city_name,

                }

                initMap(lat, long, eventData);
                $('.event-list').empty();
                oData.events.event.forEach((event) => {
                    content = $('<div class="event">');
                    title = $('<h4>').text(event.title);
                    venue_name = $('<p>').text(event.venue_name);
                    venue_address = $('<p>').text(event.venue_address).on('click', (e) => {
                        initMap(parseFloat(event.latitude), parseFloat(event.longitude), { title: event.title, venue_name: event.venue_name, venue_address: event.venue_address, city_name: event.city_name })
                    });
                    city_name = $('<p>').text(event.city_name);
                    content.append(title, venue_name, venue_address, city_name);
                    $('.event-list').append(content);
                })

            })

        // Weather AJAX Call
        $.ajax(weatherObj).then(data => {
            var tempConverted = parseInt((data.main.temp * (9 / 5) - 459.67));
            var sunriseTime = moment.unix(data.sys.sunrise).format("HH:mm");
            var sunsetTime = moment.unix(data.sys.sunset).format("HH:mm");
            console.log("sunrise: " + sunriseTime);
            console.log("sunset: " + sunsetTime);
            console.log(now.diff(moment(data.sys.sunrise), "hours"));
            $("#temp").append(tempConverted);
        });

    }
    const categ = document.querySelector('#category');
    $('.cat').css({ position: "absolute", top: `${categ.getBoundingClientRect().top + categ.offsetHeight}px`, left: `${categ.getBoundingClientRect().left}px`, width: `${categ.offsetWidth}px`, zIndex: 999, backgroundColor: "white" })
    $('#category').on('click', function (e) {
        let self = $(this);


        $.ajax({
            url: "https://api.eventful.com/json/categories/list?app_key=2DXR829kvdp9JrdB",
            method: 'GET',
            dataType: 'jsonp',
            crossDomain: true
        }).done(function (data) {
            data.category.forEach(cat => {
                    self.append($('<option>').text(cat.id).on('click', function () {
                        $('#category').val(cat.id)
                    })

                );

            })
            $listItems = $('#category option');
        })
    })

    $("button").on('click', (e) => {
        e.preventDefault();
        show_alert($('#location').val().trim(), $('#category').val().trim());
    })
    function initMap(lat, long, eventData) {
        var infoWindow = new google.maps.InfoWindow;
        var uluru = { lat: lat, lng: long };
        infoWindow.setPosition(uluru);

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
        marker.addListener('click', function (e) {
            infoWindow.open(map);
            infoWindow.setContent(`
                <div>
                    <h3>${eventData.title}</h3>
                    <h5>${eventData.venue_name}</h5>
                    <p>${eventData.venue_address}</p>
                    <p>${eventData.city_name}</p>

                </div>

            `);
        });
    }

    

})()
