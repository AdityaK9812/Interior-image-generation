<<<<<<< HEAD
# Interior Image Generator

An AI-powered interior design visualization tool that transforms empty rooms into fully furnished spaces using DALL-E API. Upload a room photo and instantly generate different interior design styles while preserving the room's architectural elements.

## Features

- 🎨 Multiple design styles:
  - Modern Minimalist
  - Luxury Classic
  - Scandinavian
  - Industrial
  - Bohemian
  - Contemporary

- 🏠 Support for different room types:
  - Living Room
  - Bedroom
  - Kitchen

- 🔒 Preserves architectural elements:
  - Windows
  - Doors
  - Room structure
  - Original lighting

- 💾 Generation history:
  - View all previous generations
  - Compare original and generated designs
  - Track generation timestamps

## Tech Stack

- Frontend:
  - Next.js
  - React
  - Tailwind CSS
  - TypeScript

- Backend:
  - Flask
  - OpenAI API (DALL-E)
  - SQLite
  - Python Image Processing (PIL)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/AdityaK9812/Interior-image-generator.git
cd Interior-image-generator
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

5. Start the backend server:
```bash
cd backend/app
python app.py
```

6. Start the frontend development server:
```bash
cd frontend
npm run dev
```

7. Open http://localhost:3000 in your browser

## Usage

1. Select a room type (Living Room, Bedroom, or Kitchen)
2. Choose a design style
3. Upload a photo of your empty room
4. Click "Generate Design"
5. View the generated design and access previous generations in the history section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
=======
# Interior-image-generation
An AI-powered interior design visualization tool that generates photorealistic room designs using DALL-E. Upload a room photo and transform it with different design styles while preserving architectural elements.
>>>>>>> 8dd4b67d090f9ef67c65773b872505ba789148fb
