Penguins Chat using React Js, Firebase v9 and material ui with Google Login
=====================================

Live [demo](https://penguine-chat.netlify.app/)

![Screenshot](https://firebasestorage.googleapis.com/v0/b/chat-app-1822e.appspot.com/o/demoimage.png?alt=media&token=de5ff944-e9d0-43e8-8f0f-b39b01869d30)

Quick Start:
------------

- ``` git clone ```
- ``` cd react-firebase-chatApp ```
- Add your firebase configuration to firebase.js file on /src
- ``` npm install ```
- ``` npm start ```


Additional Configuration:
-------------------------

On firebase console navigate to Firestore Database -> Rules -> Edit Rules 
replace the entire code to this:




```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```



### Todos
------------
- [x] Display Date below message
- [ ] Display unread message count besides users profile
