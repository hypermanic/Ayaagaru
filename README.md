# Pantulugaru - Devotional Platform

A modern Next.js website for spiritual connection and ritual bookings.

## Features

✨ **Complete Features**
- Homepage with hero section and feature showcase
- Ritual bookings with experienced Pujaris
- User authentication (Google, Facebook, Email)
- Bilingual support (English + Telugu)
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Real-time notifications

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Internationalization**: i18next
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account and project

### Installation

1. Clone the repository
   ```bash
   cd ayyaruapp
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Firebase
   - Copy `.env.example` to `.env.local`
   - Add your Firebase credentials
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/        # Reusable React components
├── app/              # Next.js App Router pages
├── styles/           # Global CSS and Tailwind config
├── lib/              # Utility functions and Firebase setup
├── types/            # TypeScript type definitions
└── i18n/             # Internationalization files
```

## Pages

- `/` - Homepage with hero section
- `/about` - About page with mission and values
- `/login` - User authentication

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
npm run type-check # Check TypeScript types
```

## Configuration

### Tailwind CSS

Custom color palette and fonts are configured in `tailwind.config.js`:

- **Primary Colors**: Saffron, Deep Blue, Warm Gold
- **Secondary Colors**: Ivory, Earth Brown, Light Gray
- **Fonts**: Playfair Display (headings), Inter (body)

### i18n Setup

Translations are in `src/i18n/locales/`:
- `en.json` - English translations
- `te.json` - Telugu translations

## Firebase Setup

### Firestore Collections

```
users/
├── id: string
├── email: string
├── displayName: string
└── ...

bookings/
├── id: string
├── userId: string
├── ritualId: string
├── status: string
└── ...
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Mobile Development (Android)

For detailed instructions on how to build, test, and debug the mobile app, see the [Android Testing Guide](./TESTING_ANDROID.md).

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue on GitHub.

## Roadmap

- [x] Mobile app (Capacitor/Android)
- [ ] User dashboard and profile management
- [ ] Push notifications
- [ ] E-commerce for devotional items
- [ ] PWA support for offline mode
- [ ] AI-powered recommendations

---

**Made with ❤️ for spiritual seekers and practitioners**