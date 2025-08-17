# Image Text Composer - Adomate Coding Assignment

A powerful, desktop-only image editing tool that enables users to upload PNG images and overlay them with fully customizable text layers. Built with Next.js, TypeScript, and Fabric.js.

## 🚀 Live Demo

[**View Live Application**](https://image-text-composer-seven.vercel.app/)

## ✨ Features

### Core Functionality
- **PNG Image Upload**: Drag & drop or click to upload PNG images
- **Dynamic Canvas**: Automatically matches uploaded image aspect ratio
- **Multiple Text Layers**: Add unlimited text layers with independent controls
- **Rich Text Editing**: Font family, size, weight, color, opacity, alignment
- **Multi-line Support**: Full support for multiple lines within text boxes
- **Transform Controls**: Drag, resize with handles, and rotate text layers
- **Layer Management**: Reorder layers (bring forward/send backward)
- **Precision Tools**: Snap to center (vertical & horizontal), arrow key nudging
- **History System**: Undo/Redo with 20+ steps and visual indicators
- **Auto-save**: Automatic save to localStorage with page refresh recovery
- **Export**: PNG export maintaining original image dimensions

### Bonus Features Implemented
- **Advanced Text Controls**: Line height and letter spacing adjustment
- **Text Shadow**: Customizable color, blur, and offset with enable/disable
- **Layer Locking**: Lock/unlock layers to prevent accidental edits
- **Smart Snapping**: Multiple snap positions (center, left, right, top, bottom)
- **Keyboard Shortcuts**: Full hotkey support for common actions
- **Enhanced UX**: Professional interface with organized tool panels
- **Google Fonts**: Access to all Google Fonts via API

## 🛠 Setup and Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/romeoscript/image-text-composer.git
cd image-text-composer

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables (Optional)
For full Google Fonts support, add your Google Fonts API key:
```bash
NEXT_PUBLIC_GOOGLE_FONTS_API_KEY=your_api_key_here
```
*Note: The app includes fallback fonts if no API key is provided.*

## 🏗 Architecture

### Project Structure
```
src/
├── app/                    # Next.js app router
├── components/            # Reusable UI components
├── features/editor/       # Core editor functionality
│   ├── components/        # Editor-specific components
│   ├── hooks/             # Custom React hooks
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Utility functions
├── hooks/                 # Global hooks
└── lib/                   # External libraries and services
```

### Key Components
- **Editor**: Main canvas component with Fabric.js integration
- **Sidebar System**: Modular tool panels for different editing functions
- **History Management**: Undo/redo system with localStorage persistence
- **Canvas Events**: Real-time object manipulation and state management

### Technology Choices

#### **Fabric.js**
- **Why**: Industry-standard canvas library with rich object manipulation
- **Pros**: Excellent transform controls, event handling, and text support
- **Trade-offs**: Larger bundle size, but provides professional-grade editing

#### **localStorage Persistence**
- **Why**: Client-side persistence without backend complexity
- **Pros**: Instant saves, works offline, simple implementation
- **Trade-offs**: Limited to single device, storage size limits

#### **React Hooks Architecture**
- **Why**: Clean separation of concerns and reusable logic
- **Pros**: Testable, maintainable, follows React best practices
- **Trade-offs**: Slightly more complex than component-based state

#### **TypeScript**
- **Why**: Type safety and better developer experience
- **Pros**: Catch errors early, excellent IDE support, self-documenting code
- **Trade-offs**: Additional build complexity, learning curve

## 🎯 Bonus Features Implemented

1. **Advanced Text Typography**
   - Line height adjustment
   - Letter spacing control
   - Text shadow with full customization

2. **Layer Management**
   - Lock/unlock layers
   - Visual lock indicators
   - Layer reordering

3. **Enhanced User Experience**
   - Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, etc.)
   - Smart snapping to multiple positions
   - Arrow key nudging for precise positioning
   - Copy/paste functionality

4. **Professional Interface**
   - Organized tool panels
   - Real-time property updates
   - Context-sensitive controls

## ⚠️ Known Limitations

1. **File Format**: Only PNG images supported (as per requirements)
2. **Canvas Size**: Limited by browser memory for very large images
3. **Google Fonts**: Requires API key for full font library access
4. **Mobile**: Desktop-only design (as per requirements)
5. **Collaboration**: Single-user editing only (as per requirements)

## 🎮 Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo  
- `Ctrl/Cmd + C`: Copy selected object
- `Ctrl/Cmd + V`: Paste object
- `Ctrl/Cmd + A`: Select all objects
- `Ctrl/Cmd + S`: Save (manual save)
- `Ctrl/Cmd + M`: Snap to center
- `Ctrl/Cmd + L`: Lock/unlock layer
- `Delete/Backspace`: Delete selected objects
- `Arrow Keys`: Nudge selected objects

## 🚀 Deployment

The application is deployed on Vercel and accessible at: [https://image-text-composer-seven.vercel.app/]

To deploy your own instance:
```bash
npm run build
npm run start
```

Or deploy to Vercel:
```bash
vercel --prod
```

## 📝 License

This project is part of a coding challenge submission for Adomate.

---

**Built with ❤️ using Next.js, TypeScript, and Fabric.js**