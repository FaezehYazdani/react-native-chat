// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React , { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDw_Bi-hDQM18OBgnZtC50wfh5LafJ6knE",
  authDomain: "yay-project-19b38.firebaseapp.com",
  projectId: "yay-project-19b38",
  storageBucket: "yay-project-19b38.appspot.com",
  messagingSenderId: "1063179266960",
  appId: "1:1063179266960:web:1f8fb697055dd93536e115",
  measurementId: "G-J95GPD36G0"
};

// to prevent reloading the app each time we save
if(firebase.apps.length == 0 ) {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const chatsRef = db.collection('chats');

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);


  //we need to attch a subscription: Thats how we listen to realtime changes
  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot(querySnapShot => {
      const messagesFirestore = querySnapShot
            .docChanges()
            .filter(({type}) => type == 'added')
            .map(({doc}) => {
              const message = doc.data();
              return {...message, createdAt: message.createdAt.toDate() }
            }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser() {
    const user = await AsyncStorage.getItem('user');
    if(user) {
      setUser(JSON.parse(user));
    }
  }

  async function handlePress() {
    //TODO: in the future when enabled authentication need to seet to the user ID
    const _id = Math.random().toString(36).substring(7);
    const user = {_id, name};
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);

  }

  async function handleSend(messages){
    const writes = messages.map(m => chatsRef.add(m));
    await Promise.all(writes);
  }

  if(!user) {
    return (
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
        <Button onPress={handlePress} title="Enter the chat" />
      </View>
    );
  }
  return (
    <GiftedChat messages={messages} user={user} onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
  },

});
