import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';

import Constants from 'expo-constants';
import Amplify, { Storage, Auth } from 'aws-amplify';
import {styles, color, itemHeight, itemFontSize} from './styleConst'
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";
import {WaitingModal} from './utilsComp';

import { Button, Icon } from 'react-native-elements';


export function AuthLoadingScreen(props){

  const _onMount = async () => {
    let user = null;
    try{
      user = await Auth.currentAuthenticatedUser();
    }catch(err){
      console.log(err);
    }
    props.navigation.navigate((user)? 'App': 'Auth');
  };

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

  const [modal_show, setModalShow] = useState(false);
  var pwText;

  const signInFirst = async () => {
    setModalShow(true);
    try{
      const user = await Auth.signIn(username, pw);
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
        setModalShow(false);
        Alert.alert('Please set new password');
        setUser(user);
        setConfirm(true);
      }else{
        props.navigation.navigate('App');
        showMessage({
          message: "SignIn Success",
          type: "success"}
        );
      };
    }catch(err){
      setModalShow(false);
      Alert.alert(err.message);
    }
  };

  const setPasswd = async () => {
    setModalShow(true);
    try{
      const loggedUser = await Auth.completeNewPassword(
        save_user, pw
      );
      props.navigation.navigate('App');
      showMessage({
        message: "SignIn Success",
        type: "success"}
      );
    }catch(err){
      setModalShow(false);
      Alert.alert(err.message);
    }
  };

  // useEffect(()=> {
  //   if (need_confirm){
  //     setModalShow(false);
  //   }
  // }, [need_confirm])

  if (need_confirm){
    button1 = (
      <Button title={"SET PASSWORD"}
        onPress={setPasswd}/>
    );
    pwText = (<Text style={{fontSize: itemFontSize+6, color: color.dark_pup}}>New Password:</Text>)
  } else {
    button1 = (
      <Button title={"GO GO"}
        onPress={signInFirst}/>
    )
    pwText = (<Text style={{fontSize: itemFontSize+6, color: color.dark_pup}}>Password:</Text>)
  }


  return (
    <View style={{flex:1}}>
      <WaitingModal
        show = {modal_show}
        title = 'Signing In'
      />
      <View style={styles.statusBar}/>
      <View style={styles.afterStatus}>
        <KeyboardAvoidingView flex={5} style={{alignSelf:'stretch'}} behavior="padding">
          <View flex={1} style={styles.container}>
            <Text style = {{fontSize:itemFontSize*2, color: color.dark_pup}}>Sign In</Text>
          </View>
          <View flex={5} style={{
            alignSelf:'stretch',
            marginRight:itemFontSize*2,
            marginLeft:itemFontSize*2,
            marginBottom:itemFontSize
          }}>
            <View style={styles.wrapText}>
              <Text style={{fontSize: itemFontSize+6, color: color.dark_pup}}>Username: </Text>
              <View style = {{padding: 5}}/>
              <TextInput
                style = {{backgroundColor: color.light_grey, padding:itemFontSize/2}}
                onChangeText={text => setUsername(text)}
                placeholder={'Email'}
                fontSize= {itemFontSize+4}
              />
            </View>
            <View style={styles.wrapText} >
              {pwText}
              <View style = {{padding: 5}}/>
              <TextInput
                secureTextEntry
                textContentType = 'password'
                style = {{backgroundColor: color.light_grey, padding:itemFontSize/2}}
                onChangeText={text => setPw(text)}
                placeholder={'Password'}
                fontSize= {itemFontSize+4}/>
            </View>
          </View>
          <View flex={2} style={{
            alignSelf:'stretch',
            marginRight:itemFontSize*2,
            marginLeft:itemFontSize*2
          }}>
            {button1}
          </View>
          <View style = {{padding:itemFontSize}}/>
        </KeyboardAvoidingView>
      </View>
    </View>
    );
}
