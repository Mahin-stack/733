import * as firebase from 'firebase'
require('@firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyB8YSiWfktsamXlb5TMnf3fO3gUWt6ixpc",
  authDomain: "wily2-81cca.firebaseapp.com",
  databaseURL: "https://wily2-81cca.firebaseio.com",
  projectId: "wily2-81cca",
  storageBucket: "wily2-81cca.appspot.com",
  messagingSenderId: "705587513464",
  appId: "1:705587513464:web:d7f447354cd75fc833858d"
};
// Initialize Firebase
if(!firebase.apps.length){
firebase.initializeApp(firebaseConfig);
}
  export default firebase.firestore();
