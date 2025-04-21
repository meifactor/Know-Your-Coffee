from flask import Blueprint, render_template, request, jsonify, session, current_app
from app.models import UserProgress
from app import db
import json
import os

main = Blueprint('main', __name__)

def load_data():
    try:
        # Get the absolute path to the data directory
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        
        # Load lessons
        lessons_path = os.path.join(data_dir, 'lessons.json')
        with open(lessons_path, 'r') as f:
            lessons = json.load(f)
        
        # Load quiz
        quiz_path = os.path.join(data_dir, 'quiz.json')
        with open(quiz_path, 'r') as f:
            quiz = json.load(f)
            
        return lessons, quiz
    except FileNotFoundError as e:
        print(f"Error: Could not find data files: {str(e)}")
        return [], []
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in data files: {str(e)}")
        return [], []

@main.route('/')
def home():
    return render_template('home.html')

@main.route('/learn/<int:lesson_id>')
def learn(lesson_id):
    lessons, _ = load_data()
    if not lessons:
        return "Error: Could not load lesson data", 500
        
    if lesson_id < 1 or lesson_id > len(lessons):
        return "Lesson not found", 404
    
    # Record user progress
    progress = UserProgress(page_type='learn', page_number=lesson_id)
    db.session.add(progress)
    db.session.commit()
    
    return render_template('learn.html', 
                         lesson=lessons[lesson_id-1],
                         current_lesson=lesson_id,
                         total_lessons=len(lessons))

@main.route('/quiz/<int:question_id>', methods=['GET', 'POST'])
def quiz(question_id):
    _, quiz_data = load_data()
    if question_id < 1 or question_id > len(quiz_data):
        return "Question not found", 404

    if request.method == 'POST':
        answer = request.form.get('answer')
        session[f'q{question_id}_answer'] = answer
        
        # Record user answer
        progress = UserProgress(
            page_type='quiz',
            page_number=question_id,
            user_answer=answer
        )
        db.session.add(progress)
        db.session.commit()

    return render_template('quiz.html',
                         question=quiz_data[question_id-1],
                         current_question=question_id,
                         total_questions=len(quiz_data))

@main.route('/results')
def results():
    _, quiz_data = load_data()
    score = 0
    answers = []
    
    for i, question in enumerate(quiz_data, 1):
        user_answer = session.get(f'q{i}_answer')
        correct = user_answer == question['correct_answer']
        if correct:
            score += 1
        answers.append({
            'question': question['question'],
            'user_answer': user_answer,
            'correct_answer': question['correct_answer'],
            'is_correct': correct
        })
    
    return render_template('results.html',
                         score=score,
                         total=len(quiz_data),
                         answers=answers)


@main.route('/learn/beverages')
def learn_beverages():
    # render Mike's Portion of the learn feature
    return render_template('learn_beverages.html')