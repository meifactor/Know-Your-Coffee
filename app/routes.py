from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash, current_app
import json
import os

main = Blueprint('main', __name__)

def load_data():
    with open('data/lessons.json') as f:
        lessons = json.load(f)
    with open('data/quiz.json') as f:
        quiz = json.load(f)
    return lessons, quiz['questions']

@main.route('/')
def home():
    return render_template('home.html')

@main.route('/learn/<int:lesson_id>')
def learn_lesson(lesson_id):
    lessons, _ = load_data()
    if lesson_id < 1 or lesson_id > len(lessons):
        flash("Lesson not found", "error")
        return redirect(url_for('main.learn_overview'))
    # Example: lesson 1 is interactive ranking
    if lesson_id == 1:
        items = ["Brewed Coffee", "Espresso", "Ristretto"]
        labels = ["1: Strongest", "2", "3: Weakest"]
        return render_template('learn_lesson.html', items=items, labels=labels, lesson_id=lesson_id)
    if lesson_id == 2:
        items = ["Steamed Milk", "Foamed Milk"]
        return render_template('learn_lesson.html', items=items, lesson_id=lesson_id)
    if lesson_id == 3:
        return render_template('congrats.html')
    # For all other lessons, show a simple detail page (or fallback to learn.html)
    lesson = lessons[lesson_id-1]
    return render_template('lesson_detail.html', lesson=lesson, lesson_id=lesson_id)

@main.route('/quiz/restart')
def restart_quiz():
    # Clear all quiz-related session data
    session_keys = [
        'skipped_questions',
        'answered_questions',
        'q1_answer', 'q1_correct',
        'q2_answer', 'q2_correct',
        'q3_answer', 'q3_correct',
        'q4_answer', 'q4_correct',
        'q5_answer', 'q5_correct',
        'q6_answer', 'q6_correct',
        'q7_answer', 'q7_correct'
    ]
    
    for key in session_keys:
        if key in session:
            session.pop(key)
    
    session.modified = True
    return redirect(url_for('main.quiz', question_id=1))

@main.route('/quiz/<int:question_id>', methods=['GET', 'POST'])
def quiz(question_id):
    _, quiz_data = load_data()
    if not quiz_data:
        flash("Quiz data could not be loaded", "error")
        return redirect(url_for('main.home'))

    questions = quiz_data
    total_questions = len(questions)
    
    # Initialize session variables if they don't exist
    if 'skipped_questions' not in session:
        session['skipped_questions'] = []
    if 'answered_questions' not in session:
        session['answered_questions'] = []
    
    # Handle POST request (answer submission)
    if request.method == 'POST':
        # If question is already answered and not being skipped, redirect to next question
        if question_id in session['answered_questions'] and request.form.get('skip') != 'true':
            next_id = question_id + 1
            while next_id <= total_questions and (next_id in session['answered_questions'] or next_id in session['skipped_questions']):
                next_id += 1
            if next_id > total_questions:
                if session['skipped_questions']:
                    next_id = session['skipped_questions'][0]
                else:
                    return redirect(url_for('main.results'))
            return redirect(url_for('main.quiz', question_id=next_id))
            
        answer = request.form.get('answer')
        is_skip = request.form.get('skip') == 'true'
        
        if is_skip:
            if question_id not in session['skipped_questions']:
                session['skipped_questions'].append(question_id)
            feedback = {
                'type': 'skip',
                'message': f"You skipped this question. The correct answer was <strong>{questions[question_id-1]['correct_answer']}</strong>.",
                'description': questions[question_id-1]['description']
            }
            
            # Find next unanswered question
            next_id = question_id + 1
            while next_id <= total_questions and (next_id in session['answered_questions'] or next_id in session['skipped_questions']):
                next_id += 1
            
            # If we've gone through all regular questions, check skipped questions
            if next_id > total_questions:
                if session['skipped_questions']:
                    # Get the first skipped question
                    next_id = session['skipped_questions'][0]
                else:
                    # All questions are answered or skipped, go to results
                    return redirect(url_for('main.results'))
            
            feedback['next_url'] = url_for('main.quiz', question_id=next_id)
            session.modified = True
            return render_template('quiz.html',
                                question=questions[question_id-1],
                                current_question=question_id,
                                total_questions=total_questions,
                                feedback=feedback,
                                progress=get_progress())
            
        elif not answer and not is_skip:
            flash("Please select an answer or skip the question.", "error")
            return redirect(url_for('main.quiz', question_id=question_id))
        else:
            # Make comparison case-insensitive for write-in answers
            if 'type' in questions[question_id-1] and questions[question_id-1]['type'] == 'write_in':
                is_correct = answer.lower() == questions[question_id-1]['correct_answer'].lower()
            else:
                is_correct = answer == questions[question_id-1]['correct_answer']
            
            session[f'q{question_id}_answer'] = answer
            session[f'q{question_id}_correct'] = is_correct
            
            if question_id not in session['answered_questions']:
                session['answered_questions'].append(question_id)
            
            if question_id in session['skipped_questions']:
                session['skipped_questions'].remove(question_id)
            
            if is_correct:
                feedback = {
                    'type': 'correct',
                    'message': f"<strong>Correct!</strong> This is a <strong>{questions[question_id-1]['correct_answer']}</strong>!",
                    'description': questions[question_id-1]['description']
                }
            else:
                feedback = {
                    'type': 'incorrect',
                    'message': f"Not quite. You answered <strong>{answer}</strong>. The correct answer was <strong>{questions[question_id-1]['correct_answer']}</strong>.",
                    'description': questions[question_id-1]['description']
                }
            
            # Find next unanswered question
            next_id = question_id + 1
            while next_id <= total_questions and (next_id in session['answered_questions'] or next_id in session['skipped_questions']):
                next_id += 1
            
            # If we've gone through all regular questions, check skipped questions
            if next_id > total_questions:
                if session['skipped_questions']:
                    # Get the first skipped question
                    next_id = session['skipped_questions'][0]
                else:
                    # All questions are answered or skipped, show completion screen
                    next_id = None
            
            # Set the next URL based on whether there are more questions or if we're done
            if next_id:
                feedback['next_url'] = url_for('main.quiz', question_id=next_id)
            else:
                feedback['next_url'] = url_for('main.results')
                feedback['is_complete'] = True
            
            session.modified = True
            return render_template('quiz.html',
                                question=questions[question_id-1],
                                current_question=question_id,
                                total_questions=total_questions,
                                feedback=feedback,
                                progress=get_progress())
    
    # Handle GET request (display question)
    if question_id > total_questions:
        if session['skipped_questions']:
            # Get the first skipped question
            next_id = session['skipped_questions'][0]
            return redirect(url_for('main.quiz', question_id=next_id))
        else:
            return redirect(url_for('main.results'))
    
    # Skip questions that have already been answered
    if question_id in session['answered_questions']:
        next_id = question_id + 1
        while next_id <= total_questions and (next_id in session['answered_questions'] or next_id in session['skipped_questions']):
            next_id += 1
        if next_id > total_questions:
            if session['skipped_questions']:
                next_id = session['skipped_questions'][0]
            else:
                return redirect(url_for('main.results'))
        return redirect(url_for('main.quiz', question_id=next_id))
    
    return render_template('quiz.html',
                         question=questions[question_id-1],
                         current_question=question_id,
                         total_questions=total_questions,
                         progress=get_progress())

def get_progress():
    _, quiz_data = load_data()
    if not quiz_data:
        return []
    
    questions = quiz_data
    progress = []
    
    for i in range(1, len(questions) + 1):
        if i in session.get('skipped_questions', []):
            status = 'skipped'
        elif session.get(f'q{i}_correct') is True:
            status = 'correct'
        elif session.get(f'q{i}_correct') is False:
            status = 'incorrect'
        else:
            status = 'unanswered'
        progress.append({'status': status})
    
    return progress

@main.route('/results')
def results():
    _, quiz_data = load_data()
    if not quiz_data:
        flash("Quiz data could not be loaded", "error")
        return redirect(url_for('main.home'))

    questions = quiz_data
    score = 0
    answers = []
    
    for i, question in enumerate(questions, 1):
        user_answer = session.get(f'q{i}_answer')
        skipped = user_answer is None
        # Make comparison case-insensitive for write-in answers
        if not skipped and 'type' in question and question['type'] == 'write_in':
            correct = user_answer.lower() == question['correct_answer'].lower()
        else:
            correct = False if skipped else user_answer == question['correct_answer']
        if correct:
            score += 1
            
        answers.append({
            'question': question['question'],
            'image': question['image'],
            'user_answer': user_answer,
            'correct_answer': question['correct_answer'],
            'is_correct': correct,
            'skipped': skipped,
            'description': question['description']
        })
    
    return render_template('results.html',
                         score=score,
                         total=len(questions),
                         answers=answers)
@main.route('/learn')
def learn_overview():
    lessons, _ = load_data()
    return render_template('learn.html', lessons=lessons)  # lessons is your list of all lessons

# Removed duplicate and unused helper functions (get_lesson_by_id, get_total_lessons)

@main.route('/learn/beverages')
def learn_beverages():
    return render_template('interactive_coffee.html')

@main.route('/learn/beverages/data')
def interactive_coffee_data():
    """Serve the JSON data for the interactive coffee page."""
    data_path = os.path.join(
        current_app.root_path,
        'static', 'data',
        'interactive_coffee.json'
    )
    with open(data_path, 'r') as f:
        data = json.load(f)
    return jsonify(data)