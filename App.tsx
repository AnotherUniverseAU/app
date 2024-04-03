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
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import PermissionUtil from './PermissionUtil.tsx';

const App = () => {
  useEffect(() => {
    AsyncStorage.getItem('isFirstAccess').then(value => {
      if (value === null) {
        console.log('처음 접속하는 유저입니다');
        if (Platform.OS === 'android') {
          requestPushPermissionForAndroid();
        } else {
          reRequestPushPermissionForiOS();
        }
        AsyncStorage.setItem('isFirstAccess', 'NO');
      } else {
        console.log('재접속하는 유저입니다.');
      }
    });

    getFcmToken();

    // // Foreground에서 FCM 알림 수신
    // messaging().onMessage(async remoteMessage => {
    //   console.log('Received in foreground:', remoteMessage);
    // });
  }, []);

  /*
  안드로이드 사용자 알림 권한 요청
  */
  const requestPushPermissionForAndroid = async () => {
    if (Number(Platform.Version) >= 33) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('알림 권한 허용됨');
      } else {
        Alert.alert(
          '알림 권한 거부됨',
          '알림을 받기 위해서는 알림 권한이 필요합니다. 설정에서 알림 권한을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: '다음에 하기',
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      }
    } else {
      console.log(
        '안드로이드 버전이 13 미만입니다. 별도의 알림 권한 요청이 필요하지 않습니다.',
      );
    }
  };

  /*
   iOS 사용자 알림 권한 요청
   */
  const reRequestPushPermissionForiOS = async () => {
    const authStatus = await messaging().requestPermission();
    console.log('Authorization status:', authStatus);

    if (
      authStatus === messaging.AuthorizationStatus.DENIED ||
      authStatus === messaging.AuthorizationStatus.NOT_DETERMINED
    ) {
      Alert.alert(
        '알림을 허용해주세요',
        '설정 > 알림 > AU 으로 이동하여 알림을 허용해주세요.',
        [
          {
            text: '설정으로 이동',
            onPress: () => {
              Linking.openURL('app-settings:');
            },
          },
          {
            text: '다음에 하기',
            style: 'cancel',
          },
        ],
      );
    }
  };
  // /*
  //  마케팅 수신 정보 표시 모달
  //  */
  // const showMarketingConsentModal = () => {
  //   Alert.alert(
  //     '마케팅 수신 동의',
  //     '마케팅 및 프로모션 정보 수신에 동의하시겠습니까?',
  //     [
  //       {
  //         text: '동의',
  //         onPress: () => {
  //           // 사용자가 동의한 경우, 동의 정보를 저장하는 로직을 실행
  //           console.log('사용자가 마케팅 수신에 동의함');
  //           // 예: AsyncStorage에 저장하거나 서버로 동의 정보 전송
  //         },
  //       },
  //       {
  //         text: '거절',
  //         onPress: () => console.log('사용자가 마케팅 수신을 거절함'),
  //         style: 'cancel',
  //       },
  //     ],
  //     {cancelable: false},
  //   );
  // };

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

  // 웹뷰 상에서 URL을 열기 위한 함수
  const handleShouldStartLoadWithRequest = (request: any) => {
    // 커스텀 URL 스키마가 감지되면 Linking을 사용하여 열기
    if (request.url.startsWith('https://pf.kakao.com/_tmxfFG/chat')) {
      Linking.openURL(request.url).catch(err => {
        console.error('Failed to open URL:', err);
      });
      return false;
    }

    // HTTP와 HTTPS URL은 WebView에서 로드를 계속합니다.
    return (
      request.url.startsWith('http://') || request.url.startsWith('https://')
    );
  };

  // WebView에서 온 요청 바탕으로 카메라 권한 습득 처리 함수
  const onMessage = async (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'REQUEST_PERMISSIONS') {
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
