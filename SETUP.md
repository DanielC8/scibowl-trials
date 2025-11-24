# Setup Instructions

## Prerequisites

You need to install Node.js before running this application.

### Installing Node.js on Windows

1. **Download Node.js**:
   - Visit https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - Run the installer and follow the installation wizard
   - Make sure to check the box that says "Automatically install the necessary tools"

2. **Verify Installation**:
   Open a new PowerShell or Command Prompt window and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers for both commands.

## Running the Application

Once Node.js is installed:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
   This will install all required packages listed in package.json.

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start, usually at http://localhost:5173

3. **Open in Browser**:
   - Open your web browser
   - Navigate to the URL shown in the terminal (typically http://localhost:5173)

## Quick Start After Installation

```bash
# Navigate to project directory
cd "c:/Users/duhdu/Documents/SciBowlStuff/CascadeProjects/windsurf-project"

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` folder.

## Troubleshooting

### "npm is not recognized"
- Make sure Node.js is properly installed
- Close and reopen your terminal/PowerShell after installation
- Verify Node.js is in your system PATH

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### Module Not Found Errors
Run `npm install` again to ensure all dependencies are installed.

## Next Steps

After successfully starting the application:

1. **Add Problems**: Upload images of problems for each subject
2. **Or Upload PDF**: Use the PDF upload feature to automatically categorize problems
3. **Generate Sets**: Configure your desired settings and generate problem sets
4. **Export**: Download generated sets as HTML files

Enjoy using Science Bowl Trials!
