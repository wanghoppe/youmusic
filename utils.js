import { showMessage, hideMessage } from "react-native-flash-message";
import {Alert} from 'react-native';
import { Storage, Auth } from 'aws-amplify';
import {my_i18n} from './styleConst'

export async function login(){
  try{
    const user = await Auth.signIn('wanghp000@gmail.com', '123456789');
    if (user.challengeName === 'NEW_PASSWORD_REQUIRED'){
      const loggedUser = await Auth.completeNewPassword(
        user, '123456789'
      )
    };
    info = await Auth.currentUserInfo();

    showMessage({
      message: "Login Success",
      description: "Login as "+ info.attributes.email,
      type: "success"})
    // console.log(info);
  }catch{
    console.log(err);
  }
}

export async function process_upload_json(json_res){
  if (json_res.message){
    showMessage({
      message: my_i18n.t('failed'),
      description: json_res.message,
      type: "danger"}
    )
    console.log(json_res)
    return null;
  }
  if (json_res.success){
    showMessage({
      message: my_i18n.t('success'),
      description: my_i18n.t('utils_ds', {song: res_json.download}),
      type: "success"})
      console.log(res_json.download + " is downloaded to cloud")
  }else{
    if (json_res.error_code == 1){
      Alert.alert(
        my_i18n.t('utils_df'),
        my_i18n.t('utils_df_mes1', {song: res_json.download})
      )
    }else if (json_res.error_code == 2){
      Alert.alert(
        my_i18n.t('utils_df'),
        my_i18n.t('utils_df_mes2', {song: res_json.download})
      )
    }else if (json_res.error_code == 3){
      Alert.alert(
        my_i18n.t('utils_df'),
        my_i18n.t('utils_df_mes3', {song: res_json.download})
      )
    }
  }
}
