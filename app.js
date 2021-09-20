window.firstOpen = false; //not running certain event listeners more than once (like create or delete a node only once, not everytime we fetch a new note)
function fetchNotes(){
  //Fetch notes form database
  document.querySelector('.pages-holder').innerHTML=''; //clear any notes, that we dont add any duplicate notes with noteid
  chrome.runtime.sendMessage({command: "fetchNotes", data: {notes: ''}}, (response) => { //send a cmd to background page to ask to perform actions
    //fetch notes is name of cmd,response : response from backfround
    //listen for a response...
    var notes = response.data;
    var nav = '<ul>'; //unordered list
    window.notes = []; //window object where our notes go.to be able to access notes out of thos scope.
    for(const noteId in notes){
      nav += '<li data-noteId="'+noteId+'">'+notes[noteId].icon+' '+notes[noteId].title+'</li>';//add info for this node
      window.notes[noteId] = notes[noteId];
    }
    nav += '</ul>';
    document.querySelector('.pages-holder').innerHTML = nav; //Add all the fetched notes(fetched into nav) to the main page

    //listen for clicks
    listenForClicks();
  });
}
fetchNotes();

function clearNote() //or a new note
{
  //clear note variables and action
  document.querySelector('.deletePage').style.display='none'; //remove the delete button (for new note only save will appear)
  //remove title, body,icon
  document.querySelector('.holder h1').innerText = '';
  document.querySelector('.holder .post-body').innerHTML = '';
  document.querySelector('.holder .icon').innerText = '📌';
  document.querySelector('.holder h1').removeAttribute('data-noteid');//completely remove the noteid attribute of the new note, so that when we submit it we generate a new one and firebase can ensure that if noteid is empty , it is a unique noteid and has to be saved
}

function changePage(noteId){
  console.log(noteId);
  //Change selected note
  var obj = window.notes[noteId];
  document.querySelector('.holder .icon').innerText = obj.icon;
  document.querySelector('.holder h1').innerText = obj.title;
  document.querySelector('.holder h1').dataset.noteid = noteId;
  document.querySelector('.holder .post-body').innerHTML = obj.body;

  //update the status or hovering of note on side bar which is opened
  var lis = document.querySelectorAll('ul li'); //remove any other active hovered note
  for(var i = 0; i < lis.length; i++){
    try{
      lis[i].classList.remove('active');//check all items and remove that active class
    }catch(e){//...
    }
  }
  document.querySelector('ul li[data-noteid="'+noteId+'"]').className='active';
  document.querySelector('.savePage').style.display='block'; //display the save and delete button
  document.querySelector('.deletePage').style.display='block';
  localStorage.setItem('_notes_lastOpenPage', noteId); //record the last note we were on
}

//Set click eventListeners  (only called once per page)
document.querySelector('.newNote').addEventListener('click', function(){
  clearNote();
});

document.querySelector('.deletePage').addEventListener('click', function(){
  var id = false; //id means the note or content exists
  try{
    id = document.querySelector('.holder h1').dataset.noteid;
  }catch(e){ //...
   }
  if(id != false){ //make sure that we an id on the page
    var confirm = window.confirm('Are you sure you want delete this note?');
    if(confirm){
      chrome.runtime.sendMessage({command: "deleteNote", data: {id: id }}, (response) => { //send the deletenote command to background page, and then see the response
        //...the note is deleted
        fetchNotes(); //refresh sidebar
        clearNote(); //show a clearnote now
      });
    }
  }
});

document.querySelector('.savePage').addEventListener('click', function(){
  //implement save page button
  var title = document.querySelector('.holder h1').innerText;
  var body = document.querySelector('.holder .post-body').innerHTML;
  var icon = document.querySelector('.holder .icon').innerText;
  var id = document.querySelector('.holder h1').dataset.noteid;
  savePage(id, title, icon, body);
});

function savePage(id, title, icon, body){
  //Save note to database
  if(!title){
  alert('Please enter a title!');
  return false;
}
if(id == undefined){ //if a new note,generate id,default undefined
  id = 'EMPTY-AUTOGEN--';
}
else{
  window.notes[id].title = title;
  window.notes[id].icon = icon;
  window.notes[id].body = body;
  document.querySelector('.pages-holder li[data-noteid="'+id+'"]').innerText=icon+' '+title;
}

chrome.runtime.sendMessage({command:"postNote", data: {id: id, title:title, body: body, icon:icon}}, (response) => {
  //....
  try{
    var obj = response;
    document.querySelector('.holder h1').dataset.noteid = obj.id; //give the id to the note,as given by firebase in the response (firebase gives an id)
    localStorage.setItem('_notes_lastOpenPage', obj.id); //recent note
    document.querySelector('.deletePage').style.display='block'; //now that the note is saved, show the delete button.
  }catch(e){
    console.log(e);
  }
  fetchNotes();
});
}

function listenForClicks(){ //Add event listeners to the page wherever we need them
  var lis = document.querySelectorAll('.pages-holder ul li'); //select all notes
  console.log(lis);
  for(var i = 0; i < lis.length; i++){
    lis[i].addEventListener('click', function(){
      changePage(this.dataset.noteid);
    });
  }
  if(window.firstOpen == false){ //to only run once
    window.firstOpen = true;
    try{
      var openNote = localStorage.getItem('_notes_lastOpenPage');//if we go off the curent note to new tab,retain the old one.
      if(openNote != ''){
        document.querySelector('ul li[data-noteid="'+openNote+'"]').click(); //open last note if we open new tab
      }
    }catch(e){
      console.log(e);
    }
  }
}





//this runs when the chrome extension has completely loaded (for emoji selection)
// window.addEventListener('DOMContentLoaded', () => {  //see when the actual page has loaded
//       var button = document.querySelector('.holder .icon'); //using the class names
//       var picker = new EmojiButton(); //uses the instlled library
//
//       button.addEventListener('click', () => { //when the buttun is clicked
//           picker.togglePicker(button); //open the picker
//
//       });
//
//       picker.on('emoji', emoji => { //emoji = selected emoji
//         button.innerText = emoji; //change the emji to new emoji
//       });
//
//     });
