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

  const [playlist_lst, setPllst] = useState([]);

  const fetch_pllst = useCallback(() => (
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Playlists`,
        null,
        (_, {rows: {_array}}) => console.log(_array),
        (_, error) => console.log(error)
      );
    })
  ),[])

  useEffect(() => {
    fetch_pllst();
  })

  var MainView = (
    <View style = {styles.afterStatus}>
      <TouchableOpacity
        style = {styles.touchableRow}
        onPress = {() => {
          showMessage({
            message: "Success",
            description: "ALL",
            type: "success"})
        }}>
        <Text style={{fontSize:20}}>All Tracks...</Text>
      </TouchableOpacity>
      <View style = {styles.grayRow} />
      <View style = {{...styles.containerRow, justifyContent: 'space-between', paddingHorizontal:30}}>
        <Text style={{fontSize:20}}>Playlist:</Text>
        <Button
          title = {'ADD'}
          onPress = {() => {
            showMessage({
              message: "Success",
              description: "ADD",
              type: "success"})
          }}
        />
      </View>
      <FlatList
        data={playlist_lst}
        renderItem={({item}) => <PureItem
                                  title={item.key}
                                  create_date = {item.date}
                                />}
      />
    </View>
  )

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style = {{fontSize: 18}}>Local</Text>
      </View>
      {MainView}
      <Test/>
      <Button
        title= {'Delete db'}
        onPress={ async () => {
          await FileSystem.deleteAsync(FileSystem.documentDirectory + 'SQLite/db.db');
          console.log('[Delete]..delete db.db')
        }}
      />
    </View>
  )
}

function Item(props){

  return (
    <TouchableOpacity
      style = {styles.touchableRow}
      onPress = {() => {
        showMessage({
          message: "Success",
          description: "ALL",
          type: "success"})
      }}>
      <Text style={{fontSize:16}}>{props.title}</Text>
      <Text>{props.create_date}</Text>
    </TouchableOpacity>
  )

}

function Test(props){
  const txt_ref  = useRef();

  return(
    <View>
      <TextInput
        ref = {txt_ref}/>
      <Button
        title='Check'
        onPress={() => {
          console.log(txt_ref.current._lastNativeText)
        }}
        />
    </View>
  )


}
