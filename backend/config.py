import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    basedir = os.path.abspath(os.path.dirname(__file__))
    
    # Check multiple possible CA cert locations
    _ca_candidates = [
        os.path.join(basedir, 'ca.pem'),                           # backend/ca.pem
        os.path.join(basedir, '..', 'ca.pem'),                     # project-root/ca.pem
        os.path.join(basedir, '..', 'ca.pem.txt'),                 # project-root/ca.pem.txt
    ]
    
    ca_path = None
    for _candidate in _ca_candidates:
        if os.path.exists(_candidate):
            ca_path = os.path.abspath(_candidate)
            break
    
    if ca_path:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'connect_args': {
                'ssl': {
                    'ca': ca_path
                }
            }
        }
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
