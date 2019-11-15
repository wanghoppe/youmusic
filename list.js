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
import { Icon } from 'react-native-elements'

import { createStackNavigator } from 'react-navigation-stack';


import {color, styles, itemHeight, TRACK_DIR, db, itemFontSize, itemOffset} from './styleConst';
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

export const CloudList = createStackNavigator(
  {
    CloudList: List
  },
  {
    defaultNavigationOptions:{
      title: 'Cloud',
      headerStyle: {
          backgroundColor: color.light_pup2,
        },
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }
);

function List(props){
  // console.log('updating whole view');
  const [ready, setReady] = useState(false);
  const data_map_ref = useRef();
  const [filter_idex, setFilid] = useState(0);
  const [filter_txt, setFilTx] = useState('');
  const [show_lst, setShowLst] = useState([]);
  const [toggle_filter, setToggleFil] = useState(true);
  const toggle_ref = useRef(toggle_filter);
  const llst_ref = useRef([]);
  const lcount_ref = useRef(0);

  const [select_set, setSelectSet] = useState(new Set());
  const [select_mode, setSelectMode] = useState(false);
  const [global_select, setGloSelect] = useState(false);

  const force_down_set_ref = useRef(new Set())

  const [orderBy, setOrder] = useState(0);


  var mainView;
  var selectControl;

  async function generate_lst(){
    try{
      // generate list
      const local_lst = await FileSystem.readDirectoryAsync(TRACK_DIR);
      // console.log(local_lst);
      const local_set = new Set(local_lst);

      const cloud_lst = await Storage.list('', {level: 'private'});

      // console.log(cloud_lst);
      data_map_ref.current = new Map(cloud_lst.map((item) => ([item.key, {
        prog: local_set.has(item.key) ? 1: 0,
        date: date2string(item.lastModified),
        size: item.size
      }])));
      // setDataMap(data_map);
      filter_lst();
      setReady(true);
    }catch(err){
      console.log(err);
    }
  }

  function filter_lst(){
    let lst = [[0,1,2], [0], [2], [1]];

    let temp_lst;

    if (data_map_ref.current != undefined){
      temp_lst = Array.from(data_map_ref.current, ([key, val]) => ({
        key: key,
        date: val.date,
        size: val.size,
        prog: val.prog,
        show: lst[filter_idex].includes(val.prog) && key.toLowerCase().includes(filter_txt)
      }));
      temp_lst = orderLst(temp_lst, ['Date', 'Size'][orderBy]);

      console.log('Running filter_lst');
      setShowLst(temp_lst);
    }
  }

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

  const updateSelectMap = useCallback((id) => {
    let temp_set =  new Set(select_set);
    if (temp_set.has(id)){
      temp_set.delete(id);
    }else{
      temp_set.add(id);
    }
    setSelectSet(temp_set);
  }, [select_set])

  const flatlist_getItemLayout = useCallback((data, index) => (
    {length: itemHeight, offset: itemHeight * index, index}
  ),[])

  useEffect(() => {
    filter_lst();
    console.log('Running2');
  }, [filter_idex, filter_txt, toggle_filter]);

  useEffect(() => {
    // login()
    //   .then(() => generate_lst());
    generate_lst();
    console.log('Running1');
  }, []);

  useEffect(() => {
    if (show_lst != []){
      let temp_set = new Set(select_set);

      if (select_mode){
        show_lst.forEach(({key, show}) => {
          if(show){
            if(global_select){
              temp_set.add(key)
            }else{
              temp_set.delete(key)
            }
          }
        })
        setSelectSet(temp_set);
      }
    }
  }, [global_select]);

  useEffect(() => {
    if (ready){
      setShowLst(orderLst(show_lst, ['Date', 'Size'][orderBy]))
    }
  }, [orderBy])

  if (select_mode){
    selectControl = (
      <View style = {{...styles.containerRow, justifyContent: 'space-around', height: itemHeight}}>
        <CheckBox
            center
            size = {28}
            checked= {global_select}
            checkedColor = {color.light_pup}
            onPress={() => {setGloSelect(!global_select)}}
            />
        <Button
          title = {'Download'}
          onPress = {() => {
            let temp_set = new Set();
            select_set.forEach((item) => {
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
                  setSelectSet(new Set());
                  setSelectMode(false);
                }},
                {text: 'Cancel', onPress: () => {}, style: 'cancel'}
              ],
            )
          }}
          />
        <Button
          title = {'Delete'}
          onPress = {() => {
            Alert.alert(
              "Comfirm Delete",
              `Delete ${select_set.size} track from cloud?`,
              [
                {text: 'Yes', onPress: () => {
                  select_set.forEach(async (item) => {
                    result = await Storage.remove(item, {level: 'private'});
                    deleteMapWithId(item);
                  });
                  setSelectSet(new Set());
                }},
                {text: 'Cancel', onPress: () => {}, style: 'cancel'}
              ],
            )
          }}
          />
        <Button
          title = {'Cancel'}
          onPress = {() => {
            setSelectSet(new Set())
            setSelectMode(false);
          }}
          />
      </View>
    )
  }else{
    selectControl = null;
  }

  if (ready){
    mainView = (
      <View style = {{alignSelf: 'stretch', flex:1, justifyContent: 'flex-end'}}>
        <FlatList
          data={show_lst}
          extraData={[select_set, select_mode, global_select]}
          getItemLayout={flatlist_getItemLayout}
          renderItem={({item}) => <PureItem
                                    prog={item.prog}
                                    title={item.key}
                                    date={item.date}
                                    size={size2string(item.size)}
                                    show = {item.show}
                                    setProgWithId = {setProgWithId}
                                    deleteMapWithId = {deleteMapWithId}
                                    pushLoadingLst = {pushLoadingLst}
                                    updateCount = {updateCount}
                                    updateSelectMap ={updateSelectMap}
                                    selected = {select_set.has(item.key)}
                                    select_mode = {select_mode}
                                    setSelectMode = {setSelectMode}
                                    force_down_set_ref = {force_down_set_ref}
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
      <View style = {styles.afterStatus}>
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
            textStyle = {{fontSize: 20, alignItems: 'center'}}
            dropdownStyle = {{backgroundColor: color.light_grey, height: 204}}
            defaultIndex = {0}
            defaultValue = {'All'}
            options={['All', 'Undownload', 'Loading', 'Downloaded']}
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
            onSelect = {(index) => setFilid(index)}
          />
          <Button
            style = {{
              flex: 3,
              height:40}}
            title = {['Date', 'Size'][orderBy]}
            onPress = {() => {
              setOrder(1 - orderBy);
            }}
          />
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
          <View style = {{flex:2}}>
            <Icon
              name = 'refresh'
              size = {35}
              onPress ={() => {
                generate_lst();
              }}
              color={color.dark_pup}
            />
          </View>
        </View>
        {mainView}
      </View>
    </View>
  );
}

const PureItem = React.memo((props) => {
  return Item(props);
});

function Item(props){
  var returnView;
  var downButton;
  var checkBox;
  var buttonGrop;
  var touchable;

  const [prog, setProg] = useState(props.prog);
  const [loading, setLoading] = useState(false);

  async function downloadItemAsync(){
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
          setProg(progress);
          // props.updateMapProgWithId(props.title, progress);
        }
      );
      const xx = await downloadResumable.downloadAsync();

      setLoading(false);
      props.setProgWithId(props.title, 1);
      props.updateCount(false);

      // insert records into database
      // db.transaction(tx => {
      //   tx.executeSql(
      //     `SELECT
      //         name
      //     FROM
      //         sqlite_master
      //     WHERE
      //         type ='table' AND
      //         name NOT LIKE 'sqlite_%';`,
      //     [],
      //     (_, {rows: {_array}}) => console.log(_array),
      //     (_, error) => console.log(error)
      //   );
      // });

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
  }

  async function deleteItemAsync(){
    try{
      result = await Storage.remove(props.title, {level: 'private'});
      props.deleteMapWithId(props.title);
    }catch(err){
      console.log(result);
    }
  }

  useEffect(() => {
      if (props.force_down_set_ref.current.has(props.title)){
        props.force_down_set_ref.current.delete(props.title);
        setLoading(true);
        props.setProgWithId(props.title, 2);
        props.pushLoadingLst(downloadItemAsync);
    }
  })

  useEffect(() => {
    if ([0, 1].includes(props.prog)){
      setProg(props.prog);
    }
  }, [props.prog])

  if (loading){
    downButton = (
        <Progress.CircleSnail size={26} color={color.light_pup} thickness={3}/>
    )
  }else{
    downButton = (
      <Icon
        name = 'cloud-download'
        disabled = {prog == 1}
        disabledStyle = {{backgroundColor: null}}
        color = {(prog == 1)? 'grey': color.primary}
        size = {30}
        onPress={() => {
            setLoading(true);
            props.setProgWithId(props.title, 2);
            props.pushLoadingLst(downloadItemAsync);
        }}/>
    )
  }

  if (props.select_mode){
    checkBox = (
      <View style = {{flex:1, justifyContent:'center', alignItems:'center', marginLeft:10 }}>
        <CheckBox
            center
            size = {28}
            checked= {props.selected}
            checkedColor = {color.light_pup}
            onPress={() => props.updateSelectMap(props.title)}
            />
      </View>);
      buttonGrop = null;
      touchable = (
        <TouchableOpacity
          style = {{justifyContent:'center'}}
          onPress = {() => {
            props.updateSelectMap(props.title);
          }}>
          <Text style={{fontSize: itemFontSize}}>{props.title}</Text>
        </TouchableOpacity>
      );
    }else{
      checkBox = null;
      buttonGrop = (
        <View style = {{flex:2, alignItems:'center', flexDirection:'row'}}>
          <View style = {{flex:1, justifyContent:'center', alignItems:'center'}}>
            {downButton}
          </View>
          <View style = {{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Icon
              name = 'delete'
              size = {30}
              color = {color.dark_pup}
              onPress={ () => {
                Alert.alert(
                  "Comfirm Delete",
                  `Delete ${props.title} from cloud?`,
                  [
                    {text: 'Yes', onPress: deleteItemAsync },
                    {text: 'Cancel', onPress: () => {}, style: 'cancel'}
                  ],
                )
              }
          }/>
          </View>
        </View>
      );
      touchable = (
        <TouchableOpacity
          style = {{justifyContent:'center'}}
          onLongPress = {() => {
            console.log(`you long pressed ${props.title}`);
            props.setSelectMode(true);
          }}>
          <Text style={{fontSize: itemFontSize}}>{props.title}</Text>
        </TouchableOpacity>
      )
    }

  if (props.show){
    returnView = (
      <View style = {{...styles.containerRow}}>
        {checkBox}
        <View
          style = {{
            flex: 8, alignSelf: 'stretch',
            paddingLeft: 10, paddingRight:10,
            paddingTop: itemOffset/2, paddingBottom: itemOffset/2,
            justifyContent:'center'
          }}>
            <Progress.Bar styles = {{alignSelf: 'stretch', position: 'absolute'}}
                                    color = 'rgba(204, 122, 155, 0.5)'
                                    progress={prog}
                                    borderRadius={15}
                                    width = {null}
                                    height = {itemHeight-itemOffset}/>
            <TouchableOpacity
              style = {{width: '100%', height: '100%', position: 'absolute', paddingLeft: 14}}
              onLongPress = {(props.select_mode)? null: () => props.setSelectMode(true)}
              onPress = {(props.select_mode)? () => props.updateSelectMap(props.title) : null}
            >
              <View style = {{justifyContent: 'flex-end',flex: 4}}>
                <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{props.title}</Text>
              </View>
              <View style = {{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 3}}>
                <Text style={{color: 'rgba(0,0,0,0.6)', fontSize:itemFontSize-4}}>{props.date}</Text>
                <Text style={{color: 'rgba(0,0,0,0.6)', fontSize:itemFontSize-4}}>{props.size}</Text>
              </View>
            </TouchableOpacity>
        </View>
        {buttonGrop}
      </View>
    )
  }else{
    returnView = null;
  }

  return returnView;
}

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
