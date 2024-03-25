import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Linking} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  useEffect(() => {
    getFcmToken();

    // 구독하고, 구독 해제 함수를 반환받습니다.
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[+] Remote Message ', JSON.stringify(remoteMessage));
    });

    // 컴포넌트가 언마운트될 때 구독을 취소합니다.
    return unsubscribe;
  }, []);

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

  /**
   * FCM 메시지를 앱이 foreground 상태일 경우 메시지를 수신합니다.
   */
  const subscribe = messaging().onMessage(async remoteMessage => {
    console.log('[+] Remote Message ', JSON.stringify(remoteMessage));
  });

  // 커스텀 URL 스키마를 처리하는 함수
  const handleShouldStartLoadWithRequest = (request: WebViewNavigation) => {
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
        // source={{uri: 'http://localhost:3000/'}} //ios용
        source={{uri: 'http://10.0.2.2:3000/'}} //android용
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
