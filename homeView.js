import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

import {color, styles} from './styleConst';

export function NewWebView(props){
  var ref_out = null;

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style = {{fontSize: 18}}>Explore</Text>
      </View>
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
                    ref_out.injectJavaScript("window.ReactNativeWebView.postMessage(window.location.href);");
                  }}>
          </Button>
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
            onMessage={({nativeEvent: state}) => {
              // setUrl(state.data);
              console.log(state.data);
            }}
          />
        </View>
      </View>
    </View>
    );
}
