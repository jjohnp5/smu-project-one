; (function () {
    $('.selected-event').hide();
    let user = "";
    let db = firebase.database();
    let provider = new firebase.auth.GoogleAuthProvider();
    let selectedEventRender;
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
        $(document).off('click', '.add-to-event');
        $('.selected-event').empty().slideUp(500);
    
        if (user) {
            $('.authentication').hide();
            // $('.logged-in-popup').hide();
            // $('.logged-in-only').off();
            $('.logged-in-only').show()
            
            // .on('click', function(){
            //     $('.logged-in-popup').css({
            //         position: 'absolute', 
            //         top: `${document.querySelector('.logged-in-only').getBoundingClientRect().bottom}px`,
            //         // right: `${document.querySelector('.logged-in-only').offsetLeft + document.querySelector('.logged-in-only').offsetWidth}px`
            //         right: '50px'
            // })('')
            console.log(user);
            
            $('.logged-in-btn')
                .popover({
                content: `
                    <div class="popover-container">
                        <div class="row">
                        <div class="col-12">
                        <p>${user.email}</p>
                            </div>
                            <div class="col-8 offset-2">
                        <img src="${user.photoURL}" class="img-fluid">
                            </div>
                            <div class="col-6">
                                <button class="btn btn-success my-events">My Events</button>
                            </div>
                            <div class="col-6">
                        <button class="btn btn-outline-danger sign-out">Sign Out</button>
                            </div>
                        </div>
                    </div>
                `,
                
                // $(`<div>`).append($(`<p>`).text(user.email)).append(
                //     $('<button>').addClass('btn btn-outline-danger sign-out').text('Sign Out'))
                // ,
                placement: 'bottom',
                title: user.displayName,
                html: true
            })
            
            // })
            // $('.authentication').append($('<button class="sign-out btn btn-outline-danger my-2 my-sm-0">').text("Sign Out"));
            user = user.uid;
            console.log(user);
            let currentEvent = ""
            $(document).on('click', '.add-to-event', function () {
                currentEvent = $(this)
                if ($(this).data('action') === "add") {
                    db.ref(`/${user}/events`).push($(this).data('id'));
                    $(this).data('action', 'delete').html(`&times; Remove from Events`).removeClass('btn-success').addClass('btn-danger');

                } else {
                    db.ref(`/${user}/events`).once('value').then(function (d) {
                        d.forEach(f =>{
                            let current = f.val();
                            if(current === currentEvent.data('id')){
                                currentEvent.data('action', "add").html(`&#43; Add to My Events`).removeClass('btn-danger').addClass('btn-success');
                                db.ref(`/${user}/events/${f.key}`).remove();

                            }
                        })
                    })
                }
            })
            selectedEventRender = function(eventInfo) {
                let eventDiv = $('.selected-event');
                eventDiv.empty();
                eventDiv.append($('<div class="row loader">').append($('<img class="img-responsive">').attr('src', './assets/images/Loading_icon.gif')));
                eventDiv.slideDown(500)
                let row = $('<div class="row">');
                let col_1 = $('<div class="col-sm-4 img-cont">');
                let col_2 = $('<div class="col-sm-4">');
                col_1.append($('<img class="img-fluid">').attr('src', eventInfo.image));
                let title = $('<h5>').text(eventInfo.title);
                let venue = $('<p>').text(eventInfo.venue);
                let address = $('<p>').text(eventInfo.address);
                let description = $('<p>').text(eventInfo.description);
                let addToEvents = "";
                let getTickets = $('<button class="btn btn-primary add-to-event">').text("Get Tickets").data({ id: eventInfo.id, event: eventInfo.directLink});

                console.log(firebase.auth().currentUser);
                    db.ref(`/${firebase.auth().currentUser.uid}/events`).once('value', function (d) {
                        d.forEach(e => {
                           let f = e.val();
                            if (f === eventInfo.id) {
                                addToEvents = $('<button class="btn btn-danger add-to-event">').html(`&times; Remove from Events`).data({ id: eventInfo.id, event: eventInfo.directLink, action: "delete" });
                            }
                        })
                        if (!addToEvents) {
                            addToEvents = $('<button class="btn btn-success add-to-event">').html(`&#43; Add to My Events`).data({ id: eventInfo.id, event: eventInfo.directLink, action: "add" });
                        }
                        col_2.append(title, venue, address, description, getTickets,addToEvents);
                        setTimeout(function () {
                        eventDiv.empty();
                        row.append(col_1, col_2);
                        eventDiv.append(row);
                        }, 1000)
                        
                    })
                    
                }
                
            
        } else {
            $('.authentication').show();
            $('.logged-in-only').hide();
            $('[data-toggle=popover]').popover('hide');
            // $('.logged-in-popup').hide();
            $('.authentication').append($('<button class="google-signin btn btn-outline-primary my-2 my-sm-0">').text("Sign in with Google"));
            $(document).on('click', '.add-to-event', function () {

                window.open($(this).data('event'));
            })
            selectedEventRender = function(eventInfo) {
                let eventDiv = $('.selected-event');
                eventDiv.empty();
                eventDiv.append($('<div class="row loader">').append($('<img class="img-responsive">').attr('src', './assets/images/Loading_icon.gif')));
                eventDiv.slideDown(500)
                let row = $('<div class="row">');
                let col_1 = $('<div class="col-sm-4 img-cont">');
                let col_2 = $('<div class="col-sm-4">');
                col_1.append($('<img class="img-fluid">').attr('src', eventInfo.image));
                let title = $('<h5>').text(eventInfo.title);
                let venue = $('<p>').text(eventInfo.venue);
                let address = $('<p>').text(eventInfo.address);
                let description = $('<p>').text(eventInfo.description);
                let addToEvents = $('<button class="btn btn-primary add-to-event">').text("Get Tickets").data({ id: eventInfo.id, event: eventInfo.directLink});
                col_2.append(title, venue, address, description, addToEvents);
                setTimeout(function () {
                eventDiv.empty();
                row.append(col_1, col_2);
                eventDiv.append(row);
                }, 1000)
                }
        }
    })
    $(document).on('click', '.sign-out', function () {
        firebase.auth().signOut();
    })


    let $listItems;
    function show_alert(loc, cat) {
        $('#loading').removeClass('display');
        $('#location').popover('hide');
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
                    $('#loading').addClass('display');
                    $('#location').val('').focus();
                    $('#location').popover({content: 'Location not found. Please try again.', trigger: 'focus click', placement: 'bottom'});
                    $('#location').popover('show');
                    
                }else{
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
                if ($('.carousel').flickity()) {
                    $('.carousel').flickity('destroy');
                }
                $('.carousel').empty();
                oData.events.event.forEach((event) => {
                    let eventData = {
                        lat: event.latitude,
                        long: event.longitude,
                        title: event.title,
                        address: event.venue_address,
                        venue: event.venue_name,
                        description: event.description,
                        city: event.city_name,
                        id: event.id,
                        directLink: event.url,
                        performers: event.performers,
                        image: event.image ? event.image.medium.url : "./assets/images/out&about.jpg"


                    }
                    let wrapper = $('<div class="carousel-cell">');
                    let card = $('<div class="card">');
                    let cardImg = $('<img class="img-responsive card-img-top">').attr('src', event.image ? event.image.medium.url : "./assets/images/out&about.jpg");
                    let cardBody = $('<div class="card-body">');
                    let title = $('<h6>').text(event.title);
                    let venue_name = $('<p>').text(event.venue_name);
                    let venue_address = $('<p>').text(event.venue_address).on('click', (e) => {
                        initMap(parseFloat(eventData.lat), parseFloat(eventData.long), { title: event.title, venue_name: event.venue_name, venue_address: event.venue_address, city_name: event.city_name })
                    });
                    let city_name = $('<p>').text(event.city_name);
                    let moreInfo = $('<button class="btn btn-primary">').text("More info").on('click', () => {
                        selectedEventRender(eventData);
                    })
                    cardBody.append(title, venue_name, venue_address, city_name, moreInfo);
                    card.append(cardImg, cardBody);
                    wrapper.append(card);
                    $('.carousel').append(wrapper);
                })
                $('.carousel').flickity({ autoPlay: true, adaptiveHeight: true, setGallerySize: false });
                $('#loading').addClass('display');
            }
            }).catch(err =>{
                $('#loading').addClass('display');
                $('#location').val('').focus();
                $('#location').popover({content: 'Location not found. Please try again.'});
                $('#location').popover('show');
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
    $('#location').on('click', function (e) {
        
        let self = $('#category');


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

    $("#search").on('click', (e) => {
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
