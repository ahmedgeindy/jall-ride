class Booking {
  final int id;
  final String pickupLocation;
  final String destination;
  final String rideDate;

  const Booking({
    required this.id,
    required this.pickupLocation,
    required this.destination,
    required this.rideDate,
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: json['id'] as int,
        pickupLocation: json['pickup_location'] as String,
        destination: json['destination'] as String,
        rideDate: json['ride_date'] as String,
      );
}
