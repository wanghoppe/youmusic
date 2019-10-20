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


import {color, styles, itemHeight} from './styleConst';


import {PlayComp} from './might';

export function List(props){
  console.log('updating whole view');
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


  var mainView;
  var selectControl;

  async function generate_lst(){
    try{
      // generate list
      const local_lst = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const local_set = new Set(local_lst);

      const cloud_lst = await Storage.list('', {level: 'private'});
      data_map_ref.current = new Map(cloud_lst.map((item) => ([item.key, {
          prog: local_set.has(item.key) ? 1: 0
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
        prog: val.prog,
        show: lst[filter_idex].includes(val.prog) && key.toLowerCase().includes(filter_txt)
      }));

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
    login()
      .then(() => generate_lst());
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
        {selectControl}
        <FlatList
          data={show_lst}
          extraData={[select_set, select_mode, global_select]}
          getItemLayout={flatlist_getItemLayout}
          renderItem={({item}) => <PureItem
                                    prog={item.prog}
                                    title={item.key}
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
        <Text style = {{fontSize: 18}}>Explore</Text>
      </View>
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
            textStyle = {{flex: 1, fontSize: 16, backgroundColor:color.light_gre}}
            dropdownStyle = {{backgroundColor: color.light_grey, height: 204}}
            defaultIndex = {0}
            defaultValue = {'All'}
            options={['All', 'Undownload', 'Loading', 'Downloaded']}
            renderRow = {(option)=>(
              <View style = {{alignItems: 'center', justifyContent: 'center', height: 50}}>
                <Text style={{fontSize:18}}>{option}</Text>
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
            style = {{flex:2}}
            title = {'DA'}
            onPress = { async () => {
              const local_lst = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
              local_lst.forEach((item) => {
                FileSystem.deleteAsync(FileSystem.documentDirectory + encodeURIComponent(item));
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
        FileSystem.documentDirectory + encodeURIComponent(props.title),
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

  if (loading){
    downButton = (
        <Progress.CircleSnail size={26} color={color.light_pup} thickness={3}/>
    )
  }else{
    downButton = (
      <Button title={'DOWN'}
              disabled = {prog == 1}
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
          <Text style={{fontSize: 16}}>{props.title}</Text>
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
            <Button title={'DEL'}
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
          <Text style={{fontSize: 16}}>{props.title}</Text>
        </TouchableOpacity>
      )
    }

  if (props.show){
    returnView = (
      <View style = {{...styles.containerRow}}>
        {checkBox}
        <View
          style = {{flex: 8, alignSelf: 'stretch', padding: 10,
                        justifyContent:'center'}}>
            <Progress.Bar styles = {{alignSelf: 'stretch', position: 'absolute'}}
                                    color = 'rgba(204, 122, 155, 0.5)'
                                    progress={prog}
                                    borderRadius={15}
                                    width = {null}
                                    height = {itemHeight-15}/>
            <ScrollView style = {{height: '100%', position: 'absolute', marginLeft: 12}} horizontal={true}>
              {touchable}
            </ScrollView>
        </View>
        {buttonGrop}
      </View>
    )
  }else{
    returnView = null;
  }

  return returnView;
}

async function login(){
  try{
    const user = await Auth.signIn('wanghp000@gmail.com', '123456789');
    if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
      const loggedUser = await Auth.completeNewPassword(
        user, '123456789'
      )
    };
    info = await Auth.currentUserInfo();

    showMessage({
      message: "Login Success",
      description: "Login as "+ info.attributes.email,
      type: "success"})
    console.log(info);
  }catch{
    console.log(err);
  }
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
  showMessage({
    message: "Success",
    description: res_json.download + " is downloaded to cloud",
    type: "success"})
  console.log(res_json.download + " is downloaded to cloud");
}
