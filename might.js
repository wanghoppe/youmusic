import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

import Amplify, { Storage, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';

const color = {light_pup: '#cc7a9b',
                dard_pup: '#c91860',
                light_gre: '#9fd6bf'}

function PlayComp(){
  const soundObject = new Audio.Sound();
  console.log('Refreshing PlayComp');


  return(
    <View>
      <Button title="Play Button"
              onPress={async () => {
                try{
                  await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    allowsRecordingIOS: false,
                    interruptionModeIOS : Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
                    playsInSilentModeIOS : true,
                    interruptionModeAndroid : Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                    shouldDuckAndroid : true,
                    playThroughEarpieceAndroid : false,
                  });
                  await soundObject.loadAsync({uri: FileSystem.documentDirectory + 'nb.mp3'});
                  await soundObject.playAsync();
                } catch (error) {
                  console.log(error);
                }
              }}>
      </Button>
    </View>
  );

}


function Example(props) {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);
  const [sample, setSam] = useState('');
  const [progress, setProg] = useState(0.0);
  const [visible, setVis] = useState(false);
  const [finished, setFin] = useState('')

  const downloadResumable = FileSystem.createDownloadResumable(
    'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_5MG.mp3',
    FileSystem.documentDirectory + 'file_example_MP3_5MG.mp3',
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      setProg(progress);
    }
  );
  // const track = TrackPlayer.setupPlayer()
  // console.log(TrackPlayer);
  console.log('dfsafasdfdasdasds dddddddddddddddddddddddddddf                dddddddddddddd')
  if (visible){
    test1 = <Progress.Bar
      progress={progress}
      size={200}
      unfilledColor="#fff"
      color="#ff457f"
      thickness={2}
      borderWidth={0} />;
    <Progress.CircleSnail color={['red', 'green', 'blue']} />;
  } else {
    test1 = null;
  }

  return (
    <View>
      <Text>You clicked {count} times</Text>
      <Text> {props.title} </Text>
      <Button title="Learn More"
              onPress={() => setCount(count + 1)}>
      </Button>
      <Button title="down"
              onPress={() => setSam(FileSystem.documentDirectory)}>
      </Button>
      <Text>{sample}</Text>
      <Button title="down2"
              onPress={() => {
                downloadResumable.downloadAsync()
                .then(() => {setFin('file_example_MP3_5MG.mp3 Downloaded')});
                setVis(true);
              }}>
      </Button>
      <Button title="log in"
              onPress = {async () => {
                const user = await Auth.signIn('wanghp000@gmail.com', 'whp960923');
                if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
                  const loggedUser = await Auth.completeNewPassword(
                    user, 'whp960923'
                  )
                };
                info = await Auth.currentUserInfo();
                console.log(info);
              }}
      >
      </Button>

      <Button title="upload"
              onPress={async () => {
                // const response = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'file_example_MP3_5MG.mp3',
                //                 {encoding: FileSystem.EncodingType.Base64});
                // var blob = base64.decode(response);
                // // const response = await fetch(FileSystem.documentDirectory + 'file_example_MP3_5MG.mp3');
                // // const blob = await response.blob();
                //
                // console.log(blob);
                // var result =  await Storage.put('test.mp3', blob, {
                //     progressCallback(progress){
                //         console.log(`Uploaded: ${progress.loaded}/ ${progress.total}`);
                //   },
                //   level: 'private'
                // });
                var result =  await Storage.get(props.title, {
                    progressCallback(progress){
                        console.log(`Downloaded: ${progress.loaded}/ ${progress.total}`);
                  },
                  level: 'private'
                });
                setVis(true);
                console.log('132: this is the url: ', result);
                const downloadResumable = FileSystem.createDownloadResumable(
                  result,
                  FileSystem.documentDirectory + 'nb.mp3',
                  {},
                  (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    setProg(progress);
                  }
                );
                var xx = await downloadResumable.downloadAsync()
                setFin('nb.mp3 Downloaded');
                console.log(result);
              }}>
      </Button>
      <Text>{progress}</Text>
      {test1}
      <Text>{finished}</Text>

    </View>
  );
}


function WebStaff(props) {

  var ref_out = null;
  const [foo, setFoo] = useState(0)
  const [url, setUrl] = useState('what');
  console.log('Refreshing web stuff');

  return(
    <View style={{flex: 2}}>
    <Text>{url}</Text>
    <Button title="get url"
            onPress={() => {
              ref_out.injectJavaScript("window.ReactNativeWebView.postMessage(window.location.href);");
            }}>
    </Button>
    <Button title="Submit"
            onPress={async () => {
              console.log("this is url" + url);
              const you_id = url.match(/http.:\/\/www|m.youtube.com.*\?*v=([^&]*).*/)[1];
              const info = await Auth.currentUserInfo();
              const user_id = info.id;


              if (you_id == null){
                console.log('Line 173: failed matching');
                throw new Error('Whoops!');
              }

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
              console.log(res_json);
              props.setTitle(res_json.download)

            }}>
    </Button>
    <WebView
      ref={ref => (ref_out = ref)}
      style={{width: 300, marginTop: 20}}
      source={{
        uri: 'https://www.youtube.com',
      }}
      onMessage={({nativeEvent: state}) => {
        setUrl(state.data);
        console.log(state.data);
      }}
    />
    </View>
  );
}
