import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';

import Constants from 'expo-constants';
import Amplify, { Storage, Auth } from 'aws-amplify';
import {styles, color} from './styleConst'



export function LoginView(props){
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('Email');
  const [pw, setPw] = useState('Password')
  const [need_confirm, setConfirm] = useState(false);
  const [save_user, setUser] = useState(null);
  var pwText;

  if (need_confirm){
    button1 = (
      <Button title={"SET PASSWORD"}
        onPress={
          async () => {
              const loggedUser = await Auth.completeNewPassword(
                save_user, pw
              )
            }
          }/>
    );
    pwText = (<Text style={{fontSize: 25, color: color.dark_pup}}>New Password:</Text>)
  } else {
    button1 = (
      <Button title={"LOG IN"}
        onPress={
          async () => {
            const user = await Auth.signIn(username, pw);
            if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
              Alert.alert('Please set new password')
              setUser(user);
              setConfirm(true);
            }else{
              console.log(user);
              const get_user = await Auth.currentUserInfo();
              console.log(get_user)
            };
          }
        }/>
    )
    pwText = (<Text style={{fontSize: 25, color: color.dark_pup}}>Password:</Text>)
  }


  return (
    <View style={{flex:1}}>
      <View style={styles.statusBar}/>
      <View style={styles.afterStatus}>
        <View flex={1} style={styles.container}>
          <Text style = {{fontSize:30, color: color.dark_pup}}>Log In</Text>
        </View>
        <KeyboardAvoidingView flex={3} style={styles.container} behavior="padding">
          <View flex={2} style={ styles.container } flexDirection={'row'}>
            <View flex={2}/>
            <View style={{flex: 8}}>
              <View style={styles.wrapText} marginBottom = {15}>
                <Text style={{fontSize: 25, color: color.dark_pup}}>Username: </Text>
              </View>
              <View style={styles.wrapText} marginBottom = {40}>
                <TextInput
                    onChangeText={text => setUsername(text)}
                    placeholder={'Email'}
                    fontSize= {20}
                />
              </View>
              <View style={styles.wrapText} marginBottom = {15}>
                {pwText}
              </View>
              <View style={styles.wrapText}>
                <TextInput
                    onChangeText={text => setPw(text)}
                    placeholder={'Password'}
                    fontSize= {20}/>
              </View>
            </View>
          </View>
          <View flex={1} style={styles.container}>
            {button1}
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
    );
}
