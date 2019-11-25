import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity,TouchableWithoutFeedback, Alert, Picker,
  StyleSheet, Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import { Storage, Auth } from 'aws-amplify';
import { SearchBar, CheckBox } from 'react-native-elements';

import {color, styles, itemHeight, db, TRACK_DIR, itemFontSize, global_debug} from './styleConst';
import {login} from './utils'
import { ViewDeleteModal } from './localModal';
import { Button, Icon } from 'react-native-elements';
import { AddPlstModal } from './localModal';

export function LocalView(props){

  const [playlist_lst, setPllst] = useState([]);
  const [show_modal1, setShowModal1] = useState(false);
  const [show_modal2, setShowModal2] = useState(false);
  const key_ref = useRef(null);
  const [show_modal3, setShowModal3] = useState(false);
  const plst_ref = useRef();

  const fetch_pllst = useCallback(() => (
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Playlists`,
        null,
        (_, {rows: {_array}}) => {
          let temp_lst = _array.map((it) => ({key: it.lst_name, date: it.date.split(' ')[0]})).reverse();
          plst_ref.current = temp_lst;
          setPllst(temp_lst);
        },
        (_, error) => console.log(error)
      );
    })
  ),[]);

  const flatlist_getItemLayout = useCallback((data, index) => (
    {length: itemHeight, offset: itemHeight * index, index}
  ),[]);

  useEffect(() => {
    fetch_pllst();
  },[props.isFocused])

  var MainView = (
    <View style = {styles.afterStatus}>
      <TouchableOpacity
        style = {styles.touchableRow}
        onPress = {() => {
          props.navigation.navigate('LocalList', {all_tracks: true})
        }}>
        <Text style={{fontSize:20}}>All Tracks...</Text>
      </TouchableOpacity>
      <View style = {styles.grayRow} />
      <View style = {{...styles.containerRow, justifyContent: 'space-between', paddingHorizontal:30}}>
        <Text style={{fontSize:20}}>Playlist:</Text>
        <Button
          title = {'ADD'}
          onPress = {() => {
            setShowModal1(true);
          }}
        />
      </View>
      <View style = {{
        flex: 1,
        alignSelf: 'stretch'
      }}>
        <FlatList
          data={playlist_lst}
          getItemLayout={flatlist_getItemLayout}
          renderItem={({item}) => <Item
                                    title={item.key}
                                    create_date = {item.date}
                                    setShowModal = {setShowModal2}
                                    key_ref = {key_ref}
                                    navigation = {props.navigation}
                                  />}
        />
      </View>

    </View>
  )

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style={{fontWeight: "bold", fontSize: itemFontSize+2}}>LOCAL</Text>
      </View>
      {MainView}
      { global_debug && <Button
        title= {'Delete db'}
        onPress={ async () => {
          await FileSystem.deleteAsync(FileSystem.documentDirectory + 'SQLite/db.db');
          console.log('[Delete]..delete db.db')
        }}
      />}
      <AddPlstModal
        show_modal = {show_modal1}
        setShowModal = {setShowModal1}
        plst_ref={plst_ref}
        afterFunc = {fetch_pllst}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={show_modal2}
      >
        <View style={{...styles.modalBack, justifyContent: 'center'}}>
          <TouchableWithoutFeedback onPress = {() => setShowModal2(false)}>
            <View style = {styles.modalTouchClose}/>
          </TouchableWithoutFeedback>
          <View style ={{...styles.modalInCenter, height: null}}>
            <TouchableOpacity
              style = {{...styles.touchableRow}}
              onPress = {() => {
                // Alert.alert(
                //   "Comfirm Delete",
                //   `Delete Playlist: ${key_ref.current}?`,
                //   [
                //     {text: 'Yes', onPress: () => {
                //       db.transaction(tx => {
                //         tx.executeSql(
                //           `DELETE FROM Playlists WHERE lst_name = '${key_ref.current}'`,
                //           [],
                //           () => {
                //             console.log(`[Info] Playlist (${key_ref.current}) deleted from database`)
                //             showMessage({
                //               message: "Success",
                //               description: "Playlist Deleted",
                //               type: "success"
                //             })
                //             setShowModal2(false);
                //             fetch_pllst();
                //           },
                //           (_, error) => console.log(error)
                //         );
                //       });
                //     }},
                //     {text: 'Cancel', onPress: () => {}, style: 'cancel'}
                //   ],
                // )
                setShowModal2(false);
                setShowModal3(true);
              }}
            >
              <Text>Delete Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {{...styles.touchableRow}}>
              <Text>what2</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ViewDeleteModal
        lst_ref= {key_ref}
        setShow = {setShowModal3}
        show = {show_modal3}
        fetch_pllst = {fetch_pllst}
      />
    </View>
  )
}

function Item(props){

  return (
    <View style={{...styles.containerRow,
      paddingLeft: 30,
      borderTopWidth: 1,
      borderColor: color.light_pup
    }}>
      <TouchableOpacity
        style = {{flex: 10,
          flexDirection: 'row',
          height:'100%',
          alignItems:'center',
          justifyContent: 'space-between'
        }}
        onPress = {() => {
          props.navigation.navigate('LocalList', {plst_name: props.title})
        }}>
        <Text numberOfLines={1} style={{fontSize:itemFontSize + 2, maxWidth:'70%'}}>{props.title}</Text>
        <Text style={{color: 'rgba(0,0,0,0.3)', fontSize:itemFontSize - 2}}>{props.create_date}</Text>
      </TouchableOpacity>
      <View style = {{flex:2, justifyContent:'center', alignItems:'center'}}>
        <Button
          flex={1}
          icon={
            <Icon
             name="more-vert"
             size={35}
             color={color.light_pup}
            />
             }
          type="clear"
          onPress={() => {
            props.key_ref.current = props.title
            props.setShowModal(true);
          }}
        />
      </View>
    </View>
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
