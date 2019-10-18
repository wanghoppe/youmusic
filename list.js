import React, {useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Picker, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import { Storage, Auth } from 'aws-amplify';
import { SearchBar } from 'react-native-elements';
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



  var mainView;


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

  useEffect(() => {
    filter_lst();
    console.log('Running2');
  }, [filter_idex, filter_txt, toggle_filter]);

  useEffect(() => {
    login()
      .then(() => generate_lst());
    console.log('Running1');
  }, []);

  if (ready){
    mainView = (
      <View style = {{alignSelf: 'stretch', flex:1}}>
        <FlatList
          data={show_lst}
          renderItem={({item}) => <Item
                                    prog={item.prog}
                                    title={item.key}
                                    show = {item.show}
                                    setProgWithId = {setProgWithId}
                                    deleteMapWithId = {deleteMapWithId}
                                    pushLoadingLst = {pushLoadingLst}
                                    updateCount = {updateCount}
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
        </View>
        {mainView}
      </View>
    </View>
  );
//   [(<Button
//     title={'Button1'}
//     onPress={() => {
//       showMessage({
//         message: "Button1 Success",
//         type: "success"})
//     }}
//     />),
//   (<Button
//     title={'Button2'}
//     onPress={() => {
//       showMessage({
//         message: "Button2 Success",
//         type: "success"})
//     }}
//     />)]
// </ModalDropdown>
  // return(
  //   <View style={styles.allView} behavior={'padding'}>
  //     <View style = {styles.statusBar}>
  //       <Text style = {{fontSize: 18}}>Explore</Text>
  //     </View>
  //     <View style = {styles.afterStatus}>
  //       <Button title="log in"
  //               onPress = {async () => {
  //                 try{
  //                   const user = await Auth.signIn('wanghp000@gmail.com', '123456789');
  //                   if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
  //                     const loggedUser = await Auth.completeNewPassword(
  //                       user, '123456789'
  //                     )
  //                   };
  //                   info = await Auth.currentUserInfo();
  //
  //                   showMessage({
  //                     message: "Login Success",
  //                     description: "Login as "+ info.attributes.email,
  //                     type: "success"})
  //                   console.log(info);
  //                 }catch(err){
  //                   console.log(err)
  //                 }
  //               }}
  //       />
  //       <Button
  //         title={'get list'}
  //         onPress={ async () => {
  //           list_get = await Storage.list('', {level: 'private'});
  //           console.log(list_get);
  //         }}
  //         />
  //       <Button
  //         title={'get files'}
  //         onPress={ async () => {
  //           list_get = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
  //           console.log(list_get);
  //         }}
  //         />
  //       <Button
  //         title={'generate'}
  //         onPress={ async () => {
  //           const local_lst = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
  //           const local_set = new Set(local_lst);
  //
  //           const cloud_lst = await Storage.list('', {level: 'private'});
  //           const data_map = cloud_lst.map((item) => ({title: item.key, prog: local_set.has(item.key) ? 1: 0}));
  //           console.log(data_map);
  //         }}
  //         />
  //       <Item
  //         prog={0}
  //         title={'陈一发儿 - 人间 - 陈一发儿-LiN06nQP0tM.mp3'}
  //       />
  //       <PlayComp/>
  //
  //     </View>
  //   </View>
  // )
}

const PureItem = React.memo((props) => {
  return Item(props);
});

function Item(props){
  var returnView;
  var downButton;
  const [prog, setProg] = useState(props.prog);
  const [loading, setLoading] = useState(false);

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
                  props.pushLoadingLst( async () => {
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
                  })
              }}/>
    )
  }

  // const [change, setChange] = useState(false);

  // useEffect(()=>{
  //   let id;
  //   if (change){
  //     id = setInterval(()=>{
  //       // setProg(prog + 1.5/200);
  //       props.updateMapProgWithId(props.title, props.prog + 1.5/200);
  //       console.log(props.prog);
  //     }, 500);
  //   }else{
  //     id = setInterval(()=>{}, 1000);
  //   }
  //
  //   return () => clearInterval(id);
  // },[props.prog, change])

  // console.log('updating' + props.title);
  if (props.show){
    returnView = (
      <View style = {{...styles.containerRow}}>
        <View style = {{flex: 8, alignSelf: 'stretch', padding: 10,
                        justifyContent:'center'}} >
          <Progress.Bar styles = {{alignSelf: 'stretch', position: 'absolute'}}
                                color = 'rgba(204, 122, 155, 0.5)'
                                progress={prog}
                                borderRadius={15}
                                width = {null}
                                height = {itemHeight-15}/>
          <ScrollView style = {{position: 'absolute', marginLeft: 12}} horizontal={true}>
            <Text style={{fontSize: 16}}>{props.title}</Text>
          </ScrollView>
        </View>
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
                      {text: 'Yes', onPress: async () => {
                        try{
                          result = await Storage.remove(props.title, {level: 'private'});
                          props.deleteMapWithId(props.title);
                          console.log(result);
                        }catch(err){
                          console.log(result);
                        }
                      }},
                      {text: 'Cancel', onPress: () => {}, style: 'cancel'}
                    ],
                  )
                }
              }/>
        </View>
      </View>
    )
  }else{
    returnView = null;
  }

  return returnView;
}
