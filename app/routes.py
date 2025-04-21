from flask import Blueprint, render_template, request, session, redirect, url_for
import json
import os

main = Blueprint('main', __name__)


@main.route('/')
def home():
    return render_template('home.html')


@main.route('/quiz')
def quiz_start():
    """Redirect /quiz → the first question."""
    return redirect(url_for('main.quiz', question_id=1))

@main.route('/learn')
def learn_start():
    """Redirect /learn → /learn/1"""
    return redirect(url_for('main.learn', lesson_id=1))


@main.route('/learn/beverages')
def learn_beverages():
    # Mike’s custom learn page—still just renders a template
    return render_template('learn_beverages.html')
