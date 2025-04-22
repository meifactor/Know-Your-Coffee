from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.urandom(24)  # For session management
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user_data.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    
    from app.routes import main
    app.register_blueprint(main)

    with app.app_context():
        db.create_all()

    return app
