import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

import Amplify, { Storage, Auth } from 'aws-amplify';

import base64 from 'react-native-base64'

const color = {light_pup: "#e39cff",
              dark_pup: "#a710e3"};
const itemHeight = 66;


export function List(props){

  const lst0 = [
                {key: 'Devin'},
                {key: 'Dan'},
                {key: 'Dominic'},
                {key: 'Jackson'},
                {key: 'James'},
                {key: 'Joel'},
                {key: 'John'},
                {key: 'Jillian'},
                {key: 'Jimmy'},
                {key: 'Julie'},
              ];

  const [lst, setLst] = useState(lst0);

  // return (
  //     <View style={styles.container}>
  //       <FlatList
  //         data={[
  //           {key: 'Devin'},
  //           {key: 'Dan'},
  //           {key: 'Dominic'},
  //           {key: 'Jackson'},
  //           {key: 'James'},
  //           {key: 'Joel'},
  //           {key: 'John'},
  //           {key: 'Jillian'},
  //           {key: 'Jimmy'},
  //           {key: 'Julie'},
  //         ]}
  //         renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
  //       />
  //     </View>
  //   );
  return(
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style = {{fontSize: 18}}>Explore</Text>
      </View>
      <View style = {styles.afterStatus}>
        <Item/>
      </View>
    </View>
  )
}

function Item(props){
  const [prog, setProg] = useState(0.5);
  const [title, setTitle] = useState('晓月老板--《探清水河》，一首轻快的北京小曲儿，讲述了一段凄美的爱情故事-oXwpGzRyzkY');
  return(
    <View style = {styles.containerRow}>
      <View style = {{flex: 8, alignSelf: 'stretch', padding: 10,
                      justifyContent:'center'}} >
        <Progress.Bar styles = {{alignSelf: 'stretch', position: 'absolute'}}
                              color = 'rgba(227, 156, 255, 0.5)'
                              progress={prog}
                              borderRadius={15}
                              width = {null}
                              height = {itemHeight-15}/>
        <ScrollView style = {{position: 'absolute', marginLeft: 10}} horizontal={true}>
          <Text style={{fontSize: 16}}>{title}</Text>
        </ScrollView>
      </View>
      <Button flex={1}
              title={'DOWN'}
              onPress={ () => {}}/>
      <Button flex={1}
              title={'DEL'}
              onPress={ () => {}}/>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  allView: {
    flex:1
  },
  statusBar: {
    backgroundColor: color.light_pup,
    height: Constants.statusBarHeight + 35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10
  },
  afterStatus: {
    flexGrow : 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerRow: {
    // borderBottomWidth:1,
    // borderTopWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    height: itemHeight,
    // backgroundColor: 'powderblue',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  }
})
