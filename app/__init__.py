from flask import Flask
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.urandom(24)  # For session management
    
    from app.routes import main
    app.register_blueprint(main)

    return app
