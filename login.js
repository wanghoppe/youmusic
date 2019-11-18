import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';

import Constants from 'expo-constants';
import Amplify, { Storage, Auth } from 'aws-amplify';
import {styles, color} from './styleConst'
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";


export function AuthLoadingScreen(props){

  const _onMount = async () => {
    let user = null;
    try{
      user = await Auth.currentAuthenticatedUser();
    }catch(err){
      console.log(err);
    }
    props.navigation.navigate((user)? 'App': 'Auth');
  }

  useEffect(() => {
    _onMount();
  }, [])

  return (
    <View style = {{flex:1, justifyContent:'center', alignItems: 'center'}}>
      <Progress.CircleSnail size={60} color={color.light_pup} thickness={4}/>
    </View>
  );
}


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
              props.navigation.navigate('App')
              showMessage({
                message: "SignIn Success",
                type: "success"}
              )
            }
          }/>
    );
    pwText = (<Text style={{fontSize: 25, color: color.dark_pup}}>New Password:</Text>)
  } else {
    button1 = (
      <Button title={"GO GO"}
        onPress={
          async () => {
            try{
              const user = await Auth.signIn(username, pw);
              if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
                Alert.alert('Please set new password')
                setUser(user);
                setConfirm(true);
              }else{
                props.navigation.navigate('App');
                showMessage({
                  message: "SignIn Success",
                  type: "success"}
                )
                // console.log(user);
                // const get_user = await Auth.currentUserInfo();
                // console.log(get_user)
              };
            }catch(err){
              Alert.alert(err.message);
            }
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
          <Text style = {{fontSize:30, color: color.dark_pup}}>Sign In</Text>
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
          <View flex={1} style={{alignSelf: 'stretch'}}>
            {button1}
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
    );
}
