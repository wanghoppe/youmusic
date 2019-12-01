import React, {useState} from 'react';
import {Platform, Alert, StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { Icon } from 'react-native-elements'
import { createBottomTabNavigator, createMaterialTopTabNavigator  } from 'react-navigation-tabs';
import { createAppContainer , createSwitchNavigator} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Amplify, { Storage, Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import awsconfig from './aws-exports';

import {LoginView, AuthLoadingScreen} from './login';
import {ExploreView} from './homeView';
import {CloudList} from './list';
import {LocalView} from './localView';
import FlashMessage from "react-native-flash-message";
import {first_run}  from './firstRun';
import {LocalList} from './localList';
import {LocalHome} from './localHome';
import {PlayingComp} from './playing';
import {color, styles, itemHeight, db, TRACK_DIR} from './styleConst';

Amplify.configure(awsconfig);
first_run();
// console.log('what 2')


const TabNavigator = createMaterialTopTabNavigator(
  {
    Explore: ExploreView,
    Cloud: CloudList,
    Local: LocalHome,
    Play: PlayingComp
  },
  {
    lazy : true,
    swipeEnabled: false,
    tabBarPosition: 'bottom',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Explore') {
          iconName = `explore`;
        } else if (routeName === 'Cloud') {
          iconName = `cloud-circle`;
        } else if (routeName === 'Local') {
          iconName = `library-music`;
        } else if (routeName === 'Play'){
          iconName = `video-library`;
        }
        return <Icon name={iconName} size={25} color={tintColor} iconStyle={`${focused ? '' : 'outline'}`}/>;
      },
    }),
    tabBarOptions: {
      renderIndicator: () => (null),
      showIcon: true,
      activeTintColor: color.dark_pup,
      inactiveTintColor: 'gray',
      labelStyle: {
        fontSize: 12,
      },
      style: {
        paddingTop: 5,
        backgroundColor: color.light_grey,
        height: Platform.OS === 'ios' ? 72 : 55,
      },
      tabStyle:{
        height: 46
      }
    },
  }
);


const SwitchNavigator = createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: TabNavigator,
      Auth: LoginView,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )

const YouMusic = createAppContainer(SwitchNavigator);

// export default withAuthenticator(App, {
//                 // Render a sign out button once logged in
//                 includeGreetings: true
//               })

export default function App() {
  return (
    <View flex = {1}>
      <YouMusic/>
      <FlashMessage position="bottom" />
    </View>
  )
}
