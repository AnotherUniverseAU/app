#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <Firebase.h>
// Firebase Analytics 관련 import 추가
#import <FirebaseAnalytics/FirebaseAnalytics.h>
// Firebase Messaging 관련 import 추가
#import <FirebaseMessaging/FirebaseMessaging.h>
// Branch 관련 import 추가
#import <RNBranch/RNBranch.h>
// Facebook SDK import 추가
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <FBSDKCoreKit/FBSDKAppEvents.h>
#import <FBSDKCoreKit/FBSDKApplicationDelegate.h>
#import <React/RCTLinkingManager.h>
// Tiktok SDK import 추가
#import <TikTokOpenSDK/TikTokOpenSDKApplicationDelegate.h>
// User Notifications import 추가
#import <UserNotifications/UserNotifications.h>
// RCTRootView import 추가
#import <React/RCTRootView.h>
// Splash Screen 추가
#import "RNSplashScreen.h"

@implementation AppDelegate

// Facebook SDK 관련 추가
- (void)applicationDidBecomeActive:(UIApplication *)application {
    [FBSDKAppEvents activateApp];
}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Facebook SDK 초기화
    [[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];

    // Branch 초기화
    [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
    
    // Firebase 초기화
    [FIRApp configure];
    [FIRMessaging messaging].delegate = self;

    // Firebase Analytics에 앱 실행 로그 보내기
    [FIRAnalytics logEventWithName:@"app_open"
                        parameters:@{
                                     kFIRParameterItemID: @"id-app_open",
                                     kFIRParameterItemName: @"App Opened",
                                     kFIRParameterContentType: @"event"
                                     }];

    // Tiktok SDK 초기화
    [[TikTokOpenSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];
    [TikTokOpenSDKApplicationDelegate sharedInstance].logDelegate = self;

    // React Native 설정
    self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:self.bridge
                                                     moduleName:@"AU"
                                              initialProperties:self.initialProps];

    rootView.backgroundColor = [UIColor whiteColor];

    // UIWindow 초기화 및 설정
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];

    if ([UNUserNotificationCenter class] != nil) {
        [UNUserNotificationCenter currentNotificationCenter].delegate = self;
        UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert |
                                             UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
        [[UNUserNotificationCenter currentNotificationCenter]
         requestAuthorizationWithOptions:authOptions
         completionHandler:^(BOOL granted, NSError * _Nullable error) {
             if (granted) {
                 dispatch_async(dispatch_get_main_queue(), ^{
                     [application registerForRemoteNotifications];
                 });
             }
         }];
    } else {
        [application registerForRemoteNotifications];
    }

    self.moduleName = @"AU";
    self.initialProps = @{};

    [RNSplashScreen show];

    return YES;
}



// Branch 관련 추가
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
    [RNBranch continueUserActivity:userActivity];
    return YES;
}

// FCM 토큰 갱신을 위한 메소드
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
    NSLog(@"FCM registration token: %@", fcmToken);
    // 필요한 경우 이 토큰을 앱 서버에 전송
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    // 여기에서 userInfo를 사용하여 필요한 작업을 수행합니다.
    NSLog(@"Received remote notification: %@", userInfo);
    completionHandler(UIBackgroundFetchResultNewData);
}

// UNUserNotificationCenterDelegate 메소드
// 앱이 포그라운드 상태일 때 알림을 받을 경우 처리
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
    // 앱이 포그라운드에 있을 때 알림 표시 방식 설정
    completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound);
}

// 사용자가 알림을 탭하여 앱을 열었을 때 처리
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
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
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


// URL 처리 메소드 통합
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
    if ([RNBranch application:application openURL:url options:options]) {
        return YES;
    }
    if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
        return YES;
    }
    if ([RCTLinkingManager application:application openURL:url options:options]) {
        return YES;
    }
    if ([[TikTokOpenSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey] annotation:options[UIApplicationOpenURLOptionsAnnotationKey]]) {
        return YES;
    }
    return NO;
}

// iOS 9 이하용 URL 처리
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:sourceApplication annotation:annotation]) {
        return YES;
    }
    if ([[TikTokOpenSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:sourceApplication annotation:annotation]) {
        return YES;
    }
    return NO;
}

// TikTok SDK 관련 URL 처리
- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    if ([[TikTokOpenSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:nil annotation:nil]) {
        return YES;
    }
    return NO;
}

// TikTokOpenSDKLogDelegate 메소드 추가
- (void)onLog:(NSString *)logInfo {
    NSLog(@"TikTok SDK Log: %@", logInfo);
}

@end
