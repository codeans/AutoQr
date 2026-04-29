const { initializeFcmBackgroundHandling } = require("./services/notifications/fcmService");
const { handleBackgroundIncomingCall } = require("./features/calls/backgroundCallHandler");

initializeFcmBackgroundHandling();
global.__AUTOQR_BACKGROUND_CALL_HANDLER__ = handleBackgroundIncomingCall;
require("expo-router/entry");
