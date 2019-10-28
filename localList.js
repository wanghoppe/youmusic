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
import ModalDropdown from 'react-native-modal-dropdown';

import {color, styles, itemHeight, db, TRACK_DIR} from './styleConst';
import {login} from './utils'
import { Button, Icon } from 'react-native-elements';

function orderLst(lst, idx){

  if (idx == -1){
    return [...lst];
  }else if(idx == 0){
    return [...lst].sort(orderKey);
  }else if (idx == 1){
    return [...lst].sort(orderDate);
  }
}

function orderKey(a, b){
  if (a.key > b.key){
    return 1;
  }
  if (a.key < b.key){
    return -1;
  }
  return 0
}

function orderDate(a, b){
  if (a.date > b.date){
    return -1;
  }
  if (a.key < b.key){
    return 1;
  }
  return 0
}

function getNoshowSet(data_lst, filter_txt){
  let temp_set = new Set();

  data_lst.forEach((it) => {
    if (!it.key.toLowerCase().includes(filter_txt)){
      temp_set.add(it.key);
    }
  })

  return(temp_set)
}

export function LocalList(props){

  const all_ref = useRef(true);
  const track_ref = useRef(null)

  const [data_lst, setDataLst] = useState([]);
  const [select_set, setSelectSet] = useState(new Set());
  const [noshow_set, setNoshowset] = useState(new Set());
  const [select_mode, setSelectMode] = useState();
  const [order_idex, setOrdId] = useState(-1);
  const [filter_txt, setFilTx] = useState('');

  const [global_select, setGloSelect] = useState(false);
  const show_set_ref = useRef(new Set());

  const [show_modal_more, setModalMore] = useState(false);
  const [show_modal_playlist, setModalPlaylist] = useState(false);

  const key_ref = useRef();

  var SelectControl;
  var SecondButton;

  var ModalMore;
  var ModalPlaylist;


  const flatlist_getItemLayout = useCallback((data, index) => (
    {length: itemHeight, offset: itemHeight * index, index}
  ),[]);

  const updateSelectSet = useCallback((id) => {
    let temp_set =  new Set(select_set);
    if (temp_set.has(id)){
      temp_set.delete(id);
    }else{
      temp_set.add(id);
    }
    setSelectSet(temp_set);
  }, [select_set])

  const fetchShowLst = useCallback(() => {
      if (all_ref.current){
        db.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM Tracks`,
            null,
            (_, {rows: {_array}}) => {
              setDataLst(
                orderLst(
                  _array.map((it) => ({key: it.track_name, date: it.date.split(' ')[0]})),
                  order_idex
                )
              );
            },
            (_, error) => console.log(error)
          );
        })
      }
    },[order_idex]
  );

  useEffect(() => {
    fetchShowLst();
  },[])

  useEffect(() => {
    setNoshowset(getNoshowSet(data_lst, filter_txt));
  },[filter_txt])

  useEffect(() => {
    if (order_idex == 0 || order_idex == 1){
      setDataLst(orderLst(data_lst, order_idex))
    }
  },[order_idex])

  useEffect(() => {
    let temp_set = new Set(select_set);

    if (select_mode){
      show_set_ref.current.forEach((key) => {
        if(global_select){
          temp_set.add(key)
        }else{
          temp_set.delete(key)
        }
      })
      setSelectSet(temp_set);
    }
  }, [global_select]);

  if (track_ref.current){
    SecondButton = (
      <Button
        title = 'placeholder'
      />
    )

    ModalPlaylist = null
  }else{
    SecondButton = null;

    ModalMore = (
      <Modal
        animationType="fade"
        transparent={true}
        visible={show_modal_more}
      >
        <View style={{...styles.modalBack, justifyContent: 'center'}}>
          <TouchableWithoutFeedback onPress = {() => setModalMore(false)}>
            <View style = {styles.modalTouchClose}/>
          </TouchableWithoutFeedback>
          <View style ={{...styles.modalInCenter, height: null}}>
            <TouchableOpacity
              style = {{...styles.touchableRow}}
              onPress = {() => {
                Alert.alert(
                  `Delete ${key_ref.current}?`,
                  `This track will be permanently delete`,
                  [
                    {text: 'Yes', onPress: () => {
                      db.transaction(tx => {
                        tx.executeSql(
                          `DELETE FROM Tracks WHERE track_name = '${key_ref.current}'`,
                          [],
                          () => {
                            console.log(`[Info] Track: (${key_ref.current}) deleted from database`)
                            FileSystem.deleteAsync(TRACK_DIR + encodeURIComponent(key_ref.current));
                            showMessage({
                              message: "Success",
                              description: "Track Deleted",
                              type: "success"
                            })
                            setModalMore(false);
                            fetchShowLst();
                          },
                          (_, error) => console.log(error)
                        );
                      });
                    }},
                    {text: 'Cancel', onPress: () => {}, style: 'cancel'}
                  ],
                )
              }}
            >
              <Text>Delete Track From Local</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style = {{...styles.touchableRow}}
              onPress = {() => {
                setModalMore(false);
                setModalPlaylist(true);
              }}
            >
              <Text>Add Track to Playlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )

    ModalPlaylist = (
      <Modal
        animationType="fade"
        transparent={true}
        visible={show_modal_playlist}
      >
        <View style={{...styles.modalBack, justifyContent: 'center'}}>
          <TouchableWithoutFeedback onPress = {() => setModalPlaylist(false)}>
            <View style = {styles.modalTouchClose}/>
          </TouchableWithoutFeedback>
          <View style={{...styles.modalInCenter, justifyContent: 'space-around', height: '50%'}}>
            <Text style={{fontSize:25, color: color.dark_pup}}>Add To Playlist</Text>
            <View style={{...styles.containerRow, justifyContent: 'space-around', height: null}}>
              <Button
                title='Cancel'
                onPress={() => setModalPlaylist(false)}
                />
              <Button
                buttonStyle= {{backgroundColor:color.dark_pup}}
                title='Check'
                onPress={() => {
                  let get_txt = name_input_ref.current._lastNativeText;
                  if (get_txt){
                    if (playlist_lst.map((item) => item.key).includes(get_txt)){
                      Alert.alert("Duplicate Playlist")
                    }else{
                      db.transaction(tx => {
                        tx.executeSql(
                          `INSERT INTO Playlists (lst_name, date)
                            VALUES ('${get_txt}', datetime('now', 'localtime'))`,
                          [],
                          () => {
                            console.log(`[Info] Playlist (${get_txt}) inserted into database`)
                            showMessage({
                              message: "Success",
                              description: "Playlist Added",
                              type: "success"
                            })
                            setShowModal1(false);
                            fetch_pllst();
                          },
                          (_, error) => console.log(error)
                        );
                      });
                    }
                  }else{
                    Alert.alert("Empty Input")
                  }
                }}
                />
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  if (select_mode){
    SelectControl = (
      <View style = {{...styles.containerRow, justifyContent: 'space-around', height: itemHeight}}>
        <Button
          title = {'Del From Local'}
          onPress = {() => {
            Alert.alert(
              "Comfirm Delete",
              `Delete ${select_set.size} track from local?`,
              [
                {text: 'Yes', onPress: () => {
                  select_set.forEach((item) => {
                    FileSystem.deleteAsync(TRACK_DIR + encodeURIComponent(item));
                  });

                  db.transaction(tx => {
                    tx.executeSql(
                      `DELETE FROM Tracks WHERE track_name in (${Array.from(select_set).map((it) => `'${it}'`)})`,
                      null,
                      () => {
                        console.log('delete successful')
                        setSelectMode(false);
                        setSelectSet(new Set());
                        fetchShowLst();
                      },
                      (_, error) => console.log(error)
                    );
                  })
                }},
                {text: 'Cancel', onPress: () => {}, style: 'cancel'}
              ],
            )
          }}
          />
        {SecondButton}
        <Button
          title = {'Cancel'}
          onPress = {() => {
            setSelectSet(new Set())
            setSelectMode(false);
          }}
          />
          <CheckBox
            center
            size = {28}
            checked= {global_select}
            checkedColor = {color.dark_pup}
            onPress={() => setGloSelect(!global_select)}
          />
      </View>
    )
  }else{
    SelectControl = null;
  }


  var MainView = (
    <View style = {styles.afterStatus}>
      <View style={{...styles.containerRow, paddingLeft: 30, paddingRight: 30}}>
        <Text numberOfLines={1} style={{fontSize:30, color: color.light_pup}}>TestTsssesttest</Text>
      </View>
      <View style = {{
        alignSelf : "stretch",
        flexDirection: 'row',
        alignItems:'center',
        borderBottomColor: color.light_pup,
        borderBottomWidth: 2,
        borderRadius:5
      }}>
        <SearchBar
          containerStyle = {{
            flex: 8,
            backgroundColor: 'white',
            borderBottomWidth: 0,
            borderTopWidth:0
          }}
          inputContainerStyle = {{
            backgroundColor: color.light_grey,
            color:'black'
          }}
          placeholder="Search Here..."
          onChangeText={text => setFilTx(text)}
          value={filter_txt}
        />
        <ModalDropdown
          style = {{
            flex: 3,
            alignItems:'center',
            backgroundColor: color.light_grey,
            justifyContent:'center',
            height:40}}
          textStyle = {{ fontSize: 20, alignItems: 'center'}}
          dropdownStyle = {{backgroundColor: color.light_grey, height: 102}}
          defaultIndex = {-1}
          defaultValue = {'Order By'}
          options={['     Name     ', '     Date     ']}
          renderRow = {(option)=>(
            <View style = {{alignItems: 'center', justifyContent: 'center', height: 50}}>
              <Text style={{fontSize:20}}>{option}</Text>
            </View>
          )}
          renderSeparator = { () => (<View
              style={{
                borderBottomColor: color.light_pup,
                borderBottomWidth: 1,
              }}
          />)}
          onSelect = {(index) => setOrdId(index)}
        />
      </View>
      <View style = {{
        flex: 1,
        alignSelf: 'stretch',
        borderBottomWidth: 1,
        borderColor: color.light_pup
      }}>
        <FlatList
          data={data_lst}
          extraData={[noshow_set, select_mode, select_set]}
          getItemLayout={flatlist_getItemLayout}
          renderItem={({item}) => <Item
                                    title={item.key}
                                    date = {item.date}
                                    show = {!!!noshow_set.has(item.key)}
                                    select_mode = {select_mode}
                                    setSelectMode = {setSelectMode}
                                    updateSelectSet = {updateSelectSet}
                                    select = {select_set.has(item.key)}
                                    show_set_ref = {show_set_ref}
                                    key_ref = {key_ref}
                                    setModalMore = {setModalMore}
                                  />}
        />
      </View>
      {SelectControl}
    </View>
  )

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style = {{fontSize: 18}}>Local</Text>
      </View>
      {MainView}
      {ModalMore}
      {ModalPlaylist}
    </View>
  )
}

function Item(props){


  var onPressEvent;
  var onLongPressEvent;
  var MoreComp;

  if (!props.show){
    props.show_set_ref.current.delete(props.title);
    return null
  }

  props.show_set_ref.current.add(props.title);

  if (props.select_mode){
    onPressEvent = () => {
      props.updateSelectSet(props.title);
    };

    onLongPressEvent = () => {}

    MoreComp = (
      <CheckBox
          center
          size = {28}
          checked= {props.select}
          checkedColor = {color.dark_pup}
          onPress={() => props.updateSelectSet(props.title)}
          />
    )
  }else{
    onPressEvent = () => {
      showMessage({
        message: "Success",
        description: "ALL",
        type: "success"})
    };

    onLongPressEvent = () => {
      props.setSelectMode(true);
      props.updateSelectSet(props.title);
    }

    MoreComp = (
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
          props.setModalMore(true);
        }}
      />
    )
  }

  return (
    <View style={{...styles.containerRow,
      paddingLeft: 22,
      borderTopWidth: 1,
      borderColor: color.light_pup,
      backgroundColor: (props.select) ? color.light_pup2 : 'white'
    }}>
      <TouchableOpacity
        style = {{flex: 10,
          height:'100%',
        }}
        onPress = {onPressEvent}
        onLongPress = {onLongPressEvent}
      >
        <View style = {{justifyContent: 'flex-end',flex: 4}}>
          <Text numberOfLines={1} style={{fontSize:18}}>{props.title}</Text>
        </View>
        <View style = {{justifyContent: 'center', flex: 3}}>
          <Text style={{color: 'rgba(0,0,0,0.3)', fontSize:14}}>{props.date}</Text>
        </View>
      </TouchableOpacity>
      <View style = {{flex:2, justifyContent:'center', alignItems:'center'}}>
        {MoreComp}
      </View>
    </View>
  )

}
