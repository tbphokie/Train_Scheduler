/* global moment firebase */

// Initialize Firebase
        
  var config = {
    apiKey: "AIzaSyAT56ATzD4p_NUk85xaYmEWxZqDQ7RoPQM",
    authDomain: "trainschedule-93e7a.firebaseapp.com",
    databaseURL: "https://trainschedule-93e7a.firebaseio.com",
    projectId: "trainschedule-93e7a",
    storageBucket: "trainschedule-93e7a.appspot.com",
    messagingSenderId: "544929799116"
  };


firebase.initializeApp(config);


// Create a variable to reference the database.
var database = firebase.database();


// --------------------------------------------------------------
// Initial Values
// --------------------------------------------------------------

refresh();

$("#submit-button").on("click", function(event){

      event.preventDefault();

      var name = $("#train-name").val().trim();
      var dest = $("#train-dest").val().trim();
      var time = $("#train-time").val().trim();
      var freq = $("#train-freq").val().trim();

      database.ref().push({
        trainName: name,
        trainDest: dest,
        trainFirstTime: time,
        trainFreq: freq
      });
      
      $("#train-name").val("");
      $("#train-dest").val("");
      $("#train-time").val("");
     $("#train-freq").val("");
    });

 database.ref().on("child_added", function(childSnapshot){

      var name = childSnapshot.val().trainName;
      var dest = childSnapshot.val().trainDest;
      var time = childSnapshot.val().trainFirstTime;
      var freq = childSnapshot.val().trainFreq;

      var nextArrival = 0;
      var minsAway = 0;
      var timeShifted = moment(time, "hh:mmm").subtract(1, "years");
      var now = moment();

      //Calculate the difference in the first train time and current time
      var diffTime = moment().diff(moment(timeShifted), "minutes");

      //Calculate the remainder
      var remainder = diffTime % freq;

      //Calculate minutes until next train
      minsAway = freq - remainder;

      //Get the actual time of the next train
      nextArrival = moment().add(minsAway, "minutes");

      $("#schedule").append("<tr> <td>" + name + "</td><td>" + dest + "</td><td>" 
            + freq + "</td><td>" + moment(nextArrival).format("hh:mm") 
            + "</td><td>" + minsAway + "</td>");
    });


 function refresh() {

    setTimeout(function () {
        location.reload()
    }, 60*1000);
    console.log("refreshed");
}