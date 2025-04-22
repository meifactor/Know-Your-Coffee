import sys
import subprocess
import pkg_resources
import os

def install_dependencies():
    """Check and install required packages from requirements.txt"""
    try:
        # Get the directory where run.py is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        requirements_path = os.path.join(current_dir, 'requirements.txt')
        
        # Read requirements file
        with open(requirements_path, 'r') as f:
            requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        # Check installed packages
        installed = {pkg.key: pkg.version for pkg in pkg_resources.working_set}
        missing = []
        
        for requirement in requirements:
            # Parse package name and version
            if '==' in requirement:
                package_name, version = requirement.split('==')
            else:
                package_name = requirement
                version = None
            
            # Check if package is installed
            if package_name.lower() not in installed:
                missing.append(requirement)
            elif version and installed[package_name.lower()] != version:
                missing.append(requirement)
        
        if missing:
            print("Installing missing dependencies...")
            for pkg in missing:
                print(f"Installing {pkg}")
                subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
            print("All dependencies installed successfully!")
        else:
            print("All required dependencies are already installed!")
            
    except Exception as e:
        print(f"Error installing dependencies: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    print("Checking dependencies...")
    install_dependencies()
    
    print("Starting the application...")
    from app import create_app
    
    app = create_app()
    app.run(host="127.0.0.1", port=5001, debug=True)