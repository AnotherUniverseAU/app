#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>
// Firebase Messaging 관련 import 추가
#import <FirebaseMessaging/FirebaseMessaging.h>
//Branch 관련 import 추가
#import <RNBranch/RNBranch.h>
//Facebook SDK import 추가
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <React/RCTLinkingManager.h>


// UNUserNotificationCenterDelegate 및 FIRMessagingDelegate 추가
@interface AppDelegate () <UNUserNotificationCenterDelegate, FIRMessagingDelegate>
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // Facebook SDK 초기화
    [[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];
    // Branch 초기화
    [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
    // Firebase 초기화
    [FIRApp configure];
    [FIRMessaging messaging].delegate = self;
  
    //0506 추가
    self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

    if ([UNUserNotificationCenter class] != nil) {
        [UNUserNotificationCenter currentNotificationCenter].delegate = self;
        UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert |
            UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
        [[UNUserNotificationCenter currentNotificationCenter]
            requestAuthorizationWithOptions:authOptions
            completionHandler:^(BOOL granted, NSError * _Nullable error) {
                // [application registerForRemoteNotifications];
            }];
    } else {
        // [application registerForRemoteNotifications];
    }

    [application registerForRemoteNotifications];



    self.moduleName = @"AU";
    self.initialProps = @{};

    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}



//// Branch 관련 추가
//- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
//    [RNBranch application:app openURL:url options:options];
//  return YES;
//}

// Branch 관련 추가
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
   [RNBranch continueUserActivity:userActivity];
  return YES;
}

// FCM 토큰 갱신을 위한 메소드
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken
{
  NSLog(@"FCM registration token: %@", fcmToken);
  // 필요한 경우 이 토큰을 앱 서버에 전송
}


- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  // 여기에서 userInfo를 사용하여 필요한 작업을 수행합니다.
  NSLog(@"Received remote notification: %@", userInfo);
  completionHandler(UIBackgroundFetchResultNewData);
}


//// iOS 9 이하를 위한 백그라운드 알림 수신
//- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
//{
//  // 알림 데이터 처리
//}

// UNUserNotificationCenterDelegate 메소드
// 앱이 포그라운드 상태일 때 알림을 받을 경우 처리
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  // 앱이 포그라운드에 있을 때 알림 표시 방식 설정
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound);
}

// 사용자가 알림을 탭하여 앱을 열었을 때 처리
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  NSDictionary *userInfo = response.notification.request.content.userInfo;
  // 알림으로부터 데이터 처리
  NSString *route = userInfo[@"data"][@"route"];
  if (route != nil) {
      dispatch_async(dispatch_get_main_queue(), ^{
        // RCTEventEmitter를 상속받은 모듈 찾기
        id eventModule = [self.bridge moduleForName:@"MyEventEmitter"];
        if ([eventModule respondsToSelector:@selector(sendEventWithName:body:)]) {
          [eventModule sendEventWithName:@"NavigateToRoute" body:@{@"route": route}];
        }
      });
    }
  completionHandler();
}


// Firebase 메시징 라이브러리의 소스 URL 가져오기
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//facebook sdk 관련 추가
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  [RNBranch application:application openURL:url options:options];
  if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }

  if ([RCTLinkingManager application:application openURL:url options:options]) {
    return YES;
  }

  return NO;
}



@end


