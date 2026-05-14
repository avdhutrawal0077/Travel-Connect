from flask import Blueprint, request, jsonify
from models import ChatMessage, User
from extensions import db
from .auth_middleware import token_required
from sqlalchemy import or_, and_

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/inbox', methods=['GET'])
@token_required
def get_inbox(current_user):
    # Find all distinct conversations for current_user
    messages = ChatMessage.query.filter(
        or_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == current_user.id)
    ).order_by(ChatMessage.timestamp.desc()).all()
    
    conversations = {}
    for m in messages:
        other_user_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_user_id and other_user_id not in conversations:
            other_user = User.query.get(other_user_id)
            if other_user:
                conversations[other_user_id] = {
                    'user_id': other_user.id,
                    'user_name': other_user.full_name,
                    'latest_message': m.content,
                    'timestamp': m.timestamp.isoformat() if m.timestamp else ''
                }
                
    result = list(conversations.values())
    result.sort(key=lambda x: x['timestamp'], reverse=True)
    return jsonify(result), 200

@chat_bp.route('/', methods=['GET'])
@token_required
def get_messages(current_user):
    other_user_id = request.args.get('user_id')
    
    if other_user_id:
        try:
            other_user_id = int(other_user_id)
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid user_id'}), 400
        # Fetch 1-to-1 messages between current_user and other_user_id
        messages = ChatMessage.query.filter(
            or_(
                and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == other_user_id),
                and_(ChatMessage.sender_id == other_user_id, ChatMessage.receiver_id == current_user.id)
            )
        ).order_by(ChatMessage.timestamp.asc()).all()
    else:
        # Global chat fallback
        messages = ChatMessage.query.filter((ChatMessage.receiver_id == None)).order_by(ChatMessage.timestamp.asc()).all()
        
    result = []
    for m in messages:
        sender = User.query.get(m.sender_id)
        result.append({
            'id': m.id,
            'sender_name': sender.full_name if sender else 'Unknown',
            'sender_id': m.sender_id,
            'content': m.content,
            'timestamp': m.timestamp.isoformat() if m.timestamp else '',
            'is_me': m.sender_id == current_user.id
        })
    return jsonify(result), 200

@chat_bp.route('/', methods=['POST'])
@token_required
def send_message(current_user):
    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({'message': 'Missing message content'}), 400
        
    receiver_id = data.get('receiver_id')
    
    new_msg = ChatMessage(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=data['content']
    )
    db.session.add(new_msg)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent',
        'id': new_msg.id,
        'sender_name': current_user.full_name,
        'timestamp': new_msg.timestamp.isoformat() if new_msg.timestamp else ''
    }), 201

@chat_bp.route('/resolve_user/<identifier>', methods=['GET'])
@token_required
def resolve_user(current_user, identifier):
    user = User.query.filter((User.user_id == identifier) | (User.phone == identifier)).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    if user.id == current_user.id:
        return jsonify({'message': 'Cannot chat with yourself'}), 400
    return jsonify({
        'user_id': user.id,
        'full_name': user.full_name
    }), 200

