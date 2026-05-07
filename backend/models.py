from extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)      # username / handle
    email = db.Column(db.String(100), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=True)
    dob = db.Column(db.Date, nullable=True)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    password = db.Column(db.LargeBinary, nullable=False)                  # BLOB
    about = db.Column(db.String(255), nullable=True, default="Exploring the world, one ride at a time 🌍")
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    # Relationships
    rides = db.relationship('RidePost', backref='driver', lazy=True)
    bookings = db.relationship('Booking', backref='passenger', lazy=True)


class RidePost(db.Model):
    __tablename__ = 'ride_posts'
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pickup_location = db.Column(db.String(255), nullable=False)
    dropoff_location = db.Column(db.String(255), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    seats = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='open')   # open, closed, removed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('ride_posts.id'), nullable=False)
    passenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, nullable=True)
    room_id = db.Column(db.String(50), nullable=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class Post(db.Model):
    """Richer ride-post table that already exists in the Aiven database."""
    __tablename__ = 'posts'
    post_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.user_id'), nullable=False)
    driver_name = db.Column(db.String(100), nullable=False)
    driver_avatar = db.Column(db.String(10), nullable=True)
    pickup_location = db.Column(db.String(255), nullable=False)
    pickup_street = db.Column(db.String(255), nullable=True)
    pickup_area = db.Column(db.String(100), nullable=True)
    pickup_pincode = db.Column(db.String(10), nullable=True)
    destination_location = db.Column(db.String(255), nullable=False)
    destination_street = db.Column(db.String(255), nullable=True)
    destination_area = db.Column(db.String(100), nullable=True)
    destination_pincode = db.Column(db.String(10), nullable=True)
    departure_time = db.Column(db.Time, nullable=False)
    arrival_time = db.Column(db.Time, nullable=False)
    vehicle_type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    max_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(),
                           onupdate=db.func.current_timestamp())


class OTPTable(db.Model):
    __tablename__ = 'otp_table'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    expiry = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
