from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from models import User
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing data'}), 400

    # Required fields
    email = data.get('email')
    user_id = data.get('user_id') or data.get('username')   # accept either key
    password = data.get('password')
    full_name = data.get('full_name') or data.get('name') or user_id
    phone = data.get('phone', '')

    if not email or not user_id or not password:
        return jsonify({'message': 'Email, username, and password are required'}), 400

    # Duplicate checks
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409
    if User.query.filter_by(user_id=user_id).first():
        return jsonify({'message': 'Username already taken'}), 409
    if User.query.filter_by(phone=phone).first():
        return jsonify({'message': 'Phone number already registered'}), 409

    # Hash the password and store as bytes (BLOB column)
    hashed = generate_password_hash(password, method='pbkdf2:sha256')
    password_bytes = hashed.encode('utf-8')

    gender = data.get('gender')
    if not gender:
        gender = None

    dob = data.get('dob')
    if not dob:
        dob = None

    new_user = User(
        user_id=user_id,
        email=email,
        full_name=full_name,
        phone=phone,
        gender=gender,
        dob=dob,
        password=password_bytes
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('password'):
        return jsonify({'message': 'Missing data'}), 400

    # Allow login by email OR user_id
    identifier = data.get('email') or data.get('user_id') or data.get('username')
    if not identifier:
        return jsonify({'message': 'Email or username required'}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.user_id == identifier)
    ).first()

    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    # Decode the BLOB password back to string for verification
    try:
        stored_hash = user.password.decode('utf-8')
    except (UnicodeDecodeError, AttributeError):
        stored_hash = str(user.password)

    if not check_password_hash(stored_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'handle': user.user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, current_app.config['JWT_SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'token': token,
        'user_id': user.id,
        'username': user.user_id,
        'full_name': user.full_name,
        'email': user.email,
        'phone': user.phone,
        'about': user.about or "Exploring the world, one ride at a time 🌍"
    }), 200
