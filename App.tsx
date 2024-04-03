import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {WebView} from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import PermissionUtil from './PermissionUtil.tsx';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestNotificationPermissionForAndroid();
    } else {
      // iOS 알림 권한 요청 로직
      requestUserPermission();
    }

    getFcmToken();

    // Foreground에서 FCM 알림 수신
    messaging().onMessage(async remoteMessage => {
      console.log('Received in foreground:', remoteMessage);
    });
  }, []);

  // 안드로이드 13 이상일 경우 알림 권한 요청
  const requestNotificationPermissionForAndroid = async () => {
    if (Number(Platform.Version) >= 33) {
      // 안드로이드 13(API 수준 33) 이상인 경우
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('알림 권한 허용됨');
      } else {
        // 권한 거부 시 설정으로 이동하는 모달 표시
        Alert.alert(
          '알림 권한 거부됨',
          '알림을 받기 위해서는 알림 권한이 필요합니다. 설정에서 알림 권한을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(), // 사용자를 앱의 설정 페이지로 이동
            },
            {text: '나중에 하기', style: 'cancel'},
          ],
          {cancelable: false},
        );
      }
    } else {
      // 안드로이드 13 미만 버전에서는 별도의 권한 요청 없이 진행
      console.log(
        '안드로이드 버전이 13 미만입니다. 별도의 알림 권한 요청이 필요하지 않습니다.',
      );
    }
  };

  /**
   * iOS 사용자에게 알림 권한을 요청합니다.
   */
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    console.log('Authorization status:', authStatus);

    // 알림 권한을 거부한 경우
    if (
      authStatus === messaging.AuthorizationStatus.DENIED ||
      authStatus === messaging.AuthorizationStatus.NOT_DETERMINED
    ) {
      // iOS에서 알림 권한이 거부된 경우
      if (Platform.OS === 'ios') {
        Alert.alert(
          '알림을 허용해주세요',
          '설정 > 알림 > AU 으로 이동하여 알림을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => Linking.openURL('app-settings:'),
            },
            {text: '취소', style: 'cancel'},
          ],
        );
      }
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

  // 메시지 처리 함수 수정
  const onMessage = async (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'REQUEST_PERMISSIONS') {
      // PermissionUtil을 사용하여 권한 요청
      PermissionUtil.cmmReqCameraPermission().finally(() => {
        //카메라 권한 요청
        PermissionUtil.cmmReqPhotoLibraryPermission(); //사진첩 권한 요청
      });
    }
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <WebView
        // source={{uri: 'http://10.0.2.2:3000/'}} // 안드로이드 에뮬레이터
        source={{uri: 'http://127.0.0.1:3000/'}} // ios 에뮬레이터
        // source={{uri: 'https://dhapdhap123.github.io/'}} // 테스트 배포 주소
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest} // iOS에서 사용
        shouldOverrideUrlLoading={handleShouldStartLoadWithRequest} // Android에서 사용
        onMessage={onMessage}
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
