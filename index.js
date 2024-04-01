/**
 * @format
 **/

import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the backgroundin ios!', remoteMessage);
});

// 알림 채널 생성
PushNotification.createChannel(
  {
    channelId: 'AU_channel', // 채널 ID
    channelName: 'AU_Android', // 채널 이름
    playSound: false, // 소리 여부
    importance: 4, // 중요도
    vibrate: true, // 진동 여부
  },
  created => console.log(`CreateChannel returned '${created}'`), // 콜백 함수
);
// Background나 종료된 상태에서 FCM 알림 수신
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // 푸시 알림 표시
  PushNotification.localNotification({
    channelId: 'AU_channel',
    title: remoteMessage.notification.title, // 메시지 제목
    message: remoteMessage.notification.body, // 메시지 본문
    bigLargeIcon: remoteMessage.notification.android.imageUrl, // 알림 아이콘
    smallIcon: 'ic_notification', // 작은 아이콘
    color: '#6E7AE8', // 아이콘 색상
  });
  console.log('complete', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
