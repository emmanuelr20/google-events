// Client ID and API key from the Developer Console
var CLIENT_ID = '225331759942-9tv08llco6rgrqk8t21adkq23k3dtrbn.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBBpUr07dSZsU_zKa61zp8UqC9I9Sa9VkY';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var createEventBtn = document.getElementById('createEvent');
var events = [];
var eventToEdit = null;
var eventToAccept = null;
var eventToDecline = null;
var eventToDelete = null;

var eventsList = document.getElementById('events-list');
var eventTitle = document.getElementById('eventTitle');
var eventLocation = document.getElementById('eventLocation');
var eventStartDate = document.getElementById('eventStartDate');
var eventEndDate = document.getElementById('eventEndDate');
var eventDescription = document.getElementById('eventDescription');
var eventParticpants = document.getElementById('eventParticpants');
var createEventForm = document.getElementById('createEventForm');
var userMail = '';
var createEventData = {};

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    console.log(error);
    appendPre(JSON.stringify(error, null, 2));
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    createEventBtn.style.display = 'block';
    createEventBtn.onclick = createEvent;
    eventTitle.onchange = handleInputChange;
    eventLocation.onchange = handleInputChange;
    eventStartDate.onchange = handleInputChange;
    eventEndDate.onchange = handleInputChange;
    eventDescription.onchange = handleInputChange;
    eventParticpants.onchange = handleInputChange;
    createEventForm.onsubmit = handleCreateEvent;
    userMail = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();

    listUpcomingEvents();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    createEventBtn.style.display = 'none';
  }
}

function handleInputChange(event){
  createEventData[event.target.name] = event.target.value;
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    auth2.disconnect().then(function(data){
      setTimeout(function() {location.reload()}, 5000)
    });
  });
}

function appendPre(message) {
  var pre = document.getElementById('error-content');
  window.pageYOffset = 0;
  pre.style.display = 'block';
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

function createEvent(event){
  var createEventDiv = document.getElementById('createEventDiv');
  if (createEventDiv.style.display === "none"){
    createEventDiv.style.display = "block";
    createEventBtn.innerHTML = "Hide Create Section"
  } else {
    createEventDiv.style.display = "none";
    createEventBtn.innerHTML = "Create Event";
  }
}

function addEvents(events) {
  if (events.length > 0) {
    for (i = 0; i < events.length; i++) {
      renderEvent(events[i]);
    }

    appendEventBtnEvents();
  } else {
  eventsList.appendChild('<h5>No upcoming events found.</h5>');
  }
}

function appendEventBtnEvents() {
  for (i = 0; i < events.length; i++) {
    document.getElementById('delete-event-' + events[i].id).onclick =  showDeleteModal;
    document.getElementById('accept-event-' + events[i].id).onclick =  showAcceptModal;
    document.getElementById('decline-event-' + events[i].id).onclick =  showDeclineModal;
  }
  var elements = document.getElementsByClassName('edit-event');
  for (i = 0; i < elements.length; i++) {
    elements[i].onclick =  handleEditEvent;
  }
}

function renderEvent(event, top) {
  var status = event.attendees ? event.attendees.filter(function(user){
    return user.email === userMail;
  }): event.attendees;
  status && status.length ? status = status[0]: status = null;

  var html = "<div class='card mb-25' id='event-div-" + event.id + "' ><p><strong>Title: </strong>" + event.summary + ((event.creator.email === userMail) ? " <small>(creator)</small>" : "") + "</p>";
  html += "<p><strong>Location: </strong>" + event.location + "</p>";
  html += "<p><strong>Start Date and Time: </strong>" + event.start.dateTime + "</p>";
  html += "<p><strong>End Date and Time: </strong>" + event.end.dateTime + "</p>";
  html += "<p><strong>Description: </strong>" + event.description + "</p>";
  if (status) html += "<p><strong>Acceptance Status: </strong>" + status.responseStatus + "</p>";
  html += "<div class='attendees card mb-15'><p><strong>Attendees: </strong></p>";
  event.attendees && event.attendees.map(function (user) {
    html += "<div class='item'><p style='clear: both'>" + user.email + ": <span class='has-text-info'>(" + user.responseStatus + ")</span></p>";
    if (user.comment) html += "<small style='font-size: 12px'><strong>User Comment:</strong>" + user.comment + "</small>";
    html += "</div>";
  });
  html += "</div>";
  html += "<div class='event-buttons'><div class='float-left'><button class='accept-event button is-success'  id='accept-event-" + event.id + "'>Accept invitation</button> ";
  html += "<button class='decline-event button is-warning' id='decline-event-" + event.id + "'>Decline invitation</button></div>";
  html += "<div class='float-right'><button class='delete-event button is-danger float-right' style='margin-left: 5px;' id='delete-event-" + event.id + "'>Delete</button>";
  if (event.creator.email === userMail) html += "<button class='edit-event button is-link float-right' id='edit-event-" + event.id + "'>edit</button>";
  html += "</div></div></div>";

  top ? eventsList.innerHTML = html + eventsList.innerHTML : eventsList.innerHTML += html;
  
}

function clearEventInput() {
  Object.keys(createEventData).map(function(item){
    document.getElementsByName(item)[0].value = '';
  });
}

function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 20,
    'orderBy': 'startTime',
    'timeMin': (new Date()).toISODateString()
  }).then(function(response) {
    events = response.result.items;
    addEvents(events);
  });
}

function showDeleteModal(event) {
  event.preventDefault();
  var eventId = event.target.id.replace('delete-event-', '');
  var main = document.getElementById('modal-wrapper');
  var modal = "<div id='delete-event-modal' class='modal'><div class='modal-card'><div class='card' style='text-align: center;'>";
  modal += "<h4>Are you sure you want to delete event</h4>";
  modal += "<button class='button is-success' id='submit-delete-modal'>Delete</button> <button class='button' id='dismiss-delete-modal'>Cancel</button>";
  modal += "</div></div></div>";
  main.innerHTML += modal;
  eventToDelete = eventId;
  document.getElementById('dismiss-delete-modal').onclick = dismissDeleteModal;
  document.getElementById('submit-delete-modal').onclick = proceedToDelete;
}

function dismissDeleteModal() {
  return document.getElementById('delete-event-modal').remove();
}

function proceedToDelete(event){
  event.preventDefault();
  console.log(eventToDelete)
  return gapi.client.calendar.events.delete({
    calendarId: 'primary',
    eventId: eventToDelete,
  }).then(function(data){
    document.getElementById('event-div-' + eventToDelete).remove();
    dismissDeleteModal()
  }, function(error) {
    console.error(error);
    appendPre(error.result.error.message);
  });
}

function handleCreateEvent(event) {
  event.preventDefault();
  
  var event = {
    'summary': createEventData.summary,
    'location': createEventData.location,
    'description': createEventData.description,
    'start': {
      'dateTime': (new Date(createEventData.start)).toISOString(),
      'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    'end': {
      'dateTime': (new Date(createEventData.end)).toISOString(),
      'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    'attendees': createEventData.attendees.split(',').map(function(email){
      return { email: email.trim() };
    }),
    'sendUpdates': 'all',
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    }
  };
  
  return gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'sendUpdates': 'all',
    'resource': event
  }).then(function(data){
    clearEventInput();
    renderEvent(data.result, true);
    events.unshift(data.result);
    createEvent();
    appendEventBtnEvents();
  }, function(error) {
    console.error(error);
    appendPre(error.result.error.message);
  });
}

function submitAcceptForm(event) {
  event.preventDefault();
  var formData = {};
  var dataform = document.getElementById('acceptEventForm');
  for (let i = 0; i  < dataform.elements.length; i++) {
    formData[dataform.elements[i].name] = dataform.elements[i].value;
  }
  eventToAccept.attendees =  eventToAccept.attendees.map(function(attendee){
    if(attendee.email === userMail) {
      attendee.responseStatus = 'accepted'; 
      attendee.comment = formData.comment
    }
    return attendee;
  });
  return gapi.client.calendar.events.update({
    'calendarId': 'primary',
    'eventId': eventToAccept.id,
    'resource': eventToAccept
  }).then(function(data){
    clearEventInput();
    document.getElementById('event-div-' + eventToAccept.id).remove();
    renderEvent(data.result, true);
    appendEventBtnEvents();
    dismissAcceptModal();
  }, function(error) {
    console.error(error);
    dismissAcceptModal();
    appendPre(error.result.error.message);
  });
}

function dismissAcceptModal() {
  return document.getElementById('accept-event-modal').remove();
}

function showAcceptModal(event) {
  event.preventDefault();
  var eventId = event.target.id.replace('accept-event-', '');
  var event = events.filter(function(event){
    return event.id === eventId;
  })[0];
  var main = document.getElementById('modal-wrapper');
  var modal = "<div id='accept-event-modal' class='modal'><div class='modal-card'><div class='card'>";
  modal += "<form id='acceptEventForm'>"
  modal += "<h3>Accept Invitation</h3>";
  modal += "<textarea class='textarea' name='comment' id='eventParticpants' rows='3' placeholder='enter note if necessary'></textarea>";
  modal += "<button class='button is-success' id='submit-accept-modal' type='submit'>Submit</button> <button class='button' id='dismiss-accept-modal'>Cancel</button>";
  modal += "</form>";
  modal += "</div></div></div>";
  main.innerHTML += modal;
  eventToAccept = event;
  document.getElementById('dismiss-accept-modal').onclick = dismissAcceptModal;
  document.getElementById('submit-accept-modal').onclick = submitAcceptForm;
}

function submitDeclineForm(event) {
  event.preventDefault();
  var formData = {};
  var dataform = document.getElementById('declineEventForm');
  for (let i = 0; i  < dataform.elements.length; i++) {
    formData[dataform.elements[i].name] = dataform.elements[i].value;
  }
  eventToDecline.attendees =  eventToDecline.attendees.map(function(attendee){
    if(attendee.email === userMail) {
      attendee.responseStatus = 'declined'; 
      attendee.comment = formData.comment
    }
    return attendee;
  });
  return gapi.client.calendar.events.update({
    'calendarId': 'primary',
    'eventId': eventToDecline.id,
    'resource': eventToDecline
  }).then(function(data){
    clearEventInput();
    document.getElementById('event-div-' + eventToDecline.id).remove();
    renderEvent(data.result, true);
    appendEventBtnEvents();
    dismissDeclineModal();
  }, function(error) {
    console.error(error);
    dismissDeclineModal();
    appendPre(error.result.error.message);
  });
}

function dismissDeclineModal() {
  return document.getElementById('decline-event-modal').remove();
}

function showDeclineModal(event) {
  event.preventDefault();
  var eventId = event.target.id.replace('decline-event-', '');
  var event = events.filter(function(event){
    return event.id === eventId;
  })[0];
  var main = document.getElementById('modal-wrapper');
  var modal = "<div id='decline-event-modal' class='modal'><div class='modal-card'><div class='card'>";
  modal += "<form id='declineEventForm'>"
  modal += "<h3>Decline Invitation</h3>";
  modal += "<textarea class='textarea' name='attendees' id='eventParticpants' rows='3' placeholder='enter note if necessary'></textarea>";
  modal += "<button class='button is-success' id='submit-decline-modal' type='submit'>Submit</button> <button class='button' id='dismiss-decline-modal'>Cancel</button>";
  modal += "</form>";
  modal += "</div></div></div>";
  main.innerHTML += modal;
  eventToDecline = event;
  document.getElementById('dismiss-decline-modal').onclick = dismissDeclineModal;
  document.getElementById('submit-decline-modal').onclick = submitDeclineForm;
}

function submitEditForm(event){
  event.preventDefault();
  var formData = {};
  var dataform = document.getElementById('editEventForm');
  for (let i = 0; i  < dataform.elements.length; i++) {
    formData[dataform.elements[i].name] = dataform.elements[i].value;
  }
  eventToEdit
  eventToEdit.summary = formData.summary
  eventToEdit.location = formData.location;
  eventToEdit.description = formData.description;
  eventToEdit.start = {
    'dateTime': (new Date(formData.start)).toISOString(),
    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  eventToEdit.end =  {
    'dateTime': (new Date(formData.end)).toISOString(),
    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  eventToEdit.attendees = formData.attendees.split(',').map(function(email){
    return { email: email.trim() };
  });
  return gapi.client.calendar.events.update({
    'calendarId': 'primary',
    'eventId': eventToEdit.id,
    'resource': eventToEdit
  }).then(function(data){
    dismissEditModal();
    clearEventInput();
    document.getElementById('event-div-' + eventToEdit.id).remove();
    renderEvent(data.result, true);
    appendEventBtnEvents();
  }, function(error) {
    console.error(error);
    dismissEditModal();
    appendPre(error.result.error.message);
  });
}

function handleEditEvent(event) {
  event.preventDefault();
  var eventId = event.target.id.replace('edit-event-', '');
  var event = events.filter(function(event){
    return event.id === eventId;
  })[0];
  showEditModal(event)
}

function dismissEditModal() {
  return document.getElementById('edit-event-modal').remove();
}

function showEditModal(event) {
  var attendees = '';
  event.attendees && event.attendees.map(function(item){
    attendees += item.email + ', ';
  })
  attendees = attendees.substring(0, attendees.length - 2);
  var main = document.getElementById('modal-wrapper');
  var modal = "<div id='edit-event-modal' class='modal'><div class='modal-card'><div class='card'>";
  modal += "<form id='editEventForm'>"
  modal += "<h3>Edit Event</h3>";
  modal += "<label for='eventTitle' >Title:</label>";
  modal += "<input class='input' name='summary' value='" + event.summary + "' type='text' id='eventTitle' placeholder='enter event title' required>"
  modal += "<label for='eventLocation'>Location:</label>";
  modal += "<input class='input' name='location' value='" + event.location + "' type='text' id='eventLocation' placeholder='enter event location' required>";
  modal += "<label for='eventStartDate'>Start Date and Time:</label>";
  modal += "<input class='input' name='start' value='" + (new Date(event.start.dateTime)).toDatetimeLocal() + "' type='datetime-local' id='eventStartDate' required>";
  modal += "<label for='eventEndEate'>End Date and Time:</label>";
  modal += "<input class='input' name='end' value='" + (new Date(event.end.dateTime)).toDatetimeLocal() + "' type='datetime-local' id='eventEndDate' required>";
  modal += "<label for='eventDescription'>Description:</label>";
  modal += "<textarea class='textarea' name='description' id='eventDescription' rows='3' placeholder='enter description' required>" + event.description + "</textarea>";
  modal += "<label for='eventParticpants'>Participants (enter comma separated list of attendant emails):</label>";
  modal += "<textarea class='textarea' name='attendees' id='eventParticpants' rows='3' placeholder='participants eg. example@gmail.com, example2@gmail.com' required>" + attendees + "</textarea>";
  modal += "<button class='button is-success' id='submit-edit-modal' type='submit'>Submit</button> <button class='button' id='dismiss-edit-modal'>Cancel</button>";
  modal += "</form>";
  modal += "</div></div></div>";
  main.innerHTML += modal;
  eventToEdit = event;
  document.getElementById('dismiss-edit-modal').onclick = dismissEditModal;
  document.getElementById('submit-edit-modal').onclick = submitEditForm;
}

Date.prototype.toDatetimeLocal = function toDatetimeLocal() {
    var
      date = this,
      ten = function (i) {
        return (i < 10 ? '0' : '') + i;
      },
      YYYY = date.getFullYear(),
      MM = ten(date.getMonth() + 1),
      DD = ten(date.getDate()),
      HH = ten(date.getHours()),
      II = ten(date.getMinutes()),
      SS = ten(date.getSeconds())
    ;
    return YYYY + '-' + MM + '-' + DD + 'T' +
             HH + ':' + II + ':' + SS;
};

Date.prototype.toISODateString = function ISODateString(){
  function pad(n){return n<10 ? '0'+n : n}
  var d = this;
  return d.getUTCFullYear()+'-'
       + pad(d.getUTCMonth()+1)+'-'
       + pad(d.getUTCDate())+'T'
       + pad(d.getUTCHours())+':'
       + pad(d.getUTCMinutes())+':'
       + pad(d.getUTCSeconds())+'Z'
};
