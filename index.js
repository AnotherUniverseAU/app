/**
 * @format
 **/

import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';

// 안드로이드 기기가 Background나 종료된 상태에서 FCM 알림 수신
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // 푸시 알림 표시
  PushNotification.localNotification({
    channelId: 'channel',
    title: remoteMessage.data.title, // 메시지 제목
    message: remoteMessage.data.body, // 메시지 본문
    // bigLargeIcon: remoteMessage.data.android.imageUrl, // 알림 아이콘
    smallIcon: 'ic_notification', // 작은 아이콘
    color: '#6E7AE8', // 아이콘 색상
  });
  console.log('complete', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
