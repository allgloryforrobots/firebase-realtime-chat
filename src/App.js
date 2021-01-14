import './App.css';
import React from "react";

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDdqWLDwOV-gaqAB2wd9AdPYxpdtnDVSoc",
    authDomain: "fir-chat-ee04d.firebaseapp.com",
    projectId: "fir-chat-ee04d",
    storageBucket: "fir-chat-ee04d.appspot.com",
    messagingSenderId: "795059305626",
    appId: "1:795059305626:web:573a0ddbe96f7411a83323",
    measurementId: "G-BWFG10VN4G"
}


//Initialize Firebase
if (!firebase.apps.length) {
    try {
        firebase.initializeApp(firebaseConfig)
    } catch (err) {
        console.error('Firebase initialization error raised', err.stack)
    }
}



const auth = firebase.auth()
const firestore = firebase.firestore()


function App() {

    const [user] = useAuthState(auth)

    return (
        <div className="App">
            <header>
                {user ? <SignOut/> : null}
            </header>

            <section>
                {user ? <ChatRoom/> : <SignIn/>}
            </section>
        </div>
    )
}


function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(provider)
    }

    return (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
    )
}

function SignOut() {
    return auth.currentUser && (
        <button onClick={() => auth.signOut()}>SignOut</button>
    )
}

function ChatRoom() {
    const dummy = React.useRef()


    const messagesRef = firestore.collection('messages')
    const query = messagesRef.orderBy('createdAt').limit(25)

    const [messages] = useCollectionData(query, {idField: 'id'})

    const [formValue, setFormValue] = React.useState('')

    const sendMessage = async(e) => {
        e.preventDefault()
        const { uid, photoUrl } = auth.currentUser
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoUrl: photoUrl || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
        })

        setFormValue('')
        dummy.current.scrollIntoView({ behavior: 'smooth' })
    }


    return (
        <>
            <main>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

                <div ref={dummy}></div>
            </main>

            <div>
                <form onSubmit={sendMessage}>
                    <input value={formValue} onChange={e => setFormValue(e.target.value)}/>

                    <button type="submit" >Send</button>
                </form>
            </div>
        </>
    )
}

function ChatMessage(props) {
    const {text, uid, photoUrl} = props.message
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoUrl} alt=""/>
            <p>{text}</p>
        </div>
    )
}


export default App