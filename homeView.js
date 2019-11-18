import React, {useState} from 'react';
import { Alert, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { showMessage, hideMessage } from "react-native-flash-message";
import { Auth } from 'aws-amplify';
import { createStackNavigator } from 'react-navigation-stack';
import {color, styles} from './styleConst';

export const ExploreView = createStackNavigator(
  {
    ExploreView: NewWebView
  },
  {
    defaultNavigationOptions:{
      title: 'Explore',
      headerStyle: {
          backgroundColor: color.light_pup2,
        },
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }
);

function NewWebView(props){
  var ref_out = null;

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.afterStatus}>
        <View style = {{flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch'}}>
          <Button title="HOME"
                  onPress={() => {
                    ref_out.injectJavaScript("window.location.href = 'https://www.youtube.com';");
                  }}>
          </Button>
          <Button title="BACK"
                  onPress={() => {
                    ref_out.injectJavaScript("window.history.go(-1);");
                  }}>
          </Button>
          <Button title="GET URL"
                  onPress={() => {
                    Alert.alert(
                      "Comfirm",
                      "Download to Cloud?",
                      [
                        {text: 'OK', onPress: () => ref_out.injectJavaScript("window.ReactNativeWebView.postMessage(window.location.href);")},
                        {text: 'Cancel', onPress: () => {}, style: 'cancel'}
                      ],
                    )
                  }}>
          </Button>
          {false && <Button title="log in"
                  onPress = {async () => {
                    try{
                      const user = await Auth.signIn('wanghp000@gmail.com', '123456789');
                      if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
                        const loggedUser = await Auth.completeNewPassword(
                          user, '123456789'
                        )
                      };
                      info = await Auth.currentUserInfo();

                      showMessage({
                        message: "Login Success",
                        description: "Login as "+ info.attributes.email,
                        type: "success"})
                      console.log(info);
                    }catch(err){
                      console.log(err)
                    }
                  }}
          />}
          <Button title="log out"
                  onPress = {async () => {
                    await Auth.signOut({ global: true })
                        .then(data => console.log(data))
                    props.navigation.navigate('AuthLoading');
                  }}
          />
          <Button title="test"
                  onPress = {() => showMessage({
                    message: "Success",
                    description: " is downloaded to cloud",
                    type: "success"})
                }
          />
        </View>
        <View
            style={{ flex: 1, alignSelf: 'stretch' }}
            >
          <WebView
            ref={ref => (ref_out = ref)}
            style={{alignSelf: 'stretch'}}
            source={{
              uri: 'https://www.youtube.com',
            }}
            onMessage={ async ({nativeEvent: state}) => {
              const parsed = state.data.match(/http.:\/\/(www|m)\.youtube\.com.*\?*v=([^&]*).*/);

              if (parsed == '' || parsed == null){
                Alert.alert('Invalid URL', 'Cannot parse video ID')
              }else{
                const you_id = parsed[2];
                const user_info = await Auth.currentUserInfo();
                const user_id = user_info.id;
                console.log('Downloading ' + you_id + ' for ' + user_id);

                response = await fetch('https://vxmaikxa2m.execute-api.us-west-2.amazonaws.com/beta/trans', {
                  method: 'POST',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    you_id: you_id,
                    user_id: user_id
                  })
                });
                res_json = await response.json();
                showMessage({
                  message: "Success",
                  description: res_json.download + " is downloaded to cloud",
                  type: "success"})
                console.log(res_json.download + " is downloaded to cloud");
              }
            }}
          />
        </View>
      </View>
    </View>
    );
}
