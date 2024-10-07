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

#import <UIKit/UIKit.h>
#import <React/RCTBridgeDelegate.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate, FIRMessagingDelegate, TikTokOpenSDKLogDelegate>

@property (nonatomic, strong) UIWindow *window; // UIWindow 프로퍼티 선언

@property (nonatomic, strong) RCTBridge *bridge;
@property (nonatomic, strong) NSString *moduleName;
@property (nonatomic, strong) NSDictionary *initialProps;

@end
