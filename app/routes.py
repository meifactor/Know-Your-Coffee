from flask import Blueprint, render_template, request, session, redirect, url_for
import json
import os

main = Blueprint('main', __name__)

lessons = [
    {
        "title": "Espresso",
        "content": "<p>Concentrated coffee made by forcing hot water through finely-ground coffee, bolder than brewed coffee.</p>",
        "gif": "https://i.gifer.com/origin/ac/ac83910ffc9eaf2a934df34d0a393fa8.gif",
    },
    {
        "title": "Ristretto",
        "content": "<p>A short shot of espresso, using less water and producing a more concentrated flavor.</p>",
        "gif": "https://about.starbucks.com/uploads/2025/01/Ristretto-Shot.gif",
    },
    {
        "title": "Foamed Milk",
        "content": "<p>Milk that has been aerated to create a light, frothy texture for drinks like cappuccinos.</p>",
        "gif": "https://s.yimg.com/ny/api/res/1.2/bk_4fuw.gDrEG4DNfHnewA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTU0MQ--/https://media.zenfs.com/en-US/homerun/spoon_university_184/6bd732b73f4213523975b46abbe015bc",
    },
    {
        "title": "Steamed Milk",
        "content": "<p>Milk heated with steam to create a creamy texture, used in lattes and other drinks.</p>",
        "gif": "https://media.giphy.com/media/t3tTsNV1y2XRYPDyOX/giphy.gif",
    }
]

@main.route('/')
def home():
    return render_template('home.html')


@main.route('/quiz')
def quiz_start():
    """Redirect /quiz → the first question."""
    return redirect(url_for('main.quiz', question_id=1))

@main.route('/learn')
def learn_overview():
    return render_template('learn.html', lessons=lessons)  # lessons is your list of all lessons


def get_lesson_by_id(lesson_id):
    # lesson_id is 1-based, list is 0-based
    if 1 <= lesson_id <= len(lessons):
        return lessons[lesson_id - 1]
    else:
        # Optionally, handle invalid lesson_id
        return {"title": "Lesson Not Found", "content": "<p>This lesson does not exist.</p>"}

def get_total_lessons():
    return len(lessons)

@main.route('/learn/beverages')
def learn_beverages():
    # Mike’s custom learn page—still just renders a template
    return render_template('learn_beverages.html')
