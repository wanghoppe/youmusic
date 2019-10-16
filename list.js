import React, {useState, useEffect } from 'react';
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

  const [ready, setReady] = useState(false);
  const [data_map, setDataMap] = useState(new Map());
  const [filter_idex, setFilid] = useState(0);
  const [filter_txt, setFilTx] = useState('');
  const [show_lst, setShowLst] = useState(new Map());
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
      const data_map = new Map(cloud_lst.map((item) => ([item.key, {
          prog: local_set.has(item.key) ? 1: 0,
          downloading: false
        }])));
      setDataMap(data_map);
      filter_lst(data_map);
      setReady(true);
    }catch(err){
      console.log(err);
    }
  }

  function filter_lst(data_map){
    let first_func;
    let temp_lst = [];

    if (filter_idex == 0){
      first_func = () => true;
    }else if (filter_idex == 1){
      first_func = (prog) => (prog == 0)
    }else if (filter_idex == 2){
      first_func = (prog) => (prog>0 && prog<1)
    }else if (filter_idex == 3){
      first_func = (prog) => (prog == 1)
    }

    data_map.forEach(
      (val, key) => {
        if (first_func(val.prog) && key.toLowerCase().includes(filter_txt)){
          temp_lst.push({key: key, prog: val});
        }
      }
    )
    console.log('Running filter_lst');
    setShowLst(temp_lst);
  }

  function updateMapProgWithId(id, progress){
    let temp_map = new Map(data_map);
    temp_map.set(id, progress);
    setDataMap(temp_map);
  }

  function deleteMapWithId(id){
    let temp_map = new Map(data_map);
    temp_map.delete(id);
    setDataMap(temp_map);
  }

  useEffect(() => {
    filter_lst(data_map);
    console.log('Running2');
  }, [filter_idex, filter_txt]);

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
                                    updateMapProgWithId = {updateMapProgWithId}
                                    deleteMapWithId = {deleteMapWithId}
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
            dropdownStyle = {{backgroundColor: color.light_grey, height: 153}}
            defaultIndex = {0}
            defaultValue = {'All'}
            options={['All', 'Undownload', 'Loading']}
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

function Item(props){
  const [prog, setProg] = useState(props.prog);
  return(
    <View style = {styles.containerRow}>
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
      <Button flex={1}
              title={'DOWN'}
              disabled = {prog == 1}
              onPress={ async () => {
                try{
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
                      props.updateMapProgWithId(props.title, progress);
                    }
                  );
                  const xx = await downloadResumable.downloadAsync();
                  console.log(props.title + ' downloaded');
                  // props.updateMapProgWithId(props.title);
                }catch(err){
                  console.log(err);
                }
              }}/>
      <Button flex={1}
              title={'DEL'}
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
  )
}
