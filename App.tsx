import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import PermissionUtil from './PermissionUtil.tsx';
import PushNotification from 'react-native-push-notification';
import axios from 'axios';

// import {NativeModules} from 'react-native';

const App = () => {
  // const basicUrl = 'http://10.0.2.2:3000/'; // 안드로이드 에뮬레이터
  // const basicUrl = 'http://127.0.0.1:3000/chatroom/6627927e60cd66ee2df868f6'; // ios 에뮬레이터
  // const basicUrl = 'http://127.0.0.1:3000/create'; // ios 에뮬레이터
  const basicUrl = 'https://kind-pebble-0020f5710.5.azurestaticapps.net'; //실제 배포 주소
  const BASE_URL =
    'https://anotheruniverse-backend.delightfuldune-c082bcd0.koreacentral.azurecontainerapps.io';

  const webViewRef = useRef<any>(null);

  const [webViewUrl, setWebViewUrl] = useState(basicUrl); // 기본 URL 설정
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [safeArea, setSafeArea] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasAccessTokenUpdate, setHasAccessTokenUpdate] =
    useState<boolean>(false);

  // //////////////////////제한된 사진 접근 테스트(폐기)//////////////////
  // const {PhotoLibraryManager} = NativeModules;
  // const onMessageReceived = () => {
  //   PhotoLibraryManager.fetchLimitedPhotos((error: any, assets: any) => {
  //     if (error) {
  //       Alert.alert(JSON.stringify({error}));
  //     } else {
  //       Alert.alert(JSON.stringify({assets}));
  //     }
  //   });
  // };

  // useEffect(() => {
  //   onMessageReceived();
  // }, []);
  // //////////////////////////////////////////////////

  //component에서 webview 직접 활용하기 위해 필요
  useEffect(() => {
    if (webViewRef.current) {
      PermissionUtil.setWebViewRef(webViewRef.current);
    }
  }, [webViewRef.current]);

  useEffect(() => {
    AsyncStorage.getItem('isFirstAccess').then(value => {
      if (value === null) {
        console.log('처음 접속하는 유저입니다');
        // Conditional permission requests based on platform
        if (Platform.OS === 'android') {
          createChannelForAndroid();
          requestPushPermissionForAndroid().then(() => {
            AsyncStorage.setItem('isFirstAccess', 'NO').then(() => {
              getFcmToken(); // Call after permissions are handled and first access is updated
            });
          });
        } else {
          reRequestPushPermissionForiOS().then(() => {
            AsyncStorage.setItem('isFirstAccess', 'NO').then(() => {
              getFcmToken(); // Call after permissions are handled and first access is updated
            });
          });
        }
      } else {
        console.log('재접속하는 유저입니다.');
        getFcmToken(); // Call immediately if not first access
      }
    });

    // // Foreground에서 FCM 알림 수신
    // messaging().onMessage(async remoteMessage => {
    //   console.log('Received in foreground:', remoteMessage);
    // });

    // 백그라운드 상태에서 알림 클릭 시 해당 라우트로 이동
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      const route = remoteMessage.data.route;
      console.log('route: ', basicUrl, route);
      if (route) {
        setWebViewUrl(`${basicUrl}${route}`); // URL 업데이트
      }
    });

    // 앱 종료 이후 알림 클릭 시 해당 라우트로 이동
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          const route = remoteMessage.data.route;
          if (route) {
            setWebViewUrl(`${basicUrl}${route}`); // URL 업데이트
          }
        }
      });
    // 컴포넌트 언마운트 시 인터벌 정리
  }, []);

  // const checkAuthStatus = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   console.log('Authorization status out RequestFunction:', authStatus);
  // };

  // 안드로이드 에서 FCM 알림을 받을 채널 생성
  const createChannelForAndroid = async () =>
    PushNotification.createChannel(
      {
        channelId: 'AU_channel', // 채널 ID
        channelName: 'AU_Android', // 채널 이름
        playSound: true, // 소리 여부
        importance: 4, // 중요도
        vibrate: true, // 진동 여부s
      },
      created => console.log(`CreateChannel returned '${created}'`), // 콜백 함수
    );

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
          '캐릭터가 보내는 채팅을 놓칠 수 있어요',
          '설정 > 앱 > AU > 알림 으로 이동하여 알림을 허용해주세요.',
          [
            {
              text: '다음에 하기',
              style: 'cancel',
            },
            {
              text: '설정으로 이동',
              onPress: () => {
                Linking.openSettings();
              },
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
    // 1초 대기를 위한 Promise 구현
    // await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const authStatus = await messaging().requestPermission();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Authorization status:', authStatus);
      if (authStatus === messaging.AuthorizationStatus.DENIED) {
        Alert.alert(
          '캐릭터가 보내는 채팅을 놓칠 수 있어요🥲',
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
          {cancelable: false},
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
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

  const getFcmToken = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const token = await messaging().getToken();
      await new Promise(resolve => setTimeout(resolve, 2000));
      AsyncStorage.setItem('fcmToken', token);
      // Alert.alert('[+] FCM Token outside(app):: ', token);
      if (token) {
        // console.log('[+] FCM Token :: ', token);
        // Alert.alert('[+] FCM Token (app) :: ', token);
        setFcmToken(token); // 토큰 상태 업데이트
      } else {
        console.log('FCM 토큰이 존재하지 않습니다.');
      }
    } catch (error: any) {
      console.error('FCM 토큰을 받는 데 실패했습니다. 오류: ', error);
      // Alert.alert(
      //   'FCM 토큰 오류',
      //   `FCM 토큰을 받는 데 실패했습니다: ${error.message}`,
      // );
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

    if (message.type == 'REQUEST_PERMISSIONS_CHECK') {
      PermissionUtil.cmmCheckAndSendPermissions();
    } else if (message.type === 'OPEN_APP_SETTINGS') {
      if (Platform.OS === 'android') {
        Linking.openSettings().catch(err =>
          console.error('Failed to open app settings:', err),
        );
      } else {
        Linking.openURL('app-settings:').catch(err =>
          console.error('Failed to open app settings:', err),
        );
      }
      // } else if (message.type === 'REMOVE_SAFETY_AREA') {
      //   setSafeArea(false);
      // } else if (message.type == 'ADD_SAFETY_AREA') {
      //   setSafeArea(true);
    } else if (message.type == 'ACCESS_TOKEN') {
      setAccessToken(message.ACCESS_TOKEN);
      // Alert.alert('Access Token', message.ACCESS_TOKEN);
      // console.log('Access Token:', message.ACCESS_TOKEN);
    }
  };

  useEffect(() => {
    // Alert.alert('FCM Token', fcmToken as any);
    // Alert.alert('Access Token', accessToken as any);
    if (accessToken && !hasAccessTokenUpdate) {
      if (fcmToken !== null) {
        axios
          .post(
            `${BASE_URL}/user/fcm-token`,
            {fcmToken: fcmToken},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )
          .then(response => {
            console.log('Token registration successful', response);
            // Alert.alert('Token registration successful', response.data);
          })
          .catch(error => {
            console.error('Token registration failed', error);
            // Alert.alert('Token registration failed', error.response);
          });
      }
      setHasAccessTokenUpdate(true);
    }
  }, [accessToken]);

  // useEffect(() => {
  //   webViewRef.current.postMessage(
  //     JSON.stringify({type: 'FCM_TOKEN_RECEIVE', token: fcmToken}),
  //   );
  // }, [sendFCMToken]);

  const styles = StyleSheet.create({
    flexContainer: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
  });

  // return (
  return (
    <View style={styles.flexContainer}>
      <WebView
        ref={webViewRef}
        source={{uri: webViewUrl}}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest} // iOS에서 사용
        shouldOverrideUrlLoading={handleShouldStartLoadWithRequest} // Android에서 사용
        onMessage={onMessage}
        onContentProcessDidTerminate={() => {
          webViewRef.current?.reload();
        }}
      />
    </View>
  );
};

export default App;
