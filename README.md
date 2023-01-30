Penguins Chat using React Js, Firebase-v9 and Material UI with Google & Github Login
=====================================

Live [demo](https://penguine-chat.netlify.app/)

[![Screenshot-2022-08-09-at-3-32-11-PM.png](https://i.postimg.cc/rs8pg1fp/Screenshot-2022-08-09-at-3-32-11-PM.png)](https://postimg.cc/ygbB8Z4q)
[![Screenshot-2022-08-09-at-3-32-24-PM.png](https://i.postimg.cc/br3w5Z59/Screenshot-2022-08-09-at-3-32-24-PM.png)](https://postimg.cc/WqqVF1Td)

Quick Start:
------------

- ``` git clone ```
- ``` cd react-firebase-chatApp ```
- Add your firebase configuration to firebase.js file on /src
- ``` npm install ```
- ``` npm start ```


Additional Configuration:
-------------------------

1. Create Firestore Database
2. On firebase console navigate to Firestore Database -> Rules -> Edit Rules 
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
