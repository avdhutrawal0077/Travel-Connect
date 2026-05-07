import os
from flask import Flask, send_from_directory
from config import Config
from extensions import db, cors


def create_app(config_class=Config):
    # Resolve the frontend directory (../frontend relative to this file)
    base_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(base_dir, '..', 'frontend')

    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})  # Allow cross-origin requests from our frontend

    # Register blueprints
    from routes.auth import auth_bp
    from routes.rides import rides_bp
    from routes.chat import chat_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(rides_bp, url_prefix='/api/rides')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    # Create database tables if they do not exist
    with app.app_context():
        # db.drop_all() # Uncomment to reset database during dev
        db.create_all()

    # ── Serve frontend ──────────────────────────────────
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'ok'}, 200

    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_dir, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        """Serve any frontend file (CSS, JS, assets, etc.)."""
        file_path = os.path.join(frontend_dir, path)
        if os.path.isfile(file_path):
            return send_from_directory(frontend_dir, path)
        # Fallback to index.html for SPA-style routing
        return send_from_directory(frontend_dir, 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
