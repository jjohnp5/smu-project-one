$(document).ready(function(){
    $(".searchAdvanced").hide();
    $("#expand").hide();
    $(".myEvents").hide();
    $(".mainEvent").hide();
})

$("#location").focus(function(){
    $(".searchAdvanced").show();
})



var searchLocation;

$("#search").click(function(){
    event.preventDefault();
     
    searchLocation = $("#location").val().trim().toUpperCase();
    if (searchLocation==="") {
        $("#location").attr("placeholder","Please enter a location.");
        $("#location").css("background-color","lightyellow");
    }
    else {
    $(".searchContainer").hide();
    $("#expand").show();
    $("#location").css("background-color","white");
    $("#eventHeading").html("Events in " + searchLocation);
    }
})

$("#expand").click(function(){
    $(this).hide();
    $(".searchContainer").show();
    $(".searchAdvanced").hide();
})

$(".btn-main-event").click(function(){
    $(".searchAdvanced").hide();
    $(".mainEvent").show();
    $("#eventHeading").html("Other Events");
    
})