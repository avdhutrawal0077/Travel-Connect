from flask import Blueprint, request, jsonify
from models import RidePost, Booking, User
from extensions import db
from .auth_middleware import token_required

rides_bp = Blueprint('rides', __name__)

@rides_bp.route('/', methods=['GET'])
def get_rides():
    query = RidePost.query.filter_by(status='open')
    
    pickup = request.args.get('pickup')
    if pickup:
        query = query.filter(RidePost.pickup_location.ilike(f'%{pickup}%'))
        
    dropoff = request.args.get('dropoff')
    if dropoff:
        query = query.filter(RidePost.dropoff_location.ilike(f'%{dropoff}%'))
        
    rides = query.order_by(RidePost.created_at.desc()).all()
    result = []
    for r in rides:
        driver = User.query.get(r.driver_id)
        result.append({
            'id': r.id,
            'driver_name': driver.full_name if driver else 'Unknown',
            'driver_id': r.driver_id,
            'pickup': r.pickup_location,
            'dropoff': r.dropoff_location,
            'date': r.date,
            'time': r.time,
            'seats': r.seats,
            'status': r.status,
            'created_at': r.created_at.isoformat() if r.created_at else ''
        })
    return jsonify(result), 200

@rides_bp.route('/', methods=['POST'])
@token_required
def create_ride(current_user):
    data = request.get_json()
    if not data or not data.get('pickup') or not data.get('dropoff') or not data.get('date') or not data.get('time') or not data.get('seats'):
        return jsonify({'message': 'Missing data'}), 400
        
    new_ride = RidePost(
        driver_id=current_user.id,
        pickup_location=data['pickup'],
        dropoff_location=data['dropoff'],
        date=data['date'],
        time=data['time'],
        seats=int(data['seats'])
    )
    db.session.add(new_ride)
    db.session.commit()
    
    return jsonify({'message': 'Ride created successfully', 'ride_id': new_ride.id}), 201

@rides_bp.route('/book', methods=['POST'])
@token_required
def book_ride(current_user):
    data = request.get_json()
    if not data or not data.get('ride_id'):
        return jsonify({'message': 'Missing ride_id'}), 400
        
    ride = RidePost.query.get(data['ride_id'])
    if not ride:
        return jsonify({'message': 'Ride not found'}), 404
        
    if ride.driver_id == current_user.id:
        return jsonify({'message': 'Cannot book your own ride'}), 400
        
    # Check if already booked (before seat check so correct message is shown)
    existing_booking = Booking.query.filter_by(ride_id=ride.id, passenger_id=current_user.id).first()
    if existing_booking:
        return jsonify({'message': 'Already booked/requested this ride'}), 400
        
    if ride.seats <= 0:
        return jsonify({'message': 'No seats available'}), 400
        
    new_booking = Booking(
        ride_id=ride.id,
        passenger_id=current_user.id,
        status='pending'
    )
    
    ride.seats -= 1
    if ride.seats == 0:
        ride.status = 'closed'
        
    db.session.add(new_booking)
    db.session.commit()
    
    return jsonify({'message': 'Ride booked successfully'}), 200

@rides_bp.route('/<int:ride_id>', methods=['DELETE'])
@token_required
def delete_ride(current_user, ride_id):
    ride = RidePost.query.get(ride_id)
    if not ride:
        return jsonify({'message': 'Ride not found'}), 404

    # Only the creator can delete their own ride
    if ride.driver_id != current_user.id:
        return jsonify({'message': 'You can only delete your own rides'}), 403

    # Delete associated bookings first
    Booking.query.filter_by(ride_id=ride.id).delete()
    db.session.delete(ride)
    db.session.commit()

    return jsonify({'message': 'Ride deleted successfully'}), 200

@rides_bp.route('/my-bookings', methods=['GET'])
@token_required
def get_my_bookings(current_user):
    bookings = Booking.query.filter_by(passenger_id=current_user.id).all()
    result = []
    for b in bookings:
        ride = RidePost.query.get(b.ride_id)
        if ride:
            driver = User.query.get(ride.driver_id)
            result.append({
                'booking_id': b.id,
                'ride_id': ride.id,
                'pickup': ride.pickup_location,
                'dropoff': ride.dropoff_location,
                'date': ride.date,
                'time': ride.time,
                'driver_name': driver.full_name if driver else 'Unknown',
                'status': b.status
            })
    return jsonify(result), 200
