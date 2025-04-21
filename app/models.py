from app import db
from datetime import datetime

class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    page_type = db.Column(db.String(10))  # 'learn' or 'quiz'
    page_number = db.Column(db.Integer)
    user_answer = db.Column(db.String(200), nullable=True)
