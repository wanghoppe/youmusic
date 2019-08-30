import React, {useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';

import Amplify, { Storage, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

var base64 = require('base-64');

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
                    playsInSilentModeIOS : false,
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


function Example() {
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
    test1 = <Progress.Circle
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
      <Button title="upload"
              onPress={async () => {
                const user = await Auth.signIn('wanghp000@gmail.com', 'whp960923');
                if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
                  const loggedUser = await Auth.completeNewPassword(
                    user, 'whp960923'
                  )
                };
                // console.log(user);

                info = await Auth.currentUserInfo();
                console.log(info);

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
                var result =  await Storage.get('Lady Gaga, Bradley Cooper - Shallow (A Star Is Born)-bo_efYhYU2A.mp3', {
                    progressCallback(progress){
                        console.log(`Downloaded: ${progress.loaded}/ ${progress.total}`);
                  }
                });
                setVis(true);
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


function WebStaff() {

  var ref_out = null;
  const [foo, setFoo] = useState(0)
  const [url, setUrl] = useState('what');
  console.log('Refreshing web stuff');

  return(
    <View style={{flex: 2}}>
    <Text>{url}</Text>
    <Button title="get url"
            onPress={() => {
              ref_out.injectJavaScript("document.getElementById('movie_player').click()");
              console.log('This is what I wanted to see' + foo);
            }}>
    </Button>
    <WebView
      ref={ref => (ref_out = ref)}
      style={{width: 300, marginTop: 20}}
      source={{
        uri: 'https://www.youtube.com/watch?v=DCfShptiyVo',
      }}
      injectedJavaScript={`
        (function() {
          function wrap(fn) {
            return function wrapper() {
              var res = fn.apply(this, arguments);
              // window.ReactNativeWebView.postMessage(window.location.href);
              window.addEventListener('load', function() {
                // window.ReactNativeWebView.postMessage($.toString());
                window.ReactNativeWebView.postMessage(window.location.href);
                // document.getElementById('movie_player').click();
              });
              return res;
            }
          }
          window.location.assign = wrap(window.location.assign);
          history.pushState = wrap(history.pushState);
          history.replaceState = wrap(history.replaceState);
          window.addEventListener('popstate', function() {
            // window.ReactNativeWebView.postMessage($.toString());
            window.ReactNativeWebView.postMessage(window.location.href);
            // document.getElementById('movie_player').click();
          });
        })();

        true;
        `}
      onMessage={({nativeEvent: state}) => {
        setUrl(state.data);
        ref_out.injectJavaScript("document.getElementById('movie_player').click()");
        console.log(state.data);
      }}
    />
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
    <WebStaff/>
    <Text>Hello World</Text>
    <Example/>
    <PlayComp/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
