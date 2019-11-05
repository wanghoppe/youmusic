import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {styles, color} from './styleConst'
import {LocalList} from './localList'
import {LocalView} from './localView'


function getTitle({navigation}){
  let plst = navigation.getParam('plst_name', false);
  return {
    title: (plst)? 'Playlist': 'All Track',
  };
}

LocalView.navigationOptions = { title: 'Local'}
LocalList.navigationOptions = getTitle

export const LocalHome = createStackNavigator(
  {
    LocalView: LocalView,
    LocalList: LocalList,
  },
  {
    defaultNavigationOptions:{
      headerStyle: {
          backgroundColor: color.light_pup2,
        },
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }
);
