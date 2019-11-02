import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

import Amplify, { Storage, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';

import {LoginView} from './login'
import {NewWebView} from './homeView'
import {List} from './list'
import {LocalView} from './localView'
import FlashMessage from "react-native-flash-message";
import {first_run}  from './firstRun'
import {LocalList} from './localList'
import {LocalHome} from './localHome'

Amplify.configure(awsconfig);
first_run();
// console.log('what 2')


export default function App() {
  return (
    <View flex = {1}>
      <LocalHome/>
      <FlashMessage position="bottom" />
    </View>
  )
}
