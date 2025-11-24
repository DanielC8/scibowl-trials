# Science Bowl Trials

A modern web application for generating randomized Science Bowl problem sets with automatic PDF categorization.

## Features

- **Problem Bank Management**: Upload images of problems organized by subject (Physics, Earth Science, Biology, Chemistry)
- **Random Problem Generation**: Generate customizable problem sets (1-100 problems)
- **Single Subject Mode**: Generate problems from a single subject
- **Mixed Subject Mode**: Generate problems from multiple subjects with custom ratios
- **Even Distribution**: Mixed sets distribute problems evenly according to specified ratios (e.g., 2:1 ratio creates pattern of 2 physics, 1 biology, 2 physics, 1 biology, etc.)
- **PDF Auto-Categorization**: Upload PDFs and automatically detect and categorize problems by subject using keyword analysis
- **Export Functionality**: Download generated problem sets as HTML files for printing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Usage

### Adding Problems

1. **Upload Images**: Click "Add Images" for any subject to upload problem images
2. **Upload PDF**: Click "Upload PDF (Auto-Categorize)" to automatically detect and categorize problems from a PDF file

### Generating Problem Sets

#### Single Subject Mode
1. Select "Single Subject" mode
2. Choose your subject from the dropdown
3. Adjust the number of problems using the slider
4. Click "Generate Problem Set"

#### Mixed Subject Mode
1. Select "Mixed Subjects" mode
2. Add subjects and specify their ratios (e.g., Physics: 2, Biology: 1)
3. Adjust the total number of problems using the slider
4. Click "Generate Problem Set"

The generator will distribute problems evenly according to your ratios. For example, a 2:1 ratio between Physics and Biology will create a pattern of 2 Physics problems, 1 Biology problem, repeated throughout the set.

### Exporting

Click "Download as HTML" to export your generated problem set as an HTML file that can be opened in any browser or printed.

## Technology Stack

- React 18 with TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- Lucide React for icons
- PDF.js for PDF parsing and text extraction

## How PDF Auto-Categorization Works

The app analyzes text content from each PDF page using subject-specific keywords:
- **Physics**: force, energy, momentum, velocity, etc.
- **Earth Science**: geology, meteorology, rocks, minerals, etc.
- **Biology**: cell, DNA, organism, photosynthesis, etc.
- **Chemistry**: atom, molecule, element, reaction, etc.

Each page is scored based on keyword matches and assigned to the subject with the highest score.

## License

MIT
