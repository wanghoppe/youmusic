import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {styles, color} from './styleConst'
import {LocalList} from './localList'
import {LocalView} from './localView'

LocalView.navigationOptions = { title: 'Local'}
LocalList.navigationOptions = { title: 'Home' }

const LocalStack = createStackNavigator(
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


export const LocalHome = createAppContainer(LocalStack);
