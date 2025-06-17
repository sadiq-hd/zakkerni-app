# Zakkerni - Smart Task Manager 📋

![Zakkerni Logo](./src/assets/images/logo.png)

> A modern web application for task management and daily organization with full Arabic language support

[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-teal.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://zakkerni.netlify.app/)

## 🌐 Live Demo

🚀 **[Visit Zakkerni Live](https://zakkerni.netlify.app/)**

## 📖 Overview

**Zakkerni** (ذكرني - "Remind Me" in Arabic) is a modern web application designed to help you manage your daily tasks efficiently. Built with cutting-edge technologies, it offers full Arabic language support with a responsive design and attractive user interface.

### ✨ Key Features

- 🎯 **Comprehensive Task Management**: Add, edit, delete, and organize tasks
- 📊 **Advanced Analytics**: Track progress and completion rates
- 🎨 **Modern Design**: Attractive interface with advanced visual effects
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🏷️ **Priority System**: Categorize tasks by importance
- 📅 **Date Management**: Set due dates and reminders
- 📈 **Detailed Reports**: Performance and productivity analysis
- 💾 **Local Storage**: Data saved in browser
- 🎛️ **Filtering & Search**: Display tasks by status and priority
- 📄 **Task Export**: PDF, HTML, CSV, and direct printing

## 🚀 Quick Start

### Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) (version 18 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Angular CLI](https://angular.io/cli) (version 17 or newer)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sadiq-hd/zakkerni-app.git
cd zakkerni-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the project**
```bash
ng serve
# or
npm start
```

4. **Open the application**
```
Open your browser at: http://localhost:4200
```

## 🏗️ Build Process

### Production Build
```bash
ng build --configuration=production
```

### Optimized Build
```bash
ng build --configuration=production --aot --build-optimizer
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/           # Main Components
│   │   ├── header/          # Navigation Header
│   │   ├── home/            # Home Page
│   │   ├── tasks/           # Tasks Management Page
│   │   ├── add-task/        # Add Task Form
│   │   ├── task-list/       # Task List Component
│   │   ├── task-item/       # Individual Task Item
│   │   └── task-counter/    # Task Statistics
│   ├── services/            # Services
│   │   ├── task.service.ts           # Task Management
│   │   ├── pdf-export.service.ts     # PDF Export
│   │   ├── notification.service.ts   # Notifications
│   │   └── export-helper.service.ts  # Export Helper
│   ├── models/              # Models & Interfaces
│   │   └── task.ts         # Task Model
│   ├── interfaces/          # TypeScript Interfaces
│   │   └── pdf-export.interface.ts
│   └── styles/              # Styling Files
├── assets/                  # Static Assets
└── environments/           # Environment Settings
```

## 🛠️ Technologies Used

### Core Framework
- **Angular 17+**: Main framework
- **TypeScript 5+**: Programming language
- **RxJS**: Asynchronous operations management

### Design & UI
- **Tailwind CSS**: CSS framework
- **Angular Signals**: Modern state management
- **CSS Grid & Flexbox**: Responsive layout

### Additional Libraries
- **jsPDF**: PDF file export
- **html2canvas**: HTML to image conversion
- **Angular Reactive Forms**: Form management

### Technical Features
- **Standalone Components**: Independent components
- **Lazy Loading**: Lazy loading for pages
- **Service Workers**: Offline support (optional)

## 📱 Detailed Features

### Task Management
- ✅ Add new tasks with complete details
- ✅ Edit existing tasks
- ✅ Delete unwanted tasks
- ✅ Mark tasks as completed/incomplete
- ✅ Sort tasks by multiple criteria

### Priority System
- 🔴 **High**: Urgent and important tasks
- 🟡 **Medium**: Regular tasks
- 🟢 **Low**: Tasks that can be postponed

### Filtering & Search
- 📋 Show all tasks
- ⏳ Active tasks only
- ✅ Completed tasks only
- ⚠️ Overdue tasks
- 🔍 Text search in titles and descriptions

### Reports & Analytics
- 📊 Daily and weekly completion rates
- 📈 Personal productivity rate
- 🎯 Priority analysis
- 📅 Detailed time statistics
- 💡 Improvement suggestions

### Export & Print
- 📄 **PDF**: Professional reports
- 🌐 **HTML**: Web files for sharing
- 📊 **CSV**: Tabular data
- 🖨️ **Direct Print**: From browser
- 📋 **Copy to Clipboard**: Text reports

## 🎨 Customization & Development

### Design Customization
You can customize colors and design through:
```
src/styles/globals.css
```

### Adding New Features
1. Create a new component:
```bash
ng generate component components/feature-name
```

2. Add a new service:
```bash
ng generate service services/service-name
```

### Environment Variables
Edit the environment file:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  appName: 'Zakkerni',
  version: '1.0.0'
};
```

## 📦 Deployment

### Deploy to Netlify (Current)
```bash
ng build --configuration=production
# Upload dist/zakkerni-app folder to Netlify
```

### Deploy to GitHub Pages
```bash
ng build --configuration=production --base-href="/zakkerni-app/"
```

### Deploy to Vercel
```bash
npm install -g vercel
ng build --configuration=production
vercel --prod
```

## 🔧 Troubleshooting

### Common Issues & Solutions

**Installation Error:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build Issues:**
```bash
# Clear cache
ng cache clean
npm run build
```

**Export Issues:**
```bash
# Make sure you're using supported browsers
# Chrome, Firefox, Safari latest versions
```

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork** the project
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Contribution Guidelines
- Follow [Angular Style Guide](https://angular.io/guide/styleguide)
- Write clear comments in English or Arabic
- Add tests for new features
- Update documentation when needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sadiq Aldubaisi**
- GitHub: [@sadiq-hd](https://github.com/sadiq-hd)
- Project Link: [https://github.com/sadiq-hd/zakkerni-app.git](https://github.com/sadiq-hd/zakkerni-app.git)
- Live Demo: [https://zakkerni.netlify.app/](https://zakkerni.netlify.app/)

## 📞 Contact & Support

- **GitHub Issues**: [Report Issues](https://github.com/sadiq-hd/zakkerni-app/issues)
- **Feature Requests**: [Request Features](https://github.com/sadiq-hd/zakkerni-app/issues)

## 🎯 Future Plans

### Next Version (v2.0)
- [ ] Mobile application (React Native/Flutter)
- [ ] Cloud synchronization
- [ ] Team collaboration
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Third-party integrations

### Suggested Features
- [ ] Dark/Light Mode
- [ ] Additional language support
- [ ] Export to other applications
- [ ] Developer API
- [ ] PWA version

## 📊 Project Statistics

- **Lines of Code**: ~5,000 lines
- **Components**: 15+ components
- **Services**: 5 main services
- **Pages**: 6 pages
- **Features**: 20+ features

## 🙏 Acknowledgments

Thanks to all contributors and users who made this project possible:

- Angular community
- Tailwind CSS developers
- All feedback providers
- Arabic development community

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

## 📈 Development Workflow

### Development Commands
```bash
# Start development server
npm start

# Run tests
npm test

# Run e2e tests
npm run e2e

# Build for production
npm run build

# Lint the code
npm run lint
```

### Project Milestones
- ✅ **v1.0.0**: Basic task management
- ✅ **v1.1.0**: Export functionality
- ✅ **v1.2.0**: Advanced statistics
- 🔄 **v1.3.0**: UI/UX improvements (Current)
- 📋 **v2.0.0**: Cloud features (Planned)

---

<div align="center">

**Made with ❤️ for the Arabic Community**

[🌟 Star this repo](https://github.com/sadiq-hd/zakkerni-app) • [🐛 Report Bug](https://github.com/sadiq-hd/zakkerni-app/issues) • [💡 Request Feature](https://github.com/sadiq-hd/zakkerni-app/issues) • [🚀 Live Demo](https://zakkerni.netlify.app/)

</div>