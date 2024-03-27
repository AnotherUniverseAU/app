import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Linking, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

const App = () => {
  useEffect(() => {
    requestUserPermission();
    getFcmToken();

    // // Foreground에서 FCM 알림 수신
    // messaging().onMessage(async remoteMessage => {
    //   console.log('Received in foreground:', remoteMessage);
    //   showAlert(remoteMessage);
    // });
  }, []);

  /**
   * 사용자에게 알림 권한을 요청합니다.
   */
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    console.log('Authorization status:', authStatus);

    // 알림 권한을 거부한 경우
    if (
      authStatus === messaging.AuthorizationStatus.DENIED ||
      authStatus === messaging.AuthorizationStatus.NOT_DETERMINED
    ) {
      Alert.alert(
        '알림 권한 거부',
        '정말로 알림 권한을 거절하시겠습니까? 알림을 허용하면 중요한 정보를 놓치지 않습니다.',
        [
          {
            text: '다시 생각하기',
            onPress: () => requestUserPermission(), // 권한 요청 함수를 다시 호출
            style: 'cancel',
          },
          {
            text: '거절하기',
            onPress: () => console.log('알림 권한 거부됨'),
          },
        ],
      );
    }
  };
  /**
   * FCM 토큰을 받습니다.
   */
  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('[+] FCM Token :: ', fcmToken);
      } else {
        console.log('FCM Token을 받지 못했습니다.');
      }
    } catch (error) {
      console.log('FCM 토큰을 받는 데 실패했습니다.', error);
    }
  };

  // /**
  //  * 받은 메시지를 사용자에게 알림으로 보여주는 함수입니다.
  //  */
  // const showAlert = (remoteMessage: any) => {
  //   console.log('remoteMessage:', remoteMessage);
  //   Alert.alert(
  //     remoteMessage.notification.title,
  //     remoteMessage.notification.body,
  //     [{text: 'OK', onPress: () => console.log('Alert closed')}],
  //   );
  // };

  // 커스텀 URL 스키마를 처리하는 함수
  const handleShouldStartLoadWithRequest = (request: any) => {
    // 커스텀 URL 스키마가 감지되면 Linking을 사용하여 열기
    if (request.url.startsWith('https://pf.kakao.com/_tmxfFG/chat')) {
      Linking.openURL(request.url).catch(err => {
        console.error('Failed to open URL:', err);
      });
      return false; // WebView에서는 이 URL을 로드하지 않습니다.
    }

    // HTTP와 HTTPS URL은 WebView에서 로드를 계속합니다.
    return (
      request.url.startsWith('http://') || request.url.startsWith('https://')
    );
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <WebView
        // source={{uri: 'http://10.0.2.2:3000/tokentest'}} // 안드로이드 에뮬레이터
        source={{uri: 'http://localhost:3000/'}} // ios 에뮬레이터
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest} // iOS에서 사용
        shouldOverrideUrlLoading={handleShouldStartLoadWithRequest} // Android에서 사용
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;
