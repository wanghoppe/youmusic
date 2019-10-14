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



Amplify.configure(awsconfig);


export default function App() {
  return (<LoginView/>)
}
