import {Alert, Platform} from 'react-native';
import {useRef} from 'react';
import {
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
  openPhotoPicker,
} from 'react-native-permissions';
import {launchImageLibrary} from 'react-native-image-picker';

class PermissionUtil {
  webViewRef = null;
  setWebViewRef = (ref: any) => {
    this.webViewRef = ref;
  };

  // openPhotoPicker = async () => {
  //   const options = {
  //     mediaType: 'photo',
  //     quality: 1,
  //     selectionLimit: 0, // No limit on the number of images
  //   };

  //   launchImageLibrary(options as any, response => {
  //     if (response.didCancel) {
  //       console.log('User cancelled image picker');
  //     } else if (response.errorMessage) {
  //       console.log('ImagePicker Error: ', response.errorMessage);
  //     } else {
  //       const imageUris = (response.assets as any).map(
  //         (asset: any) => asset.uri,
  //       );
  //       Alert.alert('imageUris', JSON.stringify(imageUris));
  //       // this.webViewRef.postMessage(
  //       //   JSON.stringify({type: 'IMAGE_URIS', imageUris}),
  //       // );
  //       if (this.webViewRef) {
  //         const imageUris = (response.assets as any).map(
  //           (asset: any) => asset.uri,
  //         );
  //         Alert.alert('imageUris', JSON.stringify(imageUris));
  //         // this.webViewRef.postMessage(
  //         //   JSON.stringify({type: 'IMAGE_URIS', imageUris}),
  //         // );
  //       }
  //     }
  //   });
  // };

  cmmDevicePlatformCheck = (): boolean => {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  };

  cmmCheckAndSendPermissions = async (): Promise<void> => {
    if (!this.cmmDevicePlatformCheck()) return;

    const cameraPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
    const libraryPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    const [cameraResult, libraryResult] = await Promise.all([
      request(cameraPermission),
      request(libraryPermission),
    ]);

    // if (libraryResult === RESULTS.LIMITED) {
    //   const photos = await openPhotoPicker().catch(() => {
    //     console.warn('Cannot open photo library picker');
    //   });

    //   Alert.alert(photos);
    // }
    // if (libraryResult === RESULTS.LIMITED) {
    //   openPhotoPicker();
    // }
    const cameraGranted = cameraResult === RESULTS.GRANTED;
    const libraryGranted = libraryResult === RESULTS.GRANTED || RESULTS.LIMITED;

    // 결과를 웹뷰로 전송
    if (this.webViewRef) {
      (this.webViewRef as any).postMessage(
        JSON.stringify({
          cameraPermission: cameraGranted,
          libraryPermission: libraryGranted,
        }),
      );
    } else {
      console.log('WebViewRef 사용 불가능');
    }

    if (!cameraGranted) {
      this.showSettingsAlert('카메라');
    }
    if (!libraryGranted) {
      this.showSettingsAlert('사진 첨부');
    }
  };

  // cmmReqCameraPermission = async (): Promise<void> => {
  //   if (!this.cmmDevicePlatformCheck()) return;

  //   const platformPermissions =
  //     Platform.OS === 'ios'
  //       ? PERMISSIONS.IOS.CAMERA
  //       : PERMISSIONS.ANDROID.CAMERA;

  //   const result = await request(platformPermissions);

  //   if (result === RESULTS.GRANTED) {
  //     console.log('카메라 권한이 허용되었습니다.');
  //   } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
  //     this.showSettingsAlert('카메라');
  //   }
  // };

  // cmmReqPhotoLibraryPermission = async (): Promise<void> => {
  //   if (!this.cmmDevicePlatformCheck()) return;

  //   const platformPermissions =
  //     Platform.OS === 'ios'
  //       ? PERMISSIONS.IOS.PHOTO_LIBRARY
  //       : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

  //   const result = await request(platformPermissions);

  //   if (result === RESULTS.GRANTED) {
  //     console.log('사진 첨부 권한이 허용되었습니다.');
  //   } else if (result === RESULTS.LIMITED) {
  //     console.log('사진 첨부 권한이 제한되었습니다.');
  //   } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
  //     console.log('사진 첨부 권한이 거부되었습니다.');
  //     this.showSettingsAlert('사진 첨부');
  //   }
  // };

  showSettingsAlert = (permissionName: string) => {
    Alert.alert(
      `${permissionName} 권한 필요`,
      `이 기능을 사용하기 위해서는 ${permissionName} 권한이 필요합니다. 설정에서 권한을 활성화해 주세요.`,
      [
        {
          text: '설정으로 이동',
          onPress: () => openSettings(),
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ],
    );
  };
}

export default new PermissionUtil();
