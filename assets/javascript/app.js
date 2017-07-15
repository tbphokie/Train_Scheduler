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

var provider = new firebase.auth.GithubAuthProvider();

function githubSignin() {
   firebase.auth().signInWithPopup(provider)
   
   .then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
    
      console.log(token)
      console.log(user)
   }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    
      console.log(error.code)
      console.log(error.message)
   });
}

function githubSignout(){
   firebase.auth().signOut()
   
   .then(function() {
      console.log('Signout successful!')
   }, function(error) {
      console.log('Signout failed')
   });
}

function createButtonText(key) {
  var text;

  var text1 = "<button type='button' id='editButton' data = "+ key + 
    " class='btn btn-primary'><span class='glyphicon'></span>&nbsp;Edit</button>";
  var text2 = "<button type='button' id='removeButton' data = "+ key + 
    " class='btn btn-primary'><span class='glyphicon'></span>&nbsp;Remove</button>";

    return text1+text2;
}

function UpdateData(key, name, dest, time, freq) {
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

    var btnText = createButtonText(key);

    $("#schedule").append("<tr id=" + key + "> <td>" + name + "</td><td>" + dest + "</td><td>" 
          + freq + "</td><td>" + moment(nextArrival).format("hh:mm") 
          + "</td><td>" + minsAway + "</td><td>" + btnText + "</td></tr>");
}

$("#submit-button").on("click", function(event){

      event.preventDefault();

      var name = $("#train-name").val().trim();
      var dest = $("#train-dest").val().trim();
      var time = $("#train-time").val().trim();
      var freq = parseInt($("#train-freq").val().trim());
      // regular expression to match required time format
      re = /^\d{2}:\d{2}/;

      // Make sure entries are not blank, need to add verification for time string
      if(name.length > 0 && dest.length > 0 && $("#train-time").val().match(re) && freq > 0){
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
      }
      else {
        alert("Check you are submitting valid data.");
      }

    });

 database.ref().on("child_added", function(childSnapshot){

      var name = childSnapshot.val().trainName;
      var dest = childSnapshot.val().trainDest;
      var time = childSnapshot.val().trainFirstTime;
      var freq = childSnapshot.val().trainFreq;

      UpdateData(childSnapshot.getKey(), name, dest, time,freq);
    });

function startTimer() {
    //Call to update train table every minute
    setInterval(function () {
       updateTrainTable()
    }, 60*1000); 
}

function refresh() {
    var now = moment();
    //Update train table every minute, adjusted to start close to the top of the minute
    setTimeout(startTimer, (60-now.seconds())*1000);
}

function updateTrainTable() {
  //Empty current table first
  $("#schedule").empty();

  //loop to add data back to table
  var query = database.ref();
  query.once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {

      var name = childSnapshot.val().trainName;
      var dest = childSnapshot.val().trainDest;
      var time = childSnapshot.val().trainFirstTime;
      var freq = childSnapshot.val().trainFreq;

      UpdateData(childSnapshot.getKey(), name, dest, time,freq);
    });
  });
}


$('body').on('click', '#editButton', function () {
  console.log("Edit: " + $(this).attr("data"));
  var query = database.ref();
  var key = $(this).attr("data");

  query.child(key)
    .once('value')
      .then(function(snapshot) {
        var newName = prompt("Enter/Accept the train name: ", snapshot.val().trainName);
        var newDest = prompt("Enter/Accept the train destination: ", snapshot.val().trainDest);
        var newTime = prompt("Enter/Accept the first train time (military time): ", snapshot.val().trainFirstTime);
        var newFreq = prompt("Enter/Accpet the frequency in minutes: ", snapshot.val().trainFreq); 

        // regular expression to match required time format
        re = /^\d{2}:\d{2}/;

        // Make sure entries are not blank, need to add verification for time string
        if(newName.length > 0 && newDest.length > 0 && newTime.match(re) && newFreq > 0){

          database.ref(key).update({
            trainName:newName,
            trainDest:newDest,
            trainFirstTime:newTime,
            trainFreq:newFreq
            }); 

        }
        else {
            alert("No changes saved, double-check input format."); 
          }         
   })

});

$('body').on('click', '#removeButton', function () {
  console.log("Remove: " + $(this).attr("data"));

  var key = $(this).attr("data");
  var query = database.ref();

  query.child(key)
    .once('value')
      .then(function(snapshot) {
        snapshot.ref.remove();
      })

  //Wait about 3 seconds before updating the table since there is a delay updating the database
    setTimeout(updateTrainTable, (3*1000));
});

refresh();