import React, {useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { showMessage, hideMessage } from "react-native-flash-message";

import Constants from 'expo-constants';

import { Storage, Auth } from 'aws-amplify';

import base64 from 'react-native-base64';

import {color, styles, itemHeight} from './styleConst';


import {PlayComp} from './might';

export function List(props){

  const [ready, setReady] = useState(false);
  const [data_lst, setDataLst] = useState([]);
  var returned;


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
      const data_lst = cloud_lst.map((item) => ({title: item.key, prog: local_set.has(item.key) ? 1: 0}));
      setDataLst(data_lst);
      setReady(true);
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    login().then(generate_lst())
  }, []);

  if (ready){
    returned = (
      <View style={styles.allView} behavior={'padding'}>
        <View style = {styles.statusBar}>
          <Text style = {{fontSize: 18}}>Explore</Text>
        </View>
        <View style = {styles.afterStatus}>
          <View style = {{alignSelf: 'stretch'}}>
            <FlatList
              data={data_lst}
              renderItem={({item}) => <Item
                                        prog={item.prog}
                                        title={item.title}
                                      />}
            />
          </View>
        </View>
      </View>
    )
  }else{
    returned = (
      <View style={styles.allView} behavior={'padding'}>
        <View style = {styles.statusBar}>
          <Text style = {{fontSize: 18}}>Explore</Text>
        </View>
        <View style = {styles.afterStatus}>
          <Text>Waitting</Text>
        </View>
      </View>
    )
  }

  return returned;
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
  //           const data_lst = cloud_lst.map((item) => ({title: item.key, prog: local_set.has(item.key) ? 1: 0}));
  //           console.log(data_lst);
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
        <ScrollView style = {{position: 'absolute', marginLeft: 10}} horizontal={true}>
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
                    }
                  );
                  const xx = await downloadResumable.downloadAsync();
                  console.log(props.title + ' downloaded');
                }catch(err){
                  console.log(err);
                }
              }}/>
      <Button flex={1}
              title={'DEL'}
              onPress={ async () => {
                try{
                  result = await Storage.remove(props.title, {level: 'private'});
                  console.log(result);
                }catch(err){
                  console.log(result);
                }
              }}/>
    </View>
  )
}
