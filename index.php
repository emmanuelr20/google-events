<!DOCTYPE html>
<html>
  <head>
    <title>Events Manager</title>
    <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
    <meta charset="utf-8" />
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
    <div class="container" id="main-wrapper">
        <br>
        <div style="clear: both">
          <h1  style="float:left">Events Manager</h1>
          <button id="authorize_button" class="button" style="display: none; float:right">Authorize</button>
          <button id="signout_button" class="button" style="display: none; float:right">Sign Out</button>
        </div>
        <hr style="clear: both">
        <button class="button is-success" id="createEvent" style="display: none">Create Event</button>
        <div id="createEventDiv" class="card" style="display: none">
          <form id="createEventForm">
            <label for="eventTitle" >Title:</label>
            <input class="input" name="summary" type="text" id="eventTitle" placeholder="enter event title" required>
            
            <label for="eventLocation">Location:</label>
            <input class="input" name="location" type="text" id="eventLocation" placeholder="enter event location" required>
            
            <label for="eventStartDate">Start Date and Time:</label>
            <input class="input" name="start" type="datetime-local" id="eventStartDate" required>
            
            <label for="eventEndEate">End Date and Time:</label>
            <input class="input" name="end" type="datetime-local" id="eventEndDate" required>

            <label for="eventDescription">Description:</label>
            <textarea class="textarea" name="description"  id="eventDescription" rows="3" placeholder="enter description" required></textarea>
            
            <label for="eventParticpants">Participants (enter comma separated list of attendant emails):</label>
            <textarea class="textarea" name="attendees"  id="eventParticpants" rows="3" placeholder="participants eg. example@gmail.com, example2@gmail.com" required></textarea>

            <button class="button" type="submit">Submit</button>
          </form>
        </div>
        <pre id="error-content" style="white-space: pre-wrap; display: none"></pre>
        <div class="events-container">
            <br>
            <h4 class="title">Upcomming Events</h4>
            <hr>
            <div id="events-list">

            </div>
        </div>
        <div id="modal-wrapper"></div>
    </div>

    <script type="text/javascript" src="./index.js">
    </script>
    
    <script async defer src="https://apis.google.com/js/api.js"
      onload="this.onload=function(){};handleClientLoad()"
      onreadystatechange="if (this.readyState === 'complete') this.onload()">
    </script>
  </body>
</html>