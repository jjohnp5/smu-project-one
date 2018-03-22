;(function(){
    $('#signing-out-modal').addClass('display');
    let db = firebase.database();
    console.log(firebase.User.uid);
    let provider = new firebase.auth.GoogleAuthProvider();
    $(document).on('click', '.google-signin', function () {
        let self = this;
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(function () {

                    return firebase.auth().signInWithPopup(provider);
                    // .then(function (result) {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    // var token = result.credential.accessToken;
                    // The signed-in user info.
                    // var user = result.user;
                    // ...
                    // console.log(user);
                    // if (user) {
                    //     $(self).hide();
                    // }

                    //   $('.event-list').append($('<button>').text("Auth").on('click', function(e){
                    //       db.ref(`${user.uid}/events`).push("event");
                    //   }))
                    // db.ref(`${user.uid}/events`).on('value', function (d) {
                    //     console.log(d.val());
                    // })
                // });
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
    firebase.auth().onAuthStateChanged(function(user){
        $('.signer').empty();
        if(user){
            $('.signer').append($('<button class="sign-out">').text('Sign Out'));
              $('.event-list').append($('<button>').text("Auth").on('click', function(e){
                          db.ref(`${user.uid}/events`).push("event");
                      }))
                        db.ref(`${user.uid}/events`).on('value', function (d) {
                        console.log(d.val());
                    })
        }
        else{
            $('.signer').append($('<button class="google-signin">').text('Google Sign In'));
        }
    })
    $(document).on('click','.sign-out', ()=>{
        // let sOut = gapi.auth2.getAuthInstance();
        // sOut.signout().then(function(){
            console.log('button hit');
            $('#signing-out-modal').removeClass('display');
            setTimeout(function(){
                firebase.auth().signOut().then(()=>{
                $('#signing-out-modal').addClass('display');
                console.log('sign out done');
            })
        },3000);
        // })
    })

    let $listItems;
    function show_alert(loc, cat) {
        let lat = "";
        let long = "";
        let weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
        let weatherAPI = "44df1c912088b9675614938b52bcbd0e";
        let now = moment();

        let oArgs = {
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
    $('#category').on('keyup', function (e) {
        let self = $(this);

        if (e.keyCode == 40 || e.keyCode == 38) return;

        $.ajax({
            url: "https://api.eventful.com/json/categories/list?app_key=2DXR829kvdp9JrdB",
            method: 'GET',
            dataType: 'jsonp',
            crossDomain: true
        }).done(function (data) {
            $('.cat').empty();
            data.category.forEach(cat => {
                if (cat.id.indexOf(self.val().trim()) !== -1) {
                    $('.cat').append($('<li>').text(cat.id).on('click', function () {
                        $('#category').val(cat.id)
                        $('.cat').empty();
                    }).on('mouseover', function () {
                        $('.cat li').removeClass('selected');
                        $(this).addClass('selected');
                        self.val($(this).text());
                    }));
                }
            })
            $listItems = $('.cat li');
        })
    })
        .on('focus', function () {
            if (!$(this).val()) {
                $('.cat').html($('<h5>').text("Start typing for available categories.."));
            }
        }).on('blur', function () {
            $('.cat').empty();
        })
    $("button").on('click', (e) => {
        e.preventDefault();
        show_alert($('#location').val().trim(), $('#category').val().trim());
    })


    $('#category').on('keydown', function (e) {

        let key = e.keyCode,
            $selected = $listItems.filter('.selected'),
            $current;

        if (key != 40 && key != 38) return;

        $listItems.removeClass('selected');

        if (key == 40) // Down key
        {
            if (!$selected.length || $selected.is('li:last-child')) {

                $current = $listItems.eq(0);
                console.log($current);
            }
            else {
                $current = $selected.next();
            }
        }
        else if (key == 38) // Up key
        {
            if (!$selected.length || $selected.is('li:first-child')) {
                $current = $listItems.last();
            }
            else {
                $current = $selected.prev();
            }
        }
        $(this).val($current.text());
        $current.addClass('selected');

    });

    function initMap(lat, long, eventData) {
        let infoWindow = new google.maps.InfoWindow;
        let uluru = { lat: lat, lng: long };
        infoWindow.setPosition(uluru);

        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: uluru
        });
        let marker = new google.maps.Marker({
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

})();