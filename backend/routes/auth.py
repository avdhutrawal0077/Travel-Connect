from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from models import User, OTPTable
from extensions import db
import random
from utils import send_otp_email
from .auth_middleware import token_required

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

# ============================================
# OTP & Password Reset Flows
# ============================================

def generate_otp():
    return str(random.randint(100000, 999999))

@auth_bp.route('/forgot-password/send-otp', methods=['POST'])
def forgot_password_send_otp():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email not registered'}), 404
        
    otp = generate_otp()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    otp_record = OTPTable.query.filter_by(email=email).first()
    if otp_record:
        otp_record.otp = otp
        otp_record.expiry = expiry
    else:
        otp_record = OTPTable(email=email, otp=otp, expiry=expiry)
        db.session.add(otp_record)
        
    db.session.commit()
    
    # Send email
    success = send_otp_email(email, otp)
    if success:
        return jsonify({'message': 'OTP sent successfully'}), 200
    else:
        return jsonify({'message': 'Failed to send OTP email. Please check server configuration.'}), 500

@auth_bp.route('/forgot-password/verify-otp', methods=['POST'])
def forgot_password_verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400
        
    otp_record = OTPTable.query.filter_by(email=email, otp=otp).first()
    if not otp_record:
        return jsonify({'message': 'Invalid OTP'}), 400
        
    if datetime.datetime.utcnow() > otp_record.expiry:
        return jsonify({'message': 'OTP has expired'}), 400
        
    return jsonify({'message': 'OTP verified successfully'}), 200

@auth_bp.route('/forgot-password/reset', methods=['POST'])
def forgot_password_reset():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    if not email or not otp or not new_password:
        return jsonify({'message': 'Missing required fields'}), 400
        
    # Verify OTP again just to be secure
    otp_record = OTPTable.query.filter_by(email=email, otp=otp).first()
    if not otp_record or datetime.datetime.utcnow() > otp_record.expiry:
        return jsonify({'message': 'Invalid or expired OTP'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    hashed = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.password = hashed.encode('utf-8')
    
    # Optional: Delete the OTP record after successful reset
    db.session.delete(otp_record)
    db.session.commit()
    
    return jsonify({'message': 'Password reset successfully'}), 200

# Settings Password Change (Logged In Users)
@auth_bp.route('/settings/send-otp', methods=['POST'])
@token_required
def settings_send_otp(current_user):
    email = current_user.email
    
    otp = generate_otp()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    otp_record = OTPTable.query.filter_by(email=email).first()
    if otp_record:
        otp_record.otp = otp
        otp_record.expiry = expiry
    else:
        otp_record = OTPTable(email=email, otp=otp, expiry=expiry)
        db.session.add(otp_record)
        
    db.session.commit()
    
    success = send_otp_email(email, otp)
    if success:
        return jsonify({'message': 'OTP sent to your registered email'}), 200
    else:
        return jsonify({'message': 'Failed to send OTP email'}), 500

@auth_bp.route('/settings/verify-otp', methods=['POST'])
@token_required
def settings_verify_otp(current_user):
    data = request.get_json()
    otp = data.get('otp')
    
    if not otp:
        return jsonify({'message': 'OTP is required'}), 400
        
    email = current_user.email
    otp_record = OTPTable.query.filter_by(email=email, otp=otp).first()
    
    if not otp_record:
        return jsonify({'message': 'Invalid OTP'}), 400
        
    if datetime.datetime.utcnow() > otp_record.expiry:
        return jsonify({'message': 'OTP has expired'}), 400
        
    return jsonify({'message': 'OTP verified successfully'}), 200

@auth_bp.route('/settings/verify-reset', methods=['POST'])
@token_required
def settings_verify_reset(current_user):
    data = request.get_json()
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    if not otp or not new_password:
        return jsonify({'message': 'OTP and new password are required'}), 400
        
    email = current_user.email
    otp_record = OTPTable.query.filter_by(email=email, otp=otp).first()
    
    if not otp_record:
        return jsonify({'message': 'Invalid OTP'}), 400
        
    if datetime.datetime.utcnow() > otp_record.expiry:
        return jsonify({'message': 'OTP has expired'}), 400
        
    hashed = generate_password_hash(new_password, method='pbkdf2:sha256')
    current_user.password = hashed.encode('utf-8')
    
    db.session.delete(otp_record)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200
