import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity,TouchableWithoutFeedback, Alert, Picker,
  StyleSheet, Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import { Storage, Auth } from 'aws-amplify';
import { SearchBar, CheckBox } from 'react-native-elements';

import {color, styles, itemHeight, db, TRACK_DIR} from './styleConst';
import {login} from './utils'
import { Button, Icon } from 'react-native-elements';

export const AddToLstModal = React.memo((props) => {
  return _AddToLstModal(props);
});
function _AddToLstModal(props){
  const [checked, updateChecked] = useState(undefined);
  const [data_lst, setDataLst] = useState([])

  const fetch_pllst = useCallback(() => (
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Playlists`,
        null,
        (_, {rows: {_array}}) => {
          setDataLst(_array.map((it) => ({key: it.lst_name})));
        },
        (_, error) => console.log(error)
      );
    })
  ),[]);

  function dbAction(){
    if (props.select_mode){
      db.transaction(tx => {
        props.select_set.forEach((it) => {
          tx.executeSql(
            `INSERT INTO Linking (fk_lst_name, fk_track_name) VALUES ('${checked}', '${it}')`,
            null,
            (_, {rows: {_array}}) => {console.log('Insert Linking successful')},
            (_, error) => console.log(error)
          );
        })
      });
    }else{
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO Linking (fk_lst_name, fk_track_name) VALUES ('${checked}', '${props.key_ref.current}')`,
          null,
          (_, {rows: {_array}}) => {console.log('Insert Linking successful')},
          (_, error) => console.log(error)
        );
      });
    }
  }

  useEffect(() => {
    fetch_pllst();
  }, [])

  return(
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.show}
    >
      <View style={{...styles.modalBack, justifyContent: 'center'}}>
        <TouchableWithoutFeedback onPress = {() => props.setShow(false)}>
          <View style = {styles.modalTouchClose}/>
        </TouchableWithoutFeedback>
        <View style={{...styles.modalInCenter, justifyContent: 'space-around', height: '55%'}}>
          <View style={{...styles.container, flex:1, alignSelf: 'stretch'}}>
            <Text style={{fontSize:25, color: color.dark_pup}}>Add To Playlist</Text>
          </View>
          <View style = {{
            flex: 3,
            alignSelf: 'stretch'
          }}>
            <FlatList
              data={data_lst}
              extraData={[checked]}
              renderItem={({item}) => <SelectLstItem
                                        title = {item.key}
                                        checked = {item.key == checked}
                                        updateChecked = {updateChecked}
                                      />}
            />
          </View>
          <View style={{
            ...styles.containerRow,
            flex: 1,
            justifyContent: 'space-around',
            height: null
          }}>
            <Button
              title='Cancel'
              onPress={() => props.setShow(false)}
              />
            <Button
              buttonStyle= {{backgroundColor:color.dark_pup}}
              title='Check'
              onPress={() => {
                if (checked == undefined){
                  Alert.alert('No Playlist was selected')
                }else{
                  dbAction();
                  props.exitSelectMode();
                  showMessage({
                    message: "Add Success",
                    type: "success"});
                  props.setShow(false);
                }
              }}
              />
          </View>
        </View>
      </View>
    </Modal>
  )

}

function SelectLstItem(props){

  return (
    <View style = {{
      ...styles.containerRow,
      height: 55,
      marginLeft: 20,
      marginRight:20,
      borderBottomWidth:1,
      borderColor: color.light_pup,
    }}>
      <View style = {{flex: 2, justifyContent:'center'}}>
        <CheckBox
          center
          size={22}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={props.checked}
          checkedColor = {color.dark_pup}
          onPress={() => props.updateChecked(props.title)}
        />
      </View>
      <TouchableOpacity
        style = {{
          flex: 5,
          height:'100%',
          justifyContent: 'center'
        }}
        onPress ={() => {props.updateChecked(props.title)}}
      >
        <Text numberOfLines={1} style={{fontSize:18}}>{props.title}</Text>
      </TouchableOpacity>
    </View>
  )
}

export const DeleteModal = React.memo((props) => {
  return _DeleteModal(props);
});
function _DeleteModal(props){

  const [check, setCheck] = useState(props.all_ref.current);

  var CheckToDel;
  var count;
  var lst2del;

  if (props.select_mode){
    count = props.select_set.size
    lst2del = Array.from(props.select_set)
  }else{
    count = 1;
    lst2del = [props.key_ref.current]
  }

  function deleteLocalFile(){
    lst2del.forEach((item) => {
      FileSystem.deleteAsync(TRACK_DIR + encodeURIComponent(item));
    });

    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM Tracks WHERE track_name in (${lst2del.map((it) => `'${it}'`)})`,
        null,
        () => {
          console.log('deleteLocalFile successful')
        },
        (_, error) => console.log(error)
      );
    });
  }

  function deleteLinking(){
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM Linking
          WHERE fk_lst_name = '${props.lst_ref.current}'
            AND fk_track_name in (${lst2del.map((it) => `'${it}'`)})`,
        null,
        () => {
          console.log('deleteLinking successful')
        },
        (_, error) => console.log(error)
      );
    });
  }

  return(
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.show}
    >
      <View style={{...styles.modalBack, justifyContent: 'center'}}>
        <TouchableWithoutFeedback onPress = {() => props.setShow(false)}>
          <View style = {styles.modalTouchClose}/>
        </TouchableWithoutFeedback>
        <View style={{...styles.modalInCenter, justifyContent: 'space-around', height: '30%'}}>
          <View style={{...styles.container, flex:1, alignSelf: 'stretch'}}>
            <Text style={{fontSize:25, color: color.dark_pup}}>Delete {count} Track(s)</Text>
          </View>
          <View style = {{flex:1, alignSelf: 'stretch', justifyContent:'center'}}>
            <CheckBox
              center
              title='Delete tracks from local storage'
              Component = {props.all_ref.current ? TouchableWithoutFeedback: TouchableOpacity}
              size = {22}
              checked= {check}
              checkedColor = {color.dark_pup}
              onPress={props.all_ref.current ?()=>{}: () => setCheck(!check)}
            />
          </View>
          <View style={{
            ...styles.containerRow,
            flex: 1,
            justifyContent: 'space-around',
            height: null
          }}>
            <Button
              title='Cancel'
              onPress={() => props.setShow(false)}
              />
            <Button
              buttonStyle= {{backgroundColor:color.dark_pup}}
              title='Check'
              onPress={() => {
                if (check){
                  deleteLocalFile();
                }else{
                  deleteLinking();
                }

                if (props.select_mode){
                  props.exitSelectMode();
                }
                props.setShow(false);
                props.fetchShowLst();
                showMessage({
                  message: "Delete Success",
                  type: "success"}
                );
              }}
              />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export const ViewDeleteModal = React.memo((props) => {
  return _ViewDeleteModal(props);
});

export function _ViewDeleteModal(props){

  const [check, setCheck] = useState(false);
  const [count, setCount] = useState(0);
  const track_lst_ref = useRef();

  useEffect(() => {
    if (props.show){
      // console.log(props.lst_ref.current);
      db.transaction(tx => {
        tx.executeSql(
          `SELECT fk_track_name FROM Linking WHERE fk_lst_name = '${props.lst_ref.current}'`,
          null,
          (_, {rows: {_array}}) => {
            track_lst_ref.current = _array.map((it) => (it.fk_track_name));
            // console.log(track_lst_ref.current);
            setCount(track_lst_ref.current.length);
          },
          (_, error) => console.log(error)
        );
      });
    }
  },[props.show])

  return(
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.show}
    >
      <View style={{...styles.modalBack, justifyContent: 'center'}}>
        <TouchableWithoutFeedback onPress = {() => props.setShow(false)}>
          <View style = {styles.modalTouchClose}/>
        </TouchableWithoutFeedback>
        <View style={{...styles.modalInCenter, justifyContent: 'space-around', height: '30%'}}>
          <View style={{...styles.container, flex:1, alignSelf: 'stretch'}}>
            <Text style={{fontSize:25, color: color.dark_pup}}>Delete Playlist: {props.lst_ref.current}</Text>
          </View>
          <View style = {{flex:1, alignSelf: 'stretch', justifyContent:'center'}}>
            <CheckBox
              center
              title= {`Also delete ${count} tracks in this playlist`}
              size = {22}
              checked= {check}
              checkedColor = {color.dark_pup}
              onPress={() => setCheck(!check)}
            />
          </View>
          <View style={{
            ...styles.containerRow,
            flex: 1,
            justifyContent: 'space-around',
            height: null
          }}>
            <Button
              title='Cancel'
              onPress={() => props.setShow(false)}
              />
            <Button
              buttonStyle= {{backgroundColor:color.dark_pup}}
              title='Check'
              onPress={() => {
                db.transaction(tx => {
                  if (check){
                    track_lst_ref.current.forEach((item) => {
                      FileSystem.deleteAsync(TRACK_DIR + encodeURIComponent(item));
                    });
                    tx.executeSql(
                      `DELETE FROM Tracks WHERE track_name in (
                        SELECT fk_track_name FROM Linking WHERE fk_lst_name = '${props.lst_ref.current}'
                      )`,
                      null,
                      () => {
                        console.log('Tracks deleted successful')
                      },
                      (_, error) => console.log(error)
                    );
                  }
                  tx.executeSql(
                    `DELETE FROM Playlists WHERE lst_name = '${props.lst_ref.current}'`,
                    null,
                    () => {
                      console.log('Playlists deleted successful')
                      showMessage({
                        message: "Delete Success",
                        type: "success"}
                      );
                    },
                    (_, error) => console.log(error)
                  );
                });
                props.setShow(false);
                props.fetch_pllst();
              }}
              />
          </View>
        </View>
      </View>
    </Modal>
  )
}
