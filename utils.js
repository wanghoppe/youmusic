import { showMessage, hideMessage } from "react-native-flash-message";
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
