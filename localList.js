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

import {color, styles, itemHeight, db, TRACK_DIR, itemFontSize} from './styleConst';
import {login} from './utils'
import {AddToLstModal, DeleteModal, AddPlstModal} from './localModal'

import { Button, Icon } from 'react-native-elements';
import { IconText } from './utilsComp';

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
  if (a.date < b.date){
    return 1;
  }
  return 0
}

function getNoshowSet(data_lst, filter_txt){
  let temp_set = new Set();

  data_lst.forEach((it) => {
    if (!it.key.toLowerCase().includes(filter_txt.toLowerCase())){
      temp_set.add(it.key);
    }
  })

  return(temp_set)
}

export function LocalList(props){
  // console.log('updating Locallist')

  const all_ref = useRef(props.navigation.getParam('all_tracks', false));
  // const all_ref = useRef(true);
  const lst_ref = useRef(props.navigation.getParam('plst_name', null));

  const [data_lst, _setDataLst] = useState([]);
  // const [select_set, setSelectSet] = useState(new Set());
  const select_set_ref = useRef(new Set());
  const [noshow_set, setNoshowset] = useState(new Set());
  const [select_mode, setSelectMode] = useState();
  const [order_idex, setOrdId] = useState(1);
  const [filter_txt, setFilTx] = useState('');

  const [global_select, setGloSelect] = useState(false);
  // const show_set_ref = useRef(new Set());

  const [show_modal_more, setModalMore] = useState(false);
  const [show_modal_playlist, setModalPlaylist] = useState(false);
  const [show_modal_delete, setModalDel] =  useState(false);
  const [show_modal_add_plst, setModalAddPlst] =  useState(false);


  const key_ref = useRef();
  const data_lst_ref = useRef();
  const plst_ref = useRef();

  var SelectControl;
  var ModalPlaylist;

  // console.log('refreshing');

  var db_fetch_query;
  if (all_ref.current){
    db_fetch_query = `SELECT * FROM Tracks`
  }else{
    db_fetch_query = `SELECT * FROM Tracks
                      WHERE track_name in (
                        SELECT fk_track_name FROM Linking
                        WHERE fk_lst_name = '${lst_ref.current}'
                      )`
  }

  const setDataLst = useCallback((lst) => {
    _setDataLst(lst);
    data_lst_ref.current = lst.map((it) => it.key);
  }, []);

  const exitSelectMode = useCallback(() => {
    select_set_ref.current =  new Set();
    setSelectMode(false);
    setGloSelect(false);
  }, []);

  const flatlist_getItemLayout = useCallback((data, index) => (
    {length: itemHeight, offset: itemHeight * index, index}
  ), []);


  const updateSelectSet = useCallback((id) => {
    if (select_set_ref.current.has(id)){
      select_set_ref.current.delete(id);
    }else{
      select_set_ref.current.add(id);
    }
  }, [])

  const onDbSuccessFetch = useCallback((_, {rows: {_array}}) => {
    setDataLst(
      orderLst(
        _array.map((it) => ({key: it.track_name, date: it.date})),
        order_idex
      )
    );
  }, [order_idex]);

  const afterAddPlst = useCallback(() => {
    setModalPlaylist(true);
  }, []);

  const fetchShowLst = useCallback(() => {
    // console.log(db_fetch_query)
    db.transaction(tx => {
      tx.executeSql(
        db_fetch_query,
        null,
        onDbSuccessFetch,
        (_, error) => console.log(error)
      );
    });
  },[order_idex]);

  const onGloSelect = useCallback((id) => {
    var next_status_checked = !global_select;
    data_lst.forEach(({key}) => {
      if(!noshow_set.has(key)) {
        if(next_status_checked){
          select_set_ref.current.add(key)
        }else{
          select_set_ref.current.delete(key)
        }
      }
    });
    setGloSelect(next_status_checked);
  }, [data_lst, global_select, noshow_set]);

  const onDeleteClick = useCallback(() => {
    if (select_set_ref.current.size == 0){
      Alert.alert('No track was selected!')
    }else {
      setModalDel(true);
    }
  }, []);

  const onAdd2PlstClick = useCallback(() => {
    if (select_set_ref.current.size == 0){
      Alert.alert('No track was selected!')
    }else {
      setModalPlaylist(true);
    }
  }, []);

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


  if (! all_ref.current ){
    ModalPlaylist = null
  }else{
    ModalPlaylist = (
      <AddToLstModal
        show = {show_modal_playlist}
        setShow = {setModalPlaylist}
        setModalAddPlst = {setModalAddPlst}
        plst_ref={plst_ref}
        select_mode = {select_mode}
        select_set_ref = {select_set_ref}
        key_ref = {key_ref}
        exitSelectMode = {exitSelectMode}
      />
    )
  }

  if (select_mode){
    SelectControl = (
      <View style = {{...styles.containerRow, height: itemHeight, backgroundColor:color.light_grey}}>
        <View style = {{
          flexDirection: 'row',
          flex: 10, alignSelf: 'stretch',
          paddingLeft: 10, paddingRight:10,
          alignItems:'center'
        }}>
          {
            (all_ref.current) &&
            <TouchableOpacity
              style = {{...styles.pupContainer, flex:1}}
              onPress={onAdd2PlstClick}
            >
              <Text style={{fontSize:itemFontSize+2, color:color.primary}}>Add To</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity
            style = {{...styles.pupContainer, flex:1}}
            onPress={onDeleteClick}
          >
            <Text style={{fontSize:itemFontSize+2, color:color.primary}}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style = {{...styles.pupContainer, flex:1}}
            onPress={exitSelectMode}
          >
            <Text style={{fontSize:itemFontSize+2, color:color.dark_pup}}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style = {{flex:2, justifyContent:'center', alignItems:'center'}}
          onPress = {onGloSelect}
        >
          <CheckBox
              center
              Component = {View}
              size = {itemFontSize+10}
              checked= {global_select}
              checkedColor = {color.light_pup}
              />
        </TouchableOpacity>
      </View>
    )
  }else{
    SelectControl = null;
  }

  var ModalMore = (
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
          {
            all_ref.current &&
            <View style = {{alignSelf:'stretch'}}>
              <IconText
                title = 'Add to Playlist'
                iconName = 'playlist-add'
                iconColor = {color.primary}
                onItemClick = {()=> {
                  setModalPlaylist(true);
                  setModalMore(false);
                }}
              />
              <View style = {styles.graySeparator}/>
            </View>
          }
          <IconText
            title = 'Delete Track'
            iconName = 'delete'
            onItemClick = {()=> {
              setModalDel(true);
              setModalMore(false);
            }}
          />
        </View>
      </View>
    </Modal>
  )

  var ModalDel = (
    <DeleteModal
      show = {show_modal_delete}
      setShow = {setModalDel}
      select_mode = {select_mode}
      select_set_ref = {select_set_ref}
      all_ref = {all_ref}
      lst_ref = {lst_ref}
      key_ref = {key_ref}
      exitSelectMode = {exitSelectMode}
      fetchShowLst = {fetchShowLst}
    />
  )

  var ModalAddPlst = (
    <AddPlstModal
      show_modal = {show_modal_add_plst}
      setShowModal = {setModalAddPlst}
      plst_ref={plst_ref}
      afterFunc = {afterAddPlst}
    />
  )

  var MainView = (
    <View style = {styles.afterStatus}>
      { false &&
        <View style={{alignSelf: 'stretch'}}>
          <Text numberOfLines={1} style={{
            paddingTop: 10,
            paddingLeft: 25,
            paddingRight: 25,
            fontSize:26,
            color: color.light_pup
          }}>
            {`${lst_ref.current} :`}
          </Text>
        </View>
      }
      <View style = {{
        alignSelf : "stretch",
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor: color.light_grey
        // borderBottomColor: color.light_pup,
        // borderBottomWidth: 2,
        // borderRadius:5
      }}>
        <SearchBar
          containerStyle = {{
            ...styles.grayControl,
            flex: 8,
            borderBottomWidth: 0,
            borderTopWidth:0
          }}
          inputContainerStyle = {{
            backgroundColor: 'white',
            height: itemHeight - itemFontSize,
            borderRadius: 4
          }}
          inputStyle = {{
            fontSize: itemFontSize + 2,
            // color: 'black'
          }}
          placeholder="Search Here..."
          onChangeText={text => setFilTx(text)}
          value={filter_txt}
        />
        <TouchableOpacity
          style = {{
            ...styles.whiteTouchable,
            flex:2,
            marginRight:itemFontSize-10,
          }}
          onPress = {() => {
            setOrdId(1 - order_idex);
          }}
        >
          <Text style = {{
            color: color.primary,
            fontSize: itemFontSize+2,
          }}>{['Name↓','Date↓'][order_idex]}</Text>
        </TouchableOpacity>
      </View>
      <View style = {{
        flex: 1,
        alignSelf: 'stretch',
      }}>
        <FlatList
          data={data_lst}
          extraData={[noshow_set, select_mode]}
          getItemLayout={flatlist_getItemLayout}
          initialNumToRender = {11}
          renderItem={({item, index}) => <Item
                                    title={item.key}
                                    date = {item.date}
                                    show = {!!!noshow_set.has(item.key)}
                                    select_mode = {select_mode}
                                    setSelectMode = {setSelectMode}
                                    updateSelectSet = {updateSelectSet}
                                    select = {select_set_ref.current.has(item.key)}
                                    key_ref = {key_ref}
                                    setModalMore = {setModalMore}
                                    index = {index}
                                    data_lst_ref = {data_lst_ref}
                                    navigation = {props.navigation}
                                  />}
        />
      </View>
      {SelectControl}
    </View>
  )

  return (
    <View style={styles.allView} behavior={'padding'}>
      {MainView}
      {ModalMore}
      {ModalPlaylist}
      {ModalDel}
      {ModalAddPlst}
      { false &&
      (<View>
        <Button
          title = 'test1'
          onPress = {() => {
            db.transaction(tx => {
              tx.executeSql(
                `SELECT * FROM Linking WHERE fk_lst_name = '1'`,
                null,
                (_, {rows: {_array}}) => {
                  console.log(_array);
                },
                (_, error) => console.log(error)
              );
            });
          }}
        />
        <Button
          title = 'test2'
          onPress = {() => {
            db.transaction(tx => {
              tx.executeSql(
                `SELECT * FROM Tracks`,
                null,
                (_, {rows: {_array}}) => {
                  console.log(_array);
                },
                (_, error) => console.log(error)
              );
            });
          }}
      />
    </View>)
    }
    </View>
  )
}

function areItemEqual(prevProps, nextProps) {
  return (
    nextProps.show == prevProps.show &&
    nextProps.select ==  prevProps.select &&
    nextProps.select_mode == prevProps.select_mode &&
    nextProps.index == prevProps.index
  )
}

const Item = React.memo(_Item, areItemEqual);

function _Item(props){
  // if(props.title=='Photograph - Ed Sheeran (Lyrics)-qgmXPCX4VzU.mp3'){
  //   console.log(props.index);
  // }
  var onPressEvent;
  var onLongPressEvent;
  var MoreComp;

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(props.select);
  }, [props])



  const navigateToPlay = useCallback(() => {
    console.log(props.index);
    props.navigation.navigate('Play', {init_data: {
      playlst: props.data_lst_ref.current,
      init_index: props.index
    }})
  },[props.index])

  if (!props.show){
    // props.show_set_ref.current.delete(props.title);
    return null
  };

  // props.show_set_ref.current.add(props.title);

  if (props.select_mode){
    onPressEvent = () => {
      setChecked(!checked);
      props.updateSelectSet(props.title);
    };

    onLongPressEvent = () => {}

    MoreComp = (
      <CheckBox
          center
          size = {itemFontSize+10}
          checked= {checked}
          checkedColor = {color.dark_pup}
          onPress={onPressEvent}
          />
    )
  }else{
    onPressEvent = navigateToPlay;

    onLongPressEvent = () => {
      props.setSelectMode(true);
      props.updateSelectSet(props.title);
      setChecked(true);
    }

    MoreComp = (
      <Button
        flex={1}
        icon={
          <Icon
           name="more-vert"
           size={itemFontSize*2}
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
      backgroundColor: (checked) ? color.light_pup2 : 'white',
      borderBottomWidth:1,
      borderColor: color.light_pup
    }}>
      <TouchableOpacity
        style = {{flex: 10,
          height:'100%'
        }}
        onPress = {onPressEvent}
        onLongPress = {onLongPressEvent}
      >
        <View style = {{justifyContent: 'flex-end',flex: 4}}>
          <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{props.title}</Text>
        </View>
        <View style = {{justifyContent: 'center', flex: 3}}>
          <Text style={{color: 'rgba(0,0,0,0.3)', fontSize:itemFontSize-4}}>{props.date.split(' ')[0]}</Text>
        </View>
      </TouchableOpacity>
      <View style = {{flex:2, justifyContent:'center', alignItems:'center'}}>
        {MoreComp}
      </View>
    </View>
  )

}
