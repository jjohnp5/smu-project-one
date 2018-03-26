; (function () {
    $('.selected-event').hide();
    let user = "";
    let db = firebase.database();
    let provider = new firebase.auth.GoogleAuthProvider();
    let selectedEventRender;
    window.onload = function(){
        runSearch("dallas", $('#category').val(), $('#date').val(), "");
    }
    // Add event listener when user signs in.
    $(document).on('click', '.google-signin', function () {
        //start a firebase process to authenticate user using google credentials to log in.
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function () {
            return firebase.auth().signInWithPopup(provider);
        }).catch(function (error) {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;
            // The email of the user's account used.
            let email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            let credential = error.credential;
            // ...
        });
    });
    //When ever user signs in or signs out, code runs.
    firebase.auth().onAuthStateChanged(function (user) {
        //empty and resets page.
        $('.authentication').empty();
        $('.logged-in-btn').popover('hide');
        $('.logged-in-only').empty();
        //remove event listener for adding event to add-to-events buttons.
        $(document).off('click', '.add-to-event');
        $('.selected-event').empty().slideUp(500);
        $('#map').addClass('display');
        $('#weather').addClass('display');
        //check if user is authenticated.
        if (user) {
            $('.authentication').hide();
            $('.logged-in-only').append(
                $(`<button class="btn btn-outline-info logged-in-btn" data-toggle="popover">`).html(`${user.displayName} <i class="material-icons">keyboard_arrow_down</i>`)
            ).show();

            //add event listener when My Events button is clicked.
            $(document).on('click', '.my-events', renderMyEvents)
            //add listener when a single event from list is clicked. pull data object linked to the
            // event and render data to DOM.
            $(document).on('click', '.my-single-event', function(){
                let self = $(this);
                //remove event-selected class from all the events on the list.
                $('.my-single-event').removeClass('event-selected')
                //add event-selected class the the one clicked.
                self.addClass('event-selected');
                //gather all the data from the selected event and push to the DOM.
                $('.my-event-title').text(self.data('title'));
                $('.my-event-venue').text(self.data('venue'));
                $('.my-event-address').text(self.data('address'));
                $('.my-event-city').text(self.data('city'));
                $('.my-event-state').text(self.data('state'));
                $('.my-event-description').html(self.data('desc'));
                $('.my-event-img').attr('src', self.data('img'));
                $('.remove-button').data('id', self.data('id'));
                //add click handler for clicking get-tickets button to go to the eventful link.
                $('.single-get-tickets').off().on('click', function(){
                    window.open(self.data('url'));
                })
                //draw map of the location of the event.
                initMap(parseFloat(self.data('lat')), parseFloat(self.data('long')), {
                    title: self.data('title'),
                    venue_name: self.data('venue'),
                    venue_address: self.data('address'),
                    city_name: self.data('city')
                }, 'my-event-map');
                //display the contents of the event.
                $('.my-event-full').removeClass('display');
                
            })
            // initialie pop over for logged in button.
            $('.logged-in-btn')
                .popover({
                    //create a template for the my-account information popover.
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
                    placement: 'bottom',
                    title: user.displayName,
                    html: true
                })
            user = user.uid;
            let currentEvent = "";
            // add event listener to add-to-event button
            //button toggles from add to event to remove from events depending if event is currently
            //on the user's list of saved events on the db.
            $(document).on('click', '.add-to-event', function () {
                currentEvent = $(this)
                if ($(this).data('action') === "add") {
                    db.ref(`/${user}/events`).push($(this).data('id'));
                    $(this).data('action', 'delete').html(`&times; Remove from Events`).removeClass('btn-success').addClass('btn-danger');

                } else {
                    db.ref(`/${user}/events`).once('value').then(function (d) {
                        d.forEach(f => {
                            let current = f.val();
                            if (current === currentEvent.data('id')) {
                                currentEvent.data('action', "add").html(`&#43; Add to My Events`).removeClass('btn-danger').addClass('btn-success');
                                db.ref(`/${user}/events/${f.key}`).remove();

                            }
                        })
                    })
                }
            })
            //change the value of the selectedEventRender function depending if user is logged in
            // or not
            //This is when user is signed in.
            selectedEventRender = signedInEventRender;
            $('.remove-button').on('click', function(){
                let self = $(this);
                db.ref(`/${user}/events`).once('value').then(function (d) {
                    d.forEach(f => {
                        let current = f.val();
                        if (current === self.data('id')) {
                            db.ref(`/${user}/events/${f.key}`).remove();
                            renderMyEvents()
                        }
                    })
                })
            })
            function renderMyEvents(){
                //reset the page.
                
                $('.home-container').hide();
                $('.my-event-list').empty();
                $('.logged-in-btn').popover('hide');
                $('.my-event-full').addClass('display');
                //check in with firebase and check user's listed events on their account.
                db.ref(`/${user}/events`).once('value').then(function(oData){
                    oData.forEach(d =>{
                        //run an ajax function to pull event information per event existing on user's account.
                        $.ajax({
                            url: `https://api.eventful.com/json/events/get`,
                            method: 'GET',
                            data: {
                                app_key: '2DXR829kvdp9JrdB',
                                id: d.val(),
                                image_sizes: 'large'
                            },
                            dataType: 'jsonp',
                            crossDomain: true
                        }).then(data => {
                            // push the events to the user's event list
                            $('.my-event-list').append($('<li class="my-single-event">').text(data.title).data({
                                title: data.title,
                                id: data.id,
                                venue: data.venue_name,
                                address: data.address,
                                city: data.city,
                                state: data.region,
                                img: data.images ? data.images.image[0] ? data.images.image[0].large.url : data.images.image.large.url ? data.images.image.large.url : "./assets/images/out&about.jpg" : "./assets/images/out&about.jpg",
                                desc: data.description,
                                lat: data.latitude,
                                long: data.longitude,
                                start: data.start_time,
                                end: data.end_time,
                                url: data.url
                            }))
                        })
                    })
                })
                // display my events list
                $('.my-events-container').removeClass('display');
        
            }



        } else {
            //reset DOM.
            $('.authentication').show();
            $('.logged-in-only').hide();
            $('[data-toggle=popover]').popover('hide');
            $('.authentication').append($('<button class="google-signin btn btn-outline-primary my-2 my-sm-0">').text("Sign in with Google"));
            //reassign the selectedEventRender for users not signed in.
            selectedEventRender = signedOutEventRender;
        }
    })
    //sign out from firebase.
    $(document).on('click', '.sign-out', function () {
        firebase.auth().signOut();
    })


    let $listItems;
    //search function gets called when searching.
    function runSearch(loc, cat, date, page) {
        //show loading modal.
        $('#loading').removeClass('display');
        //hide popover for the location when location is not found.
        $('#location').popover('hide');
        let lat = "";
        let long = "";
        //create a set of arguments for the Ajax request.
        let oArgs = {
            method: 'GET',
            url: "https://api.eventful.com/json/events/search",
            //request queries that get sent with the AJAX request here.
            data: {
                app_key: "2DXR829kvdp9JrdB",

                location: loc,
                category: cat,
                page_size: 15,
                sort_order: 'popularity',
                date: "Next Week",
                image_sizes: "large",
                date: date,
                page_number: page ? page : 1
            },
            //the Api endpoint is a full json endpoint and just returning json
            dataType: 'jsonp',
            crossDomain: true

        };
        //run ajax funtion.
        $.ajax(oArgs)
            .then(function (oData) {
                if (!oData.events) {
                    //if the request did not return anything, show this popover
                    $('#loading').addClass('display');
                    $('#location').val('').focus();
                    $('#location').popover({ content: 'Location not found. Please try again.', trigger: 'focus click', placement: 'bottom' });
                    $('#location').popover('show');

                } else {
                    // grab all data that came with request
                    lat = parseFloat(oData.events.event[0].latitude);
                    long = parseFloat(oData.events.event[0].longitude)
                    getEventWeather(long, lat);
                    //Pagination settings for the search.
                    let currentPage = parseInt(oData.page_number);
                    let nextPage = currentPage + 1;
                    let previousPage = currentPage - 1;
                    $('.previous-page').show();
                    $('.next-page').show();
                    if(previousPage <= 0){
                        $('.previous-page').hide();
                    }
                    if(nextPage >= parseInt(oData.page_count)){
                        $('.next-page').hide();
                    }
                    $('.previous-page').data('page', previousPage);
                    $('.previous-page a').text(previousPage);
                    $('.current-page').data('page', currentPage);
                    $('.current-page a').text(currentPage);
                    $('.next-page').data('page', nextPage);
                    $('.next-page a').text(nextPage);
                    $('.last-page').data('page', oData.page_count);
                    // display pagination
                    $('.pagination').removeClass('display');
                    getEventWeather(long, lat);

                    //event Data for map, will get overwritten after map is rendered.
                    let eventData = {
                        title: oData.events.event[0].title,
                        venue_name: oData.events.event[0].venue_name,
                        venue_address: oData.events.event[0].venue_address,
                        city_name: oData.events.event[0].city_name,

                    }
                    // initialize map using the event data above
                    initMap(lat, long, eventData, 'map');
                    // if there is a carousel, destroy it and recreate later.
                    if ($('.carousel').flickity()) {
                        $('.carousel').flickity('destroy');
                    }
                    // reset carousel
                    $('.carousel').empty();
                    oData.events.event.forEach((event) => {
                        let eventData = {
                            lat: event.latitude,
                            long: event.longitude,
                            title: event.title,
                            event: event.url,
                            address: event.venue_address,
                            venue: event.venue_name,
                            description: event.description,
                            city: event.city_name,
                            id: event.id,
                            directLink: event.url,
                            performers: event.performers,
                            image: event.image ? event.image.large.url : "./assets/images/out&about.jpg"


                        }
                        // appending items to carousel can only be done in JS, can't be done by just referencing
                        let wrapper = $('<div class="carousel-cell">');
                        let card = $('<div class="card">');
                        let cardImg = $('<img class="img-fluid card-img-top">').attr('src', event.image ? event.image.large.url : "./assets/images/out&about.jpg");
                        let cardBody = $('<div class="card-body">');
                        let title = $('<h6>').text(event.title);
                        let venue_name = $('<p>').text(event.venue_name);
                        //create a venue address paragraph and add a listener for it to update map when clicked.
                        let venue_address = $('<p>').text(event.venue_address).on('click', (e) => {
                            initMap(parseFloat(eventData.lat), parseFloat(eventData.long), { title: event.title, venue_name: event.venue_name, venue_address: event.venue_address, city_name: event.city_name },'map')
                        });
                        let city_name = $('<p>').text(event.city_name);
                        let day = moment(event.start_time).format("dddd, MMMM Do YYYY, h:mm:ss a");
                        let date = $('<p>').text(day);
                        //create a more info button when clicked will render the event, will use either the signed out or signed in option of the render event.
                        let moreInfo = $('<button class="btn btn-primary">').text("More info").on('click', () => {
                            selectedEventRender(eventData);
                            initMap(parseFloat(eventData.lat), parseFloat(eventData.long), { title: event.title, venue_name: event.venue_name, venue_address: event.venue_address, city_name: event.city_name },'map')
                        })
                        //append all the items to each other, starting from the deepest of the box working its way to the largest(shallow).
                        cardBody.append(title, venue_name, venue_address, city_name,date, moreInfo);
                        card.append(cardImg, cardBody);
                        wrapper.append(card);
                        //recreate carousel.
                        $('.carousel').append(wrapper);
                    })
                    //reintialize carousel that was destroyed above.
                    // hide the loading modal
                    // show the current event
                    $('.carousel').flickity({ autoPlay: true, adaptiveHeight: true, setGallerySize: false });
                    $('#loading').addClass('display');
                    $('.current-event').show();
                }
                //catch errors of the request.
            }).catch(err => {
                $('#loading').addClass('display');
                $('#location').val('').focus();
                $('#location').popover({ content: 'Location not found. Please try again.', placement: 'bottom' });
                $('#location').popover('show');
            })

    }
    const categ = document.querySelector('#category');
    // search box clicked function
    $('#location').on('click', function (e) {
        // destroy popover and toggle the Advanced search container
        $('#location').popover('dispose');
        $(".searchAdvanced").toggle();
        let self = $('#category');

        //pull the categories available in eventful API. any changes they make to their categories contents will auto update by doing this.
        $.ajax({
            url: "https://api.eventful.com/json/categories/list?app_key=2DXR829kvdp9JrdB",
            method: 'GET',
            dataType: 'jsonp',
            crossDomain: true
        }).done(function (data) {
            data.category.forEach(cat => {
                // append every category to the option box for categories
                self.append($('<option>').text(cat.id).on('click', function () {
                    $('#category').val(cat.id)
                })

                );

            })
            // set category options are list items
            $listItems = $('#category option');
        })
    })
    
    $('.navbar-brand').on('click', function(){
        //when logo is clicked, hide my-events-container and show the home container. does not refresh the page.
        $('.my-events-container').addClass('display');
        $('.home-container').show();
        $('.logged-in-btn').popover('hide');
    })
    $("#search").on('click', (e) => {
        //prevent the default submission of form.
        e.preventDefault();
        // .addClass(display) is hiding the elements see style.css.
        $('.pagination').addClass('display');
        $('.my-events-container').addClass('display');
        $('.home-container').show();
        $('.selected-event').empty().slideUp(500);
        $('#map').addClass('display');
        $('#weather').addClass('display');
        $('.logged-in-btn').popover('hide');
        //run a search.
        runSearch($('#location').val().trim(), $('#category').val().trim(), $('#date').val());
    });
    $(document).on('click', '.get-tickets', function () {
        //open the eventful page in another tab to buy tickets. they do not provide the direct link to buy tickets through their api.
        window.open($(this).data('event'));
    })
    $('.pagination li').on('click', function(){
        // will only run if they are not trying to click on the current page button
        if(!$(this).hasClass('current-page')){
            
        runSearch($('#location').val().trim() ? $('#location').val().trim() : "dallas", $('#category').val().trim(), $('#date').val(), $(this).data('page'));
        }
    });
    
    function signedInEventRender(eventInfo) {
        let eventDiv = $('.selected-event');
        eventDiv.empty();
        eventDiv.append($('<div class="row loader">').append($('<img class="img-responsive">').attr('src', './assets/images/Loading_icon.gif')));
        eventDiv.slideDown(500)
        // create a row container
        let row = $('<div class="row">');
        //img container
        let col_1 = $('<div class="col-sm-4 img-cont">');
        //more info container
        let col_2 = $('<div class="col-sm-4">');
        //add image to img container.
        col_1.append($('<img class="img-fluid">').attr('src', eventInfo.image));
        //create more info elements.
        let title = $('<h5>').text(eventInfo.title);
        let venue = $('<p>').text(eventInfo.venue);
        let address = $('<p>').text(eventInfo.address);
        let city = $('<p>').text(eventInfo.city);
        //create a date time string representation of the start time of event.
        let day = moment(event.start_time).format("dddd, MMMM Do YYYY, h:mm:ss a");
        let date = $('<p>').text(day);
        //create a description container.
        let description = $('<div class="col-12">').append($('<div class="description">').html(eventInfo.description));
        let addToEvents = "";
        //create a get-tickets button
        let getTickets = $('<button class="btn btn-primary get-tickets">').text("Get Tickets").data({ id: eventInfo.id, event: eventInfo.directLink });

        // console.log(firebase.auth().currentUser);
        db.ref(`/${firebase.auth().currentUser.uid}/events`).once('value', function (d) {
            //if the user has the event on their account already,it will sset the button to remove event, if it's not then add to events.
            d.forEach(e => {
                let f = e.val();
                if (f === eventInfo.id) {
                    addToEvents = $('<button class="btn btn-danger add-to-event">').html(`&times; Remove from Events`).data({ id: eventInfo.id, event: eventInfo.directLink, action: "delete" });
                }
            })
            // if addToEvents variable is empty, it will render add to events.
            if (!addToEvents) {
                addToEvents = $('<button class="btn btn-success add-to-event">').html(`&#43; Add to My Events`).data({ id: eventInfo.id, event: eventInfo.directLink, action: "add" });
            }
            //append all the elements created above to the more info container first to last.
            col_2.append(title, venue, address,city , date, getTickets, addToEvents);
            setTimeout(function () {
                //the fake loader will have atleast 1 second to stay up regardless of how fast the internet is.
                eventDiv.empty();
                row.append(col_1, col_2, description);
                eventDiv.append(row);
                $('#map').removeClass('display');
                $('#weather').removeClass('display');
            }, 1000)
            

        })

    }
    //similar to above except there is no account involved or firebase query involved.
    function signedOutEventRender(eventInfo) {
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
        let city = $('<p>').text(eventInfo.city);
        let day = moment(event.start_time).format("dddd, MMMM Do YYYY, h:mm:ss a");
        let date = $('<p>').text(day);
        let description = $('<div class="row">').append($('<div class="col-8 description">').html(eventInfo.description));
        let addToEvents = $('<button class="btn btn-primary get-tickets">').text("Get Tickets").data({ id: eventInfo.id, event: eventInfo.directLink });
        col_2.append(title, venue, address, city, date, addToEvents);                
        setTimeout(function () {
            eventDiv.empty();
            row.append(col_1, col_2, description);
            eventDiv.append(row);
            $('#map').removeClass('display');
            $('#weather').removeClass('display');
        }, 1000)
    }
    //base initialization of map which takes arguments depending if user is on my-events page or home page.
    //see google maps API.
    function initMap(lat, long, eventData, contain) {
        let infoWindow = new google.maps.InfoWindow;
        let uluru = { lat: lat, lng: long };
        infoWindow.setPosition(uluru);

        let map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: uluru
        });
        let map2 = new google.maps.Map(document.getElementById("single-event-map"), {
            zoom: 15,
            center: uluru
        });
      
        let marker = new google.maps.Marker({
            position: uluru,
            map: contain === "map" ? map : map2
        });
        marker.addListener('click', function (e) {
            infoWindow.open(contain === "map" ? map : map2);
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

    $(".searchAdvanced").hide();
    // $("#expand").hide();
    $(".myEvents").hide();
    $(".mainEvent").hide();
// })

// $("#location").focus(function () {
//     $(".searchAdvanced").toggle();
// })




let searchLocation;

$("#search").click(function () {
    event.preventDefault();

    searchLocation = $("#location").val().trim().toUpperCase();
    if (searchLocation === "") {
        $("#location").attr("placeholder", "Please enter a location.");
        $("#location").css("background-color", "lightyellow");
    }
    else {
        // $(".searchContainer").hide();
        // $("#expand").show();
        $("#location").css("background-color", "white");
        $("#eventHeading").html("Events in " + searchLocation);
    }
})

// $("#expand").click(function () {
//     $(this).hide();
//     $(".searchContainer").show();
//     $(".searchAdvanced").hide();
// })

// $(".btn-main-event").click(function () {
//     $(".searchAdvanced").hide();
//     $(".mainEvent").show();
//     $("#eventHeading").html("Other Events");


})()


