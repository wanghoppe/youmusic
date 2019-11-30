import React, {useState, useRef, useEffect, useCallback} from 'react';
import { TouchableWithoutFeedback, Modal, TouchableOpacity,
  Alert, StyleSheet, Text, View, TextInput, ScrollView,
  KeyboardAvoidingView, StatusBar, FlatList, RefreshControl } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { showMessage, hideMessage } from "react-native-flash-message";
import { Auth } from 'aws-amplify';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator  } from 'react-navigation-tabs';
import {color, styles, global_debug, itemFontSize, itemHeight} from './styleConst';
import { Button, Icon, Image, SearchBar } from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import { withNavigationFocus } from 'react-navigation';
import { IconText } from './utilsComp';
import { ExploreLambda } from './homeView2'

export const ExploreView = createMaterialTopTabNavigator(
  {
    Youtube: ExploreYoutube,
    翻墙: ExploreLambda
  },
  {
    tabBarOptions: {
      indicatorStyle: {backgroundColor:color.dark_pup},
      labelStyle: {fontWeight: "bold", fontSize: itemFontSize+2, color:'black'},
      style: {
        flexDirection:'column-reverse',
        paddingBottom:5,
        backgroundColor: color.light_pup_header,
        height: Constants.statusBarHeight + 35,
      },
      tabStyle: {...styles.statusBar, height:null, paddingBottom:0}
    },
  }
)
// export const ExploreView = withNavigationFocus(_ExploreView)

function ExploreYoutube(props){
  // console.log('updating home')
  var ref_out = null;

  const [show_modal, setShowModal] = useState(false);

  const upload2Cloud = () => {
    Alert.alert(
      "Comfirm",
      "Download to Cloud?",
      [
        {text: 'OK', onPress: () => ref_out.injectJavaScript("window.ReactNativeWebView.postMessage(window.location.href);")},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'}
      ],
    )
  }

  const goBackHome = () => {
    ref_out.injectJavaScript("window.location.href = 'https://www.youtube.com';");
    setShowModal(false);
  }

  const historyGoBack = () => {
    ref_out.injectJavaScript("window.history.go(-1);");
  }

  const historyGoForward = () => {
    ref_out.injectJavaScript("window.history.go(1);");
  }

  const logOut = async () => {
    console.log('logging out')
    let something = await Auth.signOut({ global: true })
    console.log(something)
        // .then(data => console.log(data));
    props.navigation.navigate('AuthLoading');
  }

  const webOnMessage =  useCallback(async ({nativeEvent: state}) => {
    const parsed = state.data.match(/http.:\/\/(www|m)\.youtube\.com.*\?*v=([^&]*).*/);

    if (parsed == '' || parsed == null){
      Alert.alert('Invalid URL', 'Cannot parse video ID')
    }else{
      const you_id = parsed[2];
      const user_info = await Auth.currentUserInfo();
      const user_id = user_info.id;
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
      console.log(res_json);
      showMessage({
        message: "Success",
        description: res_json.download + " is downloaded to cloud",
        type: "success"})
      console.log(res_json.download + " is downloaded to cloud");
    }
  });

  const HomeModal = (
    <Modal
      animationType="fade"
      transparent={true}
      visible={show_modal}
    >
      <View style={{...styles.modalBack, justifyContent: 'center'}}>
        <TouchableWithoutFeedback onPress = {() => setShowModal(false)}>
          <View style = {styles.modalTouchClose}/>
        </TouchableWithoutFeedback>
        <View style ={{...styles.modalInCenter, height: null}}>
          <IconText
            title = 'Youtube Home'
            iconName = 'youtube'
            iconType = 'material-community'
            iconColor = {'red'}
            onItemClick = {goBackHome}
          />
          <View style = {styles.graySeparator}/>
          <IconText
            title = 'Sign Out'
            iconName = 'sign-out'
            iconType = 'font-awesome'
            iconColor = {color.dark_pup}
            onItemClick = {logOut}
          />
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={styles.allView} behavior={'padding'}>
      {HomeModal}
      {false && <View style = {styles.statusBar}>
        <Text style={{fontWeight: "bold", fontSize: itemFontSize+2}}>EXPLORE</Text>
      </View>}
      <View style = {styles.afterStatus}>
        <View style = {{flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch'}}>
          <TouchableOpacity
            style = {styles.grayContainer}
            onPress={historyGoBack}
            >
            <Icon
              name = 'first-page'
              color = {color.primary}
              size = {itemFontSize * 2}
              />
          </TouchableOpacity>
          <TouchableOpacity
            style = {styles.grayContainer}
            onPress={historyGoForward}
            >
            <Icon
              name = 'last-page'
              color = {color.primary}
              size = {itemFontSize * 2}
              />
          </TouchableOpacity>
          <TouchableOpacity
            style = {styles.grayContainer}
            onPress={upload2Cloud}
            >
            <Icon
              name = 'cloud-upload'
              color = {color.primary}
              size = {itemFontSize * 2}
              />
          </TouchableOpacity>
          <TouchableOpacity
            style = {styles.grayContainer}
            onPress={() => setShowModal(true)}
            >
            <Icon
              name = 'more-vert'
              color = {color.primary}
              size = {itemFontSize * 2}
              />
          </TouchableOpacity>
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
            onMessage={webOnMessage}
          />
        </View>
      </View>
    </View>
    );
}
