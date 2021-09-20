// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyATg6aQ951sC0prKdL9416bPd20hwJE7cc",
  authDomain: "my-tab-notes-extension.firebaseapp.com",
  projectId: "my-tab-notes-extension",
  storageBucket: "my-tab-notes-extension.appspot.com",
  messagingSenderId: "469997836251",
  appId: "1:469997836251:web:0cd9bff6e943a6fb9cf9fe"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log(firebase);
//check that the firebase is connected correctly by going to background.html->console from extension in chrome


chrome.runtime.onMessage.addListener((msg, sender, response) => {

  if(msg.command == 'fetchNotes'){
    firebase.database().ref('/notes').once('value').then(function(snapshot){
      response({type: "result", status: "success", data: snapshot.val(), request: msg});
    });

  }

  if(msg.command == 'deleteNote'){
    //..
    var noteId = msg.data.id; //same params as in chrome.runtime in app.js
    if(noteId != ''){ //noteid should not be empty
      try{
        var deleteNote = firebase.database().ref('/notes/'+noteId).remove();
        response({type:"result", status:"success", id: noteId, request: msg}); //send response back to app.js (see param up in chrome.runtime)
      }catch(e){
        //
        console.log("Error", e);
        response({type:"result", status:"error", data: e, request: msg});
      }
    }
  }

  if(msg.command == 'postNote'){
    //..
    var title = msg.data.title;
    var body = msg.data.body;
    var icon = msg.data.icon;
    var noteId = msg.data.id;

    try{

      if(noteId != 'EMPTY-AUTOGEN--'){
        var newNote = firebase.database().ref('/notes/'+noteId).update({
          title: title,
          icon: icon,
          body: body
        });
        response({type: "result", status: "success", id:noteId, request: msg});
      }else{
        //..
        var newPostKey = firebase.database().ref().child('notes').push().key; //the ref is empty this time cz new note, hence add this note to the notes child of our database by generating a random unique key
        var newNote = firebase.database().ref('/notes/'+newPostKey).set({ //'set' this time not update cz new note
          title: title,
          icon:icon,
          body:body
        });
        console.log('new note id', newPostKey);
        response({type: "result", status: "success", id:newPostKey, request: msg});//not passed noteid cz it was EMPTY AUTOGEN
      }

    }catch(e){
      //...
      console.log("error", e);
      response({type: "result", status: "error", data:e, request: msg});
    }
  }
  return true;
});
