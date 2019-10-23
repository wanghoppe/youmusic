import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity, Alert, Picker,
  StyleSheet, Text, View, Button, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import { Storage, Auth } from 'aws-amplify';
import { SearchBar, CheckBox } from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';

import {color, styles, itemHeight, db, TRACK_DIR} from './styleConst';
import {login} from './utils'

export function LocalView(props){

  // async function test(){
  //   const db_info = await FileSystem.getInfoAsync(FileSystem.documentDirectory+'SQLite/db.db');
  //   console.log(db_info)
  // }
  //
  // useEffect(() => {
  //   console.log('what the hell')
  //   test();
  // }, [])

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style = {{fontSize: 18}}>Local</Text>
      </View>
      <View style = {styles.afterStatus}>
      <Button
        title = {'Get info'}
        onPress = {async () => {
          const db_info = await FileSystem.getInfoAsync(FileSystem.documentDirectory+`SQLite/db.db`);
          console.log(db_info)
        }}
      />
      <Button
        title = {'Delete'}
        onPress = {async () => {
          const db_info = await FileSystem.deleteAsync(FileSystem.documentDirectory+`SQLite/db.db`);
          console.log('delete db')
        }}
      />
      </View>
    </View>
  )
}
