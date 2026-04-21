const String kBaseUrl = String.fromEnvironment(
  'JALL_API_BASE_URL',
  defaultValue: 'https://jall.com.sa/api',
);

const String kDebugBaseUrl = String.fromEnvironment(
  'JALL_DEBUG_URL',
  defaultValue: 'http://10.0.2.2:5009',
);
