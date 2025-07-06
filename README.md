# Articly - Content Processing & Image Compression Tool

A powerful Next.js application designed for content creators and digital marketers to process articles, compress images, and manage disclaimers efficiently.

## Features

### 🖼️ Image Processing
- **Smart Image Compression**: Automatically compresses images to optimal size (825px width)
- **Format Optimization**: Intelligently chooses between PNG and JPG based on transparency
- **Batch Processing**: Handle multiple images simultaneously
- **Visual Preview**: Grid view of processed images with download capability

### 📝 Content Management
- **Rich Text Editor**: Paste and edit content with embedded images
- **Client Name Formatting**: Automatic name capitalization and formatting
- **Link Processing**: Automatic `rel="nofollow"` and `target="_blank"` for external links
- **HTML Export**: Copy processed HTML content for publishing

### ⚙️ Disclaimer Management
- **Custom Disclaimers**: Create and save custom disclaimer text
- **Local Storage**: Persistent storage of disclaimer settings
- **Toggle Feature**: Easy on/off toggle for disclaimer inclusion

## Tech Stack

- **Frontend**: Next.js 15.3.1 with React 19
- **Styling**: Tailwind CSS 4.1.11
- **Image Processing**: Browser-native canvas API with custom compression algorithms
- **State Management**: React hooks with localStorage persistence
- **UI Components**: Custom components with react-hot-toast for notifications

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Articly
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Main Content Processing
1. Enter the client name in the input field
2. Paste your content (text + images) in the left editor
3. Choose whether to include disclaimer
4. Click "Process Content" to generate optimized output
5. Use "Copy HTML" to export the processed content

### Image Compression
- Images are automatically detected and compressed when pasted
- Processed images appear in a grid with download buttons
- Original dimensions and file sizes are preserved in metadata

### Disclaimer Management
- Navigate to `/disc` to manage disclaimer settings
- Enter custom disclaimer text in the textarea
- Click "Save Disclaimer" to store for future use

## Project Structure

```
Articly/
├── app/
│   ├── page.js          # Main content processing interface
│   ├── disc/
│   │   └── page.js      # Disclaimer management page
│   ├── layout.js        # Root layout component
│   └── globals.css      # Global styles
├── utils/
│   └── compressImage.js # Image compression utilities
├── public/              # Static assets
└── package.json
```

## Key Dependencies

- `browser-image-compression`: Advanced image compression
- `js-beautify`: HTML formatting and beautification
- `react-hot-toast`: User notifications
- `sanitize-html`: HTML sanitization for security
- `react-dropzone`: File upload handling

## Development

### Available Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Environment
- Uses Next.js App Router
- Tailwind CSS for styling
- Client-side rendering for interactive features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.

---

**Note**: This application is optimized for content creators who need efficient image processing and content management workflows.
