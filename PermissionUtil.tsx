import {Alert, Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
} from 'react-native-permissions';

class PermissionUtil {
  cmmDevicePlatformCheck = (): boolean => {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  };

  cmmReqCameraPermission = async (): Promise<void> => {
    if (!this.cmmDevicePlatformCheck()) return;

    const platformPermissions =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(platformPermissions);

    if (result === RESULTS.GRANTED) {
      console.log('카메라 권한이 허용되었습니다.');
    } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      this.showSettingsAlert('카메라');
    }
  };

  cmmReqPhotoLibraryPermission = async (): Promise<void> => {
    if (!this.cmmDevicePlatformCheck()) return;

    const platformPermissions =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

    const result = await request(platformPermissions);

    if (result === RESULTS.GRANTED) {
      console.log('사진 첨부 권한이 허용되었습니다.');
    } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      this.showSettingsAlert('사진 첨부');
    }
  };

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
