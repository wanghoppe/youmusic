import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import { TouchableHighlight, TouchableOpacity, Alert, Picker,
  StyleSheet, Text, View, TextInput, Animated,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList,RefreshControl } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import { Storage, Auth } from 'aws-amplify';
import { SearchBar, CheckBox } from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import { Button, Icon } from 'react-native-elements'

import { createStackNavigator } from 'react-navigation-stack';
import { withNavigationFocus } from 'react-navigation';


import {
  color, styles,
  itemHeight, TRACK_DIR,
  db, itemFontSize,
  itemOffset, global_debug
} from './styleConst';

import {login} from './utils'

import {PlayComp} from './might';

function date2string(date){
  date.setMinutes(
    date.getMinutes() - date.getTimezoneOffset()
  );
  return date.toISOString().slice(0,16).replace('T', ' ')
}

function size2string(size){
  return `${(size/(1024*1024).toFixed(1)).toFixed(1)} MB`
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

function orderSize(a, b){
  if (a.size > b.size){
    return -1;
  }
  if (a.size < b.size){
    return 1;
  }
  return 0
}

function orderLst(lst, by){
  if (by == 'Size'){
    return [...lst].sort(orderSize);
  }else{
    return [...lst].sort(orderDate);
  }
}

// export const CloudList = createStackNavigator(
//   {
//     CloudList: withNavigationFocus(List)
//   },
//   {
//     defaultNavigationOptions:{
//       title: 'Cloud',
//       headerStyle: {
//           backgroundColor: color.light_pup2,
//         },
//       headerTitleStyle: {
//         fontWeight: 'bold',
//       }
//     }
//   }
// );
export const CloudList = withNavigationFocus(_CloudList);

function _CloudList(props){
  // console.log('updating whole view');
  const [ready, setReady] = useState(false);
  const data_map_ref = useRef();
  const [filter_idex, setFilid] = useState(0);
  const [filter_txt, setFilTx] = useState('');
  const [show_lst, _setShowLst] = useState([]);
  const show_lst_ref = useRef();
  const [toggle_filter, setToggleFil] = useState(true);
  const toggle_ref = useRef(toggle_filter);
  const llst_ref = useRef([]);
  const lcount_ref = useRef(0);

  const select_set_ref = useRef(new Set());

  const [select_mode, setSelectMode] = useState(false);
  const [global_select, setGloSelect] = useState(false);

  const force_down_set_ref = useRef(new Set())

  const [orderBy, setOrder] = useState(0);

  const focuse_ref = useRef(false);

  const [refreshing, setRefresh] = useState(false);

  var mainView;
  var selectControl;

  const setShowLst = useCallback((lst)=>{
    _setShowLst(lst);
    show_lst_ref.current = lst;
  }, [])

  const filter_lst = useCallback(() => {
    let lst = [[0,1,2], [0], [2], [1]];

    let temp_lst;

    if (data_map_ref.current != undefined){
      temp_lst = Array.from(data_map_ref.current, ([key, val]) => ({
        key: key,
        date: val.date,
        size: val.size,
        prog: val.prog,
        show: lst[filter_idex].includes(val.prog) && key.toLowerCase().includes(filter_txt.toLowerCase())
      }));
      temp_lst = orderLst(temp_lst, ['Date', 'Size'][orderBy]);

      console.log('Running filter_lst');
      setShowLst(temp_lst);
    }
  }, [filter_idex, filter_txt, orderBy])

  const _get_prog = (key, data_map, local_set) => {
    try{
      return data_map.get(key).prog == 2 ? 2:(local_set.has(key.split('-').pop()) ? 1: 0);
    }catch{
      return local_set.has(key.split('-').pop()) ? 1: 0
    }
  }

  const generate_lst = useCallback(async () => {
    try{
      // generate list
      const local_lst = await FileSystem.readDirectoryAsync(TRACK_DIR);
      // console.log(local_lst);
      const local_set = new Set(local_lst.map(item => item.split('-').pop()));
      // console.log(local_set)
      const cloud_lst = await Storage.list('', {level: 'private'});

      data_map_ref.current = new Map(cloud_lst.map((item) => ([item.key, {
        prog: _get_prog(item.key, data_map_ref.current, local_set),
        date: date2string(item.lastModified),
        size: item.size
      }])));
      // setDataMap(data_map);
      filter_lst();
      setReady(true);
    }catch(err){
      console.log(err);
    }
  }, [filter_idex, filter_txt, orderBy]);

  const setProgWithId = useCallback((id, prog) => {
    data_map_ref.current.set(
      id, {...data_map_ref.current.get(id), prog:prog}
    );
    console.log("[INFO].......: set" + id + ' to '+ prog)
    toggle_ref.current = !toggle_ref.current;
    setToggleFil(toggle_ref.current);
  }, []);

  const deleteMapWithId = useCallback((id) => {
    data_map_ref.current.delete(id);
    toggle_ref.current = !toggle_ref.current;
    setToggleFil(toggle_ref.current);
  },[]);

  const pushLoadingLst = useCallback((item) => {
    llst_ref.current = [...llst_ref.current, item];
    checkIfFire();
  }, [])

  const updateCount = useCallback((add) => {
    if (add){
      lcount_ref.current = lcount_ref.current + 1;
    }else{
      lcount_ref.current = lcount_ref.current - 1;
      checkIfFire();
    }
  }, [])

  const checkIfFire = useCallback(() => {
    if (lcount_ref.current < 3){
      let temp_item = llst_ref.current.shift();
      if (temp_item != undefined){
        temp_item();
      }
    }
  }, [])

  const updateSelectRef = useCallback((id) => {
    if (select_set_ref.current.has(id)){
      select_set_ref.current.delete(id);
    }else{
      select_set_ref.current.add(id);
    }
  }, [])

  const onGloSelect = useCallback((id) => {
    var next_status_checked = !global_select;
    show_lst.forEach(({key, show}) => {
      if(show){
        if(next_status_checked){
          select_set_ref.current.add(key)
        }else{
          select_set_ref.current.delete(key)
        }
      }
    });
    setGloSelect(next_status_checked);
  }, [show_lst, global_select]);

  const flatlist_getItemLayout = useCallback((data, index) => (
    {length: itemHeight, offset: itemHeight * index, index}
  ),[])

  const onGloDownloadClick = useCallback(() => {
    let temp_set = new Set();
    select_set_ref.current.forEach((item) => {
      if (data_map_ref.current.get(item).prog == 0){
        temp_set.add(item);
      }
    })
    Alert.alert(
      "Comfirm Download",
      `Download ${temp_set.size} track from cloud?`,
      [
        {text: 'Yes', onPress: () => {
          force_down_set_ref.current = temp_set;
          select_set_ref.current = new Set();
          setSelectMode(false);
          setGloSelect(false);
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'}
      ],
    )
  }, []);

  const onGloDeleteClick = useCallback(() => {
    Alert.alert(
      "Comfirm Delete",
      `Delete ${select_set_ref.current.size} track from cloud?`,
      [
        {text: 'Yes', onPress: () => {
          select_set_ref.current.forEach(async (item) => {
            result = await Storage.remove(item, {level: 'private'});
            deleteMapWithId(item);
          });
          select_set_ref.current = new Set();
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'}
      ],
    )
  }, []);

  const onGloCancelClick = useCallback(() =>{
    select_set_ref.current = new Set()
    setSelectMode(false);
    setGloSelect(false);
  }, [])

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    await generate_lst()
    setRefresh(false);
  }, [filter_idex, filter_txt, orderBy])

  useEffect(() => {
    filter_lst();
    // console.log('Running');
  }, [filter_idex, filter_txt, toggle_filter]);

  useEffect(() => {
    if (ready){
      setShowLst(orderLst(show_lst, ['Date', 'Size'][orderBy]))
    }
  }, [orderBy])

  useEffect(() => {
    focuse_ref.current = props.isFocused;
    if (props.isFocused){
      onRefresh();
    }
  }, [props.isFocused])

  if (select_mode){
    selectControl = (
      <View style = {{...styles.containerRow, height: itemHeight, backgroundColor:color.light_grey}}>
        <View style = {{
          flexDirection: 'row',
          flex: 9, alignSelf: 'stretch',
          paddingLeft: 10, paddingRight:10,
          alignItems:'center'
        }}>
          <TouchableOpacity
            style = {{...styles.pupContainer, flex:3}}
            onPress={onGloDownloadClick}
          >
            <Text style={{fontSize:itemFontSize+2, color:color.primary}}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style = {{...styles.pupContainer, flex:3}}
            onPress={onGloDeleteClick}
          >
            <Text style={{fontSize:itemFontSize+2, color:color.primary}}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style = {{...styles.pupContainer, flex:3}}
            onPress={onGloCancelClick}
          >
            <Text style={{fontSize:itemFontSize+2, color:color.dark_pup}}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style = {{...styles.pupContainer, flex:1, height:null, backgroundColor: color.light_grey, marginRight:itemFontSize-8}}
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
    selectControl = null;
  }

  if (ready){
    mainView = (
      <View style = {{alignSelf: 'stretch', flex:1, justifyContent: 'flex-end'}}>
        <FlatList
          refreshControl = {
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.dark_pup}
              colors={[color.dark_pup]}
            />
          }
          tintColor = {color.dark_pup}
          data={show_lst}
          extraData={[select_mode, global_select]}
          getItemLayout={flatlist_getItemLayout}
          initialNumToRender = {11}
          renderItem={({item, index}) => <PureItem
                                    prog={item.prog}
                                    index={index}
                                    title={item.key}
                                    date={item.date}
                                    size={size2string(item.size)}
                                    show = {item.show}
                                    setProgWithId = {setProgWithId}
                                    deleteMapWithId = {deleteMapWithId}
                                    pushLoadingLst = {pushLoadingLst}
                                    updateCount = {updateCount}
                                    updateSelectRef ={updateSelectRef}
                                    selected = {select_set_ref.current.has(item.key)}
                                    select_mode = {select_mode}
                                    setSelectMode = {setSelectMode}
                                    force_down_set_ref = {force_down_set_ref}
                                    focuse_ref = {focuse_ref}
                                    show_lst_ref = {show_lst_ref}
                                    navigation={props.navigation}
                                  />}
        />
        {selectControl}
      </View>
    )
  }else{
    mainView = (
      <View style = {{flex:1, justifyContent:'center'}}>
        <Progress.CircleSnail size={60} color={color.light_pup} thickness={4}/>
      </View>
    )
  }

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style={{fontWeight: "bold", fontSize: itemFontSize+2}}>CLOUD</Text>
        {false && <View style = {{position: 'absolute', right: '5%'}}>
          <Icon
            name = 'refresh'
            size = {itemFontSize*2}
            onPress ={() => {
              onRefresh();
            }}
            color={color.primary}
          />
        </View>}
      </View>
      <View style = {styles.afterStatus}>
        <View style = {{
          backgroundColor: color.light_grey,
          alignSelf : "stretch",
          flexDirection: 'row',
          alignItems:'center',
        }}>
          <SearchBar
            containerStyle = {{
              ...styles.grayControl,
              flex: 7,
              borderTopWidth:0,
              borderBottomWidth:0
            }}
            inputContainerStyle = {{
              backgroundColor: 'white',
              height: itemHeight - itemFontSize,
              borderRadius: 4
            }}
            inputStyle = {{
              fontSize: itemFontSize + 2,
            }}
            placeholder="Search Here..."
            onChangeText={text => setFilTx(text)}
            value={filter_txt}
            />
          <ModalDropdown
            style = {{
              flex: 2,
              alignItems:'center',
              backgroundColor: 'white',
              justifyContent:'center',
              height:itemHeight - itemFontSize,
              borderRadius: 4,
              marginRight:itemFontSize-10,
            }}
            textStyle = {{fontSize: itemFontSize+2, padding:10, alignItems: 'center', color: color.primary}}
            dropdownStyle = {{backgroundColor: color.light_grey, height: itemHeight*4}}
            showsVerticalScrollIndicator={false}
            defaultIndex = {0}
            defaultValue = {'  All  '}
            options={['  All  ', 'Undownload', 'Loading', 'Downloaded']}
            renderRow = {(option)=>(
              <TouchableOpacity style = {styles.grayControl}>
                <View style={{...styles.whiteTouchable, alignSelf:'stretch'}}>
                  <Text style={{fontSize:itemFontSize+2, color: color.primary}}>{option}</Text>
                </View>
              </TouchableOpacity>
            )}
            renderSeparator = {() => (<View/>)}
            onSelect = {(index) => setFilid(index)}
          />
          <TouchableOpacity
            style = {{
              ...styles.whiteTouchable,
              flex:2,
              marginRight:itemFontSize-10
            }}
            onPress = {() => {
              setOrder(1 - orderBy);
            }}
          >
            <Text style = {{
              color: color.primary,
              fontSize: itemFontSize+2,
            }}>{['Date↓', 'Size↓'][orderBy]}</Text>
          </TouchableOpacity>
          {global_debug && <TouchableOpacity
            style = {{...styles.grayContainer, flex:2, height: 40, marginRight:7}}
            onPress = {async () => {
              const local_lst = await FileSystem.readDirectoryAsync(TRACK_DIR);
              local_lst.forEach((item) => {
                FileSystem.deleteAsync(TRACK_DIR + encodeURIComponent(item));
              })
              console.log('Line205: delete all local files');
            }}
          >
            <Text style = {{
              color: color.primary,
              fontSize: 20,
            }}>delete</Text>
          </TouchableOpacity>}
          {false && (<View style={{flex:5, height:55}}>
            <Button
              style = {{flex:2}}
              title = {'DA'}
              onPress = { async () => {
                const local_lst = await FileSystem.readDirectoryAsync(TRACK_DIR);
                local_lst.forEach((item) => {
                  FileSystem.deleteAsync(TRACK_DIR + encodeURIComponent(item));
                })
                console.log('Line205: delete all local files')
              }}
            />
            <Button
              style = {{flex:2}}
              title = {'DA2'}
              onPress = { async () => {
                const data = [
                  'qZ5U7s8T5oI','VArUc-bCanQ','ZHFgk8Eo0FE','ioIEjzR7Xj8',
                  'Z16qw94gP4w','TV7DeM0Jqik','5XgnwopNyn0','p0GPJbdKhCw',
                  'NSwQ0OlwUn0','4HgNzGHbB5Y','cb2hVNAhPJ4','79t4chAseE',
                  'zcrx7OVoypM','C6YobfNjeqc','4ROBQMlh3Ew','8m7hxhyr4jc'
                ];
                data.forEach((item) =>{
                  download2cloud(item);
                })
              }}
            />
          </View>)}
        </View>
        {mainView}
      </View>
    </View>
  );
}

function areItemEqual(prevProps, nextProps) {
  return (
    nextProps.prog == prevProps.prog &&
    nextProps.show == prevProps.show &&
    nextProps.selected ==  prevProps.selected &&
    nextProps.select_mode == prevProps.select_mode &&
    nextProps.index == prevProps.index
  )
}

const PureItem = React.memo(Item, areItemEqual);

function Item(props){

  var returnView;

  const [prog, setProg] = useState(props.prog);
  const [loading, setLoading] = useState(false);
  const [checked, _setChecked] = useState(false);
  const checked_ref =  useRef(checked);
  const select_mode_ref = useRef(props.select_mode);
  const setProg_ref = useRef();
  const index_ref = useRef(props.index)

  const setChecked = useCallback((value)=>{
    _setChecked(value);
    checked_ref.current = value;
  },[])

  const downloadItemAsync = useCallback(async () => {
    try{
      props.updateCount(true);
      const temp_url = await Storage.get(
        props.title, { level: 'private'}
      );
      const downloadResumable = FileSystem.createDownloadResumable(
        temp_url,
        TRACK_DIR + encodeURIComponent(props.title),
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;

          if (props.focuse_ref.current || progress == 1){
            if (setProg_ref.current){
              setProg_ref.current(progress)
            }
          }
        }
      );
      const xx = await downloadResumable.downloadAsync();

      setLoading(false);
      props.setProgWithId(props.title, 1);
      props.updateCount(false);

      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO Tracks (track_name, date)
            VALUES ('${props.title}', datetime('now', 'localtime'))`,
          [],
          () => console.log(props.title + ' inserted into database'),
          (_, error) => console.log(error)
        );
      });

      console.log(props.title + ' downloaded');
    }catch(err){
      console.log(err);
    }
  }, []);

  const deleteItemAsync = useCallback(async () => {
    try{
      result = await Storage.remove(props.title, {level: 'private'});
      props.deleteMapWithId(props.title);
    }catch(err){
      console.log(result);
    }
  }, [])

  const onCheckedClick = useCallback(() => {
    props.updateSelectRef(props.title);
    setChecked(!checked_ref.current);
  }, []);

  const onItemClick = useCallback(() => {
    Alert.alert(
      'Streaming Music?',
      null,
      [{text: 'Yes', onPress: () =>{
        props.navigation.navigate('Play', {init_data: {
          playlst: props.show_lst_ref.current.map(({key}) => (key)),
          init_index: index_ref.current,
          streaming: true
        }})
      }},
      {text: 'Cancel', onPress: () => {}, style: 'cancel'}]
    )
  }, []);

  const onDownloadClick = useCallback(() => {
    setLoading(true);
    props.setProgWithId(props.title, 2);
    props.pushLoadingLst(downloadItemAsync);
  },[])

  const onDeleteClick = useCallback(() => {
    Alert.alert(
      "Comfirm Delete",
      `Delete ${props.title} from cloud?`,
      [
        {text: 'Yes', onPress: deleteItemAsync },
        {text: 'Cancel', onPress: () => {}, style: 'cancel'}
      ],
    )
  },[])

  const onItemTextLongPress = useCallback(() => {
    if (!select_mode_ref.current){
      props.updateSelectRef(props.title);
      props.setSelectMode(true);
    }
  }, [])

  const onItemTextPress = useCallback(() => {
    if (select_mode_ref.current){
      onCheckedClick()
    }else{
      onItemClick()
    }
  }, [])

  useEffect(() => {
    if (props.force_down_set_ref.current.has(props.title)){
      props.force_down_set_ref.current.delete(props.title);
      setLoading(true);
      props.setProgWithId(props.title, 2);
      props.pushLoadingLst(downloadItemAsync);
    }
    setChecked(props.selected);

    if ([0, 1].includes(props.prog)){
      setProg(props.prog);
    }

    select_mode_ref.current = props.select_mode;
    index_ref.current = props.index;
  }, [props])


  const CheckB = useMemo(()=>(
    <View style = {{flex:1, justifyContent:'center', alignItems:'center', marginRight:itemFontSize-8}}>
      <CheckBox
          center
          size = {itemFontSize+10}
          checked= {checked}
          checkedColor = {color.light_pup}
          onPress={onCheckedClick}
          />
    </View>
  ), [checked]);

  if (!props.show){
    return null;
  }

  returnView = (
    <View style = {{...styles.containerRow}}>
      <ItemText
        prog = {prog}
        title = {props.title}
        date = {props.date}
        size = {props.size}
        onItemTextLongPress ={onItemTextLongPress}
        onItemTextPress={onItemTextPress}
        setProg_ref = {setProg_ref}
      />
      {props.select_mode? CheckB: null}
      {props.select_mode ||
        <ItemControl
          loading = {loading}
          prog = {prog}
          onDownloadClick = {onDownloadClick}
          onDeleteClick = {onDeleteClick}
        />
      }
    </View>
  )
  return returnView;
}

const ItemControl = React.memo(_ItemControl);
function _ItemControl(props){
  const {loading, prog, onDownloadClick, onDeleteClick} = props
  return(
    <View style = {{flex:2, alignItems:'center', flexDirection:'row'}}>
      <View style = {{flex:1, justifyContent:'center', alignItems:'center'}}>
        {loading?
          (<Progress.CircleSnail size={26} color={color.light_pup} thickness={3}/>):
          (<Icon
            name = 'cloud-download'
            disabled = {prog == 1}
            disabledStyle = {{backgroundColor: null}}
            color = {(prog == 1)? 'grey': color.primary}
            size = {itemFontSize*2}
            onPress={onDownloadClick}/>)
        }
      </View>
      <View style = {{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Icon
          name = 'delete'
          size = {itemFontSize*2}
          color = {color.dark_pup}
          onPress={onDeleteClick}/>
      </View>
    </View>
  )
}

const ItemText = React.memo(_ItemText);
function _ItemText(props){
  if(props.title=='Photograph - Ed Sheeran (Lyrics)-qgmXPCX4VzU.mp3'){
    // console.log(props.select)
    console.log(props.title);
  }
  const {title, date, size, prog, onItemTextLongPress, onItemTextPress, setProg_ref} = props;
  return(
    <View
      style = {{
        flex: 9, alignSelf: 'stretch',
        paddingLeft: 10, paddingRight:10,
        paddingTop: itemOffset/2, paddingBottom: itemOffset/2,
        justifyContent:'center',
      }}>

        <View
          style = {{
            width:'100%',
            height:'100%',
            borderRadius:15,
          }}>
          {false && <View ref ={progress_bar_ref}
            style = {{
              width: `${prog*100}%`,
              height:'100%',
              borderColor: color.light_pup2,
              backgroundColor: color.light_pup2
            }}
          />}
          {true &&
            <MyProgressBar
              prog={prog}
              setProg_ref={setProg_ref}
            />
          }
        </View>
        <TouchableOpacity
          style = {{width: '100%', height: '100%', position: 'absolute', paddingLeft: 14}}
          onLongPress = {onItemTextLongPress}
          onPress = {onItemTextPress}
        >
          <View style = {{justifyContent: 'flex-end',flex: 4}}>
            <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{title}</Text>
          </View>
          <View style = {{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 3}}>
            <Text style={{color: 'rgba(0,0,0,0.6)', fontSize:itemFontSize-4}}>{date}</Text>
            <Text style={{color: 'rgba(0,0,0,0.6)', fontSize:itemFontSize-4}}>{size}</Text>
          </View>
        </TouchableOpacity>
    </View>
  )
}

function MyProgressBar(props){
  const [prog, setProg] = useState(props.prog);

  useEffect(() =>{
    setProg(props.prog)
    props.setProg_ref.current = setProg;
  }, [props.prog])

  return(
    <Progress.Bar
      styles = {{alignSelf: 'stretch', position: 'absolute'}}
      color = 'rgba(204, 122, 155, 0.5)'
      progress={prog}
      borderRadius={15}
      width = {null}
      height = {itemHeight-itemOffset}
    />
  )
}

//
async function download2cloud(you_id){
  const user_info = await Auth.currentUserInfo();
  const user_id = info.id;
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
  key_ref.currentssage({
    message: "Success",
    description: res_json.download + " is downloaded to cloud",
    type: "success"})
  console.log(res_json.download + " is downloaded to cloud");
}
