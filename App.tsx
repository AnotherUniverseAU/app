import React from 'react';
import {SafeAreaView, StyleSheet, Linking} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';

const App = () => {
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
  },
});

export default App;
