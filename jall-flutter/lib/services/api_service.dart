import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../constants.dart';
import '../models/booking.dart';
import '../models/car.dart';

class ApiService {
  final String? token;

  static String get _baseUrl => kDebugMode ? kDebugBaseUrl : kBaseUrl;

  const ApiService({this.token});

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  String _humanizeError(Object? raw, {required String fallback}) {
    final message = (raw ?? fallback).toString().toLowerCase();
    if (message.contains('user not found')) {
      return 'لا يوجد حساب مطابق لهذا البريد الإلكتروني.';
    }
    if (message.contains('invalid credentials')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    }
    if (message.contains('email and password required')) {
      return 'يرجى إدخال البريد الإلكتروني وكلمة المرور.';
    }
    if (message.contains('socketexception') || message.contains('failed host lookup')) {
      return 'تعذر الاتصال بالخدمة الآن. تحقق من الشبكة ثم أعد المحاولة.';
    }
    if (message.contains('booking failed')) {
      return 'تعذر تأكيد الحجز الآن. حاول مرة أخرى بعد قليل.';
    }
    if (message.contains('failed to load cars')) {
      return 'تعذر تحميل الأسطول الآن. حاول مرة أخرى.';
    }
    return fallback;
  }

  Future<String> login(String email, String password) async {
    try {
      final loginUri = Uri.parse('$_baseUrl/auth/login');
      final response = await http.post(
        loginUri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body)['token'] as String;
      }

      if (kDebugMode) {
        debugPrint(
          'Login failed ${response.statusCode} at $loginUri: ${response.body}',
        );
      }

      throw Exception(
        _humanizeError(
          jsonDecode(response.body)['error'],
          fallback: 'تعذر تسجيل الدخول الآن. حاول مرة أخرى.',
        ),
      );
    } catch (error) {
      throw Exception(
        _humanizeError(
          error,
          fallback: 'تعذر تسجيل الدخول الآن. حاول مرة أخرى.',
        ),
      );
    }
  }

  Future<List<Car>> fetchCars() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/cars'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final list = jsonDecode(response.body) as List<dynamic>;
        return list
            .map((json) => Car.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(
        _humanizeError(
          response.body,
          fallback: 'تعذر تحميل السيارات المتاحة الآن.',
        ),
      );
    } catch (error) {
      throw Exception(
        _humanizeError(
          error,
          fallback: 'تعذر تحميل السيارات المتاحة الآن.',
        ),
      );
    }
  }

  Future<Booking> createBooking({
    required int carId,
    required String pickupLocation,
    required String destination,
    required String rideDate,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/bookings'),
        headers: _headers,
        body: jsonEncode({
          'car_id': carId,
          'pickup_location': pickupLocation,
          'destination': destination,
          'ride_date': rideDate,
        }),
      );

      if (response.statusCode == 201) {
        return Booking.fromJson(
          jsonDecode(response.body) as Map<String, dynamic>,
        );
      }

      throw Exception(
        _humanizeError(
          jsonDecode(response.body)['error'],
          fallback: 'تعذر إتمام الحجز الآن.',
        ),
      );
    } catch (error) {
      throw Exception(
        _humanizeError(
          error,
          fallback: 'تعذر إتمام الحجز الآن.',
        ),
      );
    }
  }

  Future<List<Booking>> fetchBookings() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/bookings'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list
          .map((json) => Booking.fromJson(json as Map<String, dynamic>))
          .toList();
    }

    throw Exception('تعذر تحميل الحجوزات الحالية.');
  }
}
