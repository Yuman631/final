
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIs7HGPZqU7Xp2wt98Irkq_ea6mYz5Oxo",
  authDomain: "mood-radio-6d663.firebaseapp.com",
  projectId: "mood-radio-6d663",
  storageBucket: "mood-radio-6d663.firebasestorage.app",
  messagingSenderId: "40239445754",
  appId: "1:40239445754:web:71d40e10e7de1461b53b43",
  measurementId: "G-PE4VXBQVGM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const todosRef = collection(db, "todos");

const { createApp } = Vue;

const appInstance = createApp({
  data() {
    return {
      user: null,
      email: '',
      password: '',
      newTodo: { songName: '', artist: '', mood: '' },
      todos: [],
      filter: 'all'
    };
  },
  computed: {
    filteredTodos() {
      if (this.filter === 'completed') return this.todos.filter(t => t.isCompleted);
      if (this.filter === 'active') return this.todos.filter(t => !t.isCompleted);
      return this.todos;
    }
  },
  methods: {
    async login() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        this.user = userCredential.user;
        this.email = '';
        this.password = '';
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    },
    async signUp() {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        this.user = userCredential.user;
        this.email = '';
        this.password = '';
      } catch (err) {
        alert("Sign-up failed: " + err.message);
      }
    },
    async logout() {
      await signOut(auth);
      this.user = null;
    },
    async addTodo() {
      await addDoc(todosRef, {
        songName: this.newTodo.songName,
        artist: this.newTodo.artist,
        mood: this.newTodo.mood,
        isCompleted: false,
        timestamp: serverTimestamp()
      });
      this.newTodo = { songName: '', artist: '', mood: '' };
    },
    startEdit(todo) {
      todo.editing = true;
      todo.editableSongName = todo.songName;
      todo.editableArtist = todo.artist;
      todo.editableMood = todo.mood;
    },
    cancelEdit(todo) {
      todo.editing = false;
    },
    async saveTodo(todo) {
      await updateDoc(doc(db, "todos", todo.id), {
        songName: todo.editableSongName,
        artist: todo.editableArtist,
        mood: todo.editableMood
      });
      todo.editing = false;
    },
    async deleteTodo(id) {
      await deleteDoc(doc(db, "todos", id));
    },
    async toggleComplete(todo) {
      await updateDoc(doc(db, "todos", todo.id), {
        isCompleted: !todo.isCompleted
      });
    }
  },
  mounted() {
    onAuthStateChanged(auth, user => {
      this.user = user;
      if (user) {
        const q = query(todosRef, orderBy("timestamp", "desc"));
        onSnapshot(q, snapshot => {
          this.todos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            editing: false
          }));
        });
      } else {
        this.todos = [];
      }
    });
  }
});

appInstance.component('todo-item', {
  props: ['todo'],
  template: '#todo-item-template'
});

appInstance.mount('#app');