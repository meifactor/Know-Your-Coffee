# ☕ Latte - Interactive Coffee Learning Platform

A comprehensive web application designed to educate users about coffee beverages through interactive visual learning and gamified quizzes. Built with Flask and modern web technologies, this platform offers an engaging way to learn about different coffee drinks, their components, and preparation methods.

## 🎯 Purpose

This educational platform was created to make coffee learning interactive and engaging. Users can:
- **Explore** different coffee beverages through interactive SVG diagrams
- **Learn** about coffee components by clicking on visual hotspots
- **Test** their knowledge with a comprehensive quiz system
- **Track** their progress through multiple learning modules

Perfect for coffee enthusiasts, baristas-in-training, or anyone curious about specialty coffee drinks.

## ✨ Key Features

### Interactive Coffee Learning
- **Visual Learning**: Click on different parts of coffee diagrams to learn about ingredients
- **8 Coffee Types**: Americano, Latte, Cappuccino, Macchiato, Mocha, Cortado, Flat White, and Doppio
- **Smart Navigation**: Progress tracking with visual indicators
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### Gamified Quiz System
- **7 Interactive Questions**: Mix of multiple choice and text input
- **Real-time Feedback**: Immediate responses with detailed explanations
- **Progress Tracking**: Visual progress indicators and session management
- **Smart Navigation**: Skip questions and return to them later
- **Results Dashboard**: Comprehensive score breakdown and review

### Structured Learning Modules
- **Lesson System**: Organized learning path with GIF demonstrations
- **Interactive Elements**: Drag-and-drop ranking exercises
- **Progress Persistence**: Session-based progress tracking

## 🛠️ Tech Stack

### Backend
- **Flask 3.0.2** - Python web framework
- **Python** - Core application logic
- **JSON Data Storage** - Lightweight data management
- **Session Management** - User progress tracking

### Frontend
- **HTML5 & CSS3** - Modern, responsive design
- **JavaScript & jQuery** - Interactive functionality
- **SVG Graphics** - Scalable vector illustrations
- **Bootstrap** - Responsive UI components

### Development Tools
- **python-dotenv** - Environment configuration
- **Git** - Version control
- **Modular Architecture** - Organized codebase structure

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/uidesign-latte-3.git
   cd uidesign-latte-3
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python run.py
   ```

4. **Access the application**
   - Open your browser to `http://127.0.0.1:5001`
   - The application will automatically install missing dependencies

## 📱 Application Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with navigation to different sections |
| `/learn` | Overview of all learning modules |
| `/learn/<lesson_id>` | Individual lessons with interactive content |
| `/learn/beverages` | Interactive coffee diagram explorer |
| `/quiz/<question_id>` | Gamified quiz system |
| `/results` | Quiz results and performance analysis |

## 🎨 Architecture Highlights

### Smart Dependency Management
The application includes automatic dependency checking and installation through `run.py`, ensuring smooth setup across different environments.

### Session-Based Progress Tracking
Sophisticated session management allows users to:
- Skip and return to quiz questions
- Track completion status across modules
- Maintain progress during browser sessions

### Interactive SVG Integration
Custom JavaScript handles:
- Dynamic SVG loading and hotspot detection
- Contextual popup positioning
- Responsive interaction feedback
- Progress state management

### Modular Flask Design
Clean separation of concerns with:
- Blueprint-based routing
- JSON data abstraction
- Template inheritance
- Static asset organization

## 🔧 Development Features

- **Hot Reload**: Development server with automatic reloading
- **Error Handling**: Graceful degradation and user feedback
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Scalable Architecture**: Easy to extend with new beverages or lessons

## 📊 Project Structure

```
uidesign-latte-3/
├── app/
│   ├── templates/          # Jinja2 HTML templates
│   ├── static/            # CSS, JS, images, and data files
│   ├── routes.py          # Application routes and logic
│   └── __init__.py        # Flask app factory
├── data/                  # JSON data files
├── requirements.txt       # Python dependencies
├── run.py                # Application entry point
└── README.md             # Project documentation
```

## 🌟 Showcase Features for Recruiters

This project demonstrates:
- **Full-Stack Development**: Complete web application with frontend/backend integration
- **User Experience Design**: Intuitive, interactive learning interface
- **State Management**: Complex session handling and progress tracking
- **API Design**: RESTful endpoints and JSON data handling
- **Modern JavaScript**: ES6+ features, DOM manipulation, and AJAX
- **Responsive Design**: Mobile-first, cross-device compatibility
- **Code Organization**: Clean, maintainable, and well-documented codebase
