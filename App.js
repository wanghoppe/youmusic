import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

import Amplify, { Storage, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';

import base64 from 'react-native-base64'
import {List} from './list'

const color = {light_pup: "#e39cff",
              dark_pup: "#a710e3"};

Amplify.configure(awsconfig);


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

function LoginView(props){
  const [username, setUsername] = useState('Email');
  const [pw, setPw] = useState('Password');

  return(
    <View >
        <Text style={{fontSize: 25}}>Username: </Text>
        <TextInput
            onChangeText={text => setUsername(text)}
            placeholder={'Email'}
          />
        <Text style={{fontSize: 25}}>Password: </Text>
        <TextInput
            onChangeText={text => setPw(text)}
            placeholder={'Password'}
          />
    </View>
  );
}

function NewWebView(props){
  var ref_out = null;

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style = {{fontSize: 18}}>Explore</Text>
      </View>
      <View style = {styles.afterStatus}>
        <View style = {{flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch'}}>
          <Button title="HOME"
                  onPress={() => {
                    ref_out.injectJavaScript("window.location.href = 'https://www.youtube.com';");
                  }}>
          </Button>
          <Button title="BACK"
                  onPress={() => {
                    ref_out.injectJavaScript("window.history.go(-1);");
                  }}>
          </Button>
          <Button title="GET URL"
                  onPress={() => {
                    ref_out.injectJavaScript("window.ReactNativeWebView.postMessage(window.location.href);");
                  }}>
          </Button>
        </View>
        <View
            style={{ flex: 1, alignSelf: 'stretch' }}
            >
          <WebView
            ref={ref => (ref_out = ref)}
            style={{alignSelf: 'stretch'}}
            source={{
              uri: 'https://www.youtube.com',
            }}
            onMessage={({nativeEvent: state}) => {
              // setUrl(state.data);
              console.log(state.data);
            }}
          />
        </View>
      </View>
    </View>
    );
}

export default function App() {

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('Email');
  const [pw, setPw] = useState('Password');
  const [progress, setProg] = useState(0.0);

  const soundObject = new Audio.Sound();


  return(
    <View style={styles.allView} behavior={'padding'}>
      <List/>
    </View>
  );
  // return (
  //   <View style={styles.container}>
  //   <WebStaff setTitle = {setTitle}/>
  //   <Text>Hello World</Text>
  //   <Example title = {title}/>
  //   <PlayComp/>
  //   </View>
  // );
  // return (
  //   <View style={styles.allView} behavior={'padding'}>
  //     <View style = {styles.statusBar}>
  //       <Text style = {{fontSize: 18}}>Explore</Text>
  //       <Button title="log in"
  //               onPress = {async () => {
  //                 const user = await Auth.signIn('wanghp000@gmail.com', 'whp960923');
  //                 if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
  //                   const loggedUser = await Auth.completeNewPassword(
  //                     user, 'whp960923'
  //                   )
  //                 };
  //                 info = await Auth.currentUserInfo();
  //                 console.log(info);
  //               }}/>
  //     </View>
  //     <View style = {styles.afterStatus}>
  //       <Button title="LIST"
  //               onPress = {async () => {
  //                 const info = await Auth.currentUserInfo();
  //                 const user_id = info.id;
  //
  //                 const result = await Storage.list('', {level: 'private'});
  //                 console.log(result);
  //               }}/>
  //       <Button title="LIST2"
  //               onPress = {async () => {
  //                 const result = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
  //                 console.log(result);
  //               }}/>
  //       <View style = {{alignSelf: 'stretch', height: 50}} >
  //         <Progress.Bar styles = {{position: 'absolute'}}
  //                       color = 'rgba(227, 156, 255, 0.5)'
  //                       progress={progress}
  //                       borderRadius={20}
  //                       width = {null}
  //                       height={50}/>
  //         <Text style = {{position: 'absolute'}}>晓月老板--《探清水河》，一首轻快的北京小曲儿，讲述了一段凄美的爱情故事-oXwpGzRyzkY</Text>
  //       </View>
  //       <Button title="upload"
  //               onPress={async () => {
  //                 const title = '晓月老板--《探清水河》，一首轻快的北京小曲儿，讲述了一段凄美的爱情故事-oXwpGzRyzkY.mp3';
  //                 var result =  await Storage.get(title, {
  //                     level: 'private'
  //                 });
  //                 console.log('132: this is the url: ', result);
  //                 const downloadResumable = FileSystem.createDownloadResumable(
  //                   result,
  //                   // FileSystem.documentDirectory + base64.encode(title.match(/(.*)\.mp3/)[1]) + '.mp3',
  //                   FileSystem.documentDirectory + base64.encode(title),
  //                   {},
  //                   (downloadProgress) => {
  //                     const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  //                     setProg(progress);
  //                   }
  //                 );
  //                 var xx = await downloadResumable.downloadAsync();
  //                 console.log(base64.encode(title));
  //               }}/>
  //         <Button title="Play Button"
  //                 onPress={async () => {
  //                   try{
  //                     const title = '晓月老板--《探清水河》，一首轻快的北京小曲儿，讲述了一段凄美的爱情故事-oXwpGzRyzkY.mp3';
  //                     await Audio.setAudioModeAsync({
  //                       staysActiveInBackground: true,
  //                       allowsRecordingIOS: false,
  //                       interruptionModeIOS : Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
  //                       playsInSilentModeIOS : true,
  //                       interruptionModeAndroid : Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  //                       shouldDuckAndroid : true,
  //                       playThroughEarpieceAndroid : false,
  //                     });
  //                     // await soundObject.loadAsync({uri: FileSystem.documentDirectory + base64.encode(title.match(/(.*)\.mp3/)[1]) + '.mp3'});
  //                     await soundObject.loadAsync({uri: FileSystem.documentDirectory + base64.encode(title)});
  //                     await soundObject.playAsync();
  //                   } catch (error) {
  //                     console.log(error);
  //                   }
  //                 }}>
  //         </Button>
  //     </View>
  //   </View>
    // );
}


const styles = StyleSheet.create({
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
    // backgroundColor: 'powderblue',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
