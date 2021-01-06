# GPA-Converter

GPA Converter is an application written in NodeJS and ReactJS. The purpose of this application is to help calculate the GPA in the 9.0 Scale(York University) and more importantly, convert the said GPA to the 4.0 scale at the same time. 

# Features
- Automatic GPA calculation
- York GPA Import Functionality
- Ability to add extra rows
- Course Grade Calculator (to be implemented)
- JSON based import/export of grade list for grade calculation

# Main Dependencies
- Frontend
    - ReactJS
    - Axios
    - Bootstrap
- Backend
    - Express
    - Puppeteer

# Local Environment Running / Building

Install all node packages(needs to be run in both backend directory as well as gpa-converter directory)

```
npm install
```

To run both the frontend and backend (Recommended)
```
npm run serve
```

To run the frontend only (this means the import from York functionality won't work but manual grades input will work fine)
```
npm run start
```

To run the backend only (only York grades api will be accessible)
```
npm run serve
```

To build the frontend (backend then can be ran separately by `node scrape.js` in backend dir)
```
npm run build
```

# Docker Build

Go to root folder where Dockerfile exists and run the following command to create an image with name gpa-converter

```
docker build -t gpa-converter .
```