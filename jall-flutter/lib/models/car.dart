class Car {
  final int id;
  final String make;
  final String model;
  final String plate;
  final int seats;
  final bool available;

  const Car({
    required this.id,
    required this.make,
    required this.model,
    required this.plate,
    required this.seats,
    required this.available,
  });

  factory Car.fromJson(Map<String, dynamic> json) => Car(
        id: json['id'] as int,
        make: json['make'] as String,
        model: json['model'] as String,
        plate: json['plate'] as String,
        seats: json['seats'] as int,
        available: json['available'] as bool,
      );
}
