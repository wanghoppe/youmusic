import React from 'react';
import { createAppContainer, withNavigationFocus } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {styles, color, itemFontSize} from './styleConst'
import {LocalList} from './localList'
import {LocalView} from './localView'


function getTitle({navigation}){
  let plst = navigation.getParam('plst_name', 'All Tracks');
  return {
    title: plst,
  };
}

LocalView.navigationOptions = {headerShown: false}
LocalList.navigationOptions = getTitle

export const LocalHome = createStackNavigator(
  {
    LocalView: withNavigationFocus(LocalView),
    LocalList: LocalList,
  },
  {
    defaultNavigationOptions:{
      headerStyle: {
        height: 35,
        backgroundColor: color.light_pup_header,
      },
      headerLeftContainerStyle:{
        paddingBottom: 5
      },
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: itemFontSize+2,
        paddingBottom: 5
      }
    }
  }
);
