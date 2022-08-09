Penguins Chat using React Js, Firebase v9 and material ui with Google Login
=====================================

Live [demo](https://penguine-chat.netlify.app/)

[![Screenshot-2022-08-09-at-2-05-05-PM.png](https://i.postimg.cc/YSKZxKgR/Screenshot-2022-08-09-at-2-05-05-PM.png)](https://postimg.cc/9DbLWkLw)
[![Screenshot-2022-08-09-at-2-05-26-PM.png](https://i.postimg.cc/ZRkNRHGC/Screenshot-2022-08-09-at-2-05-26-PM.png)](https://postimg.cc/GBQtgFhC)

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
