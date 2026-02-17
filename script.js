
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAS-nbT3WluzK62RffqIOyFz9V5cQmm5og",
    authDomain: "bluommaps.firebaseapp.com",
    projectId: "bluommaps",
    storageBucket: "bluommaps.firebasestorage.app",
    messagingSenderId: "304429070181",
    appId: "1:304429070181:web:52301f3431e505cac2538c",
    measurementId: "G-RX32ZBX40N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Map
let map = L.map('map').setView([20,0],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentUserUID = null;

// Auth
window.signup = async function(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await createUserWithEmailAndPassword(auth,email,password);
};

window.login = async function(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await signInWithEmailAndPassword(auth,email,password);
};

window.logout = async function(){
    await signOut(auth);
};

onAuthStateChanged(auth, async (user) => {
    if(user){
        currentUserUID = user.uid;
        document.getElementById("auth").style.display="none";
        const userDoc = doc(db,"users",user.uid);
        const snap = await getDoc(userDoc);
        if(!snap.exists()){
            await setDoc(userDoc,{theme:"light",uiMode:"A",savedPlaces:[],history:[]});
        } else {
            updateUI(snap.data());
        }
    } else {
        document.getElementById("auth").style.display="block";
    }
});

function updateUI(data){
    const savedList = document.getElementById("savedList");
    savedList.innerHTML="";
    data.savedPlaces.forEach(place => {
        const li = document.createElement("li");
        li.textContent = place;
        savedList.appendChild(li);
    });
    const historyList = document.getElementById("historyList");
    historyList.innerHTML="";
    data.history.forEach(h => {
        const li = document.createElement("li");
        li.textContent = h;
        historyList.appendChild(li);
    });
}

map.on('click', async function(e){
    if(!currentUserUID) return;
    const name = prompt("Name this place:");
    if(!name) return;
    const userDoc = doc(db,"users",currentUserUID);
    await updateDoc(userDoc,{savedPlaces: arrayUnion(name),history: arrayUnion(name)});
    const snap = await getDoc(userDoc);
    updateUI(snap.data());
});

window.toggleTheme = function(){
    document.body.classList.toggle("dark");
    if(currentUserUID){
        const userDoc = doc(db,"users",currentUserUID);
        updateDoc(userDoc,{theme: document.body.classList.contains("dark") ? "dark":"light"});
    }
};

window.toggleUIMode = function(){
    alert("UI Mode toggled (A/B placeholder)");
};

window.getDirections = function(){
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    alert(`Directions: ${from} → ${to} (placeholder)`);
};
