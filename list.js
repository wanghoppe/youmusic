import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

import Amplify, { Storage, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';

import base64 from 'react-native-base64'


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
    <View style={styles.container}>
      <Test txt={'what the hell'} />
    </View>
  )
}

// function Item(props){
//   <View flexDirection = {'row'}>
//
//   <View>
// }

function Test(props){
  const [txt, setTxt] = React.useState({name: 'name1', job: 'job1'})
  const [up, setUp] = useState(true);
  props.txt = "!!!!!!!!!!!";
  // React.useEffect(() => {
  //   props.txt = "!!!!!!!!!!!"
  //   setTxt({name: 'name3', job: 'job1'})
  //   setUp(false);
  // })

  return(
    <View>
      <Text> this is a props: {props.txt}</Text>

    </View>
  )
}

function Test2(props){

  if (props.up){
    props.setTxt({name: 'name2', job: 'job1'});
  }
  return(
    <Text> Test 2 props {props.txt.name}</Text>
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
})
