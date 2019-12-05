import { showMessage, hideMessage } from "react-native-flash-message";
import {Alert} from 'react-native';
import { Storage, Auth } from 'aws-amplify';

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
      message: "Failed",
      description: json_res.message,
      type: "danger"}
    )
    console.log(json_res)
    return null;
  }
  if (json_res.success){
    showMessage({
      message: "Success",
      description: res_json.download + " is downloaded to cloud",
      type: "success"})
      console.log(res_json.download + " is downloaded to cloud")
  }else{
    if (json_res.error_code == 1){
      Alert.alert(
        'Download Failed',
        `${json_res.download} is longer than 90 minutes`
      )
    }else if (json_res.error_code == 2){
      Alert.alert(
        'Download Failed',
        `${json_res.download} is already in the cloud`
      )
    }else if (json_res.error_code == 3){
      Alert.alert(
        'Download Failed',
        `Maximum 55 songs can be stored in cloud`
      )
    }
  }
}
