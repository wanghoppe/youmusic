import React from 'react';
import { createAppContainer, withNavigationFocus } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {styles, color, itemFontSize ,my_i18n} from './styleConst'
import {LocalList} from './localList'
import {LocalView} from './localView'


function getTitle({navigation}){
  let plst = navigation.getParam('plst_name', my_i18n.t('localView_at'));
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
    defaultNavigationOptions: ({navigation}) => ({
      headerStyle: {
        height: 35,
        backgroundColor: color.light_pup_header,
      },
      headerLeftContainerStyle:{
        justifyContent: 'flex-end',
      },
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: itemFontSize+2,
      },
      headerBackTitle: my_i18n.t('header_back')
    })
  }
);
