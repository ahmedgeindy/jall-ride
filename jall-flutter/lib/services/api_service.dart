import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants.dart';
import '../models/booking.dart';
import '../models/car.dart';

class ApiService {
  final String? token;

  const ApiService({this.token});

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<String> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['token'] as String;
    }

    throw Exception(jsonDecode(response.body)['error'] ?? 'Login failed');
  }

  Future<List<Car>> fetchCars() async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/cars'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list
          .map((json) => Car.fromJson(json as Map<String, dynamic>))
          .toList();
    }

    throw Exception('Failed to load cars');
  }

  Future<Booking> createBooking({
    required int carId,
    required String pickupLocation,
    required String destination,
    required String rideDate,
  }) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/bookings'),
      headers: _headers,
      body: jsonEncode({
        'car_id': carId,
        'pickup_location': pickupLocation,
        'destination': destination,
        'ride_date': rideDate,
      }),
    );

    if (response.statusCode == 201) {
      return Booking.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    }

    throw Exception(jsonDecode(response.body)['error'] ?? 'Booking failed');
  }

  Future<List<Booking>> fetchBookings() async {
    final response = await http.get(
      Uri.parse('$kBaseUrl/bookings'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list
          .map((json) => Booking.fromJson(json as Map<String, dynamic>))
          .toList();
    }

    throw Exception('Failed to load bookings');
  }
}
