# InfoShare: The Eye-Gaze Keyboard Companion App for Enhancing AAC Device User Communication

Please direct questions to Alex Fiannaca (fiannac4@live.com)

This is a Cordova-based project which allows for a single code base to generate mobile apps for iOS, Android, and Windows Phone 8.1.
This reduces the amount of code that must be written, but it means that you must have both a Window machine and an OS X machine and must maintain the project across both.
Below are instructions for getting started with this app in Windows and OS X.

## Windows Instructions

Install Visual Studio 2015 with the support tools for Cordova projects. If you already have VS 2015 installed, you can install the Cordova tools through the New Project interface by selecting Javascript > Apache Cordova Apps.
Before loading the solution in Visual Studio, start a command prompt in the project directory and run `npm install` and `bower install` to install dependencies.
After installing the dependencies, you can load the Visual Studio project.
In order to build and deploy the app to a Windows Phone, build the Windows Phone (Universal) target, **NOT** the Windows Phone 8 target.

## OS X Instructions

Install NodeJS, Sass, Android Studio, and the Android SDK Platform 22 (from the Android SDK Manager). From the project directory, run `npm install -g cordova ionic`, 'npm install', `bower install`, and `ionic restore state`. 
This should load all dependencies and generate android and iOS projects. Run `ionic build ios` or `ionic build android` to build the project for ios or android. 
To run on an attached Android device, run `ionic run android`.
To run on an iOS device, you must be registered under the Apple Developer program. Once you are, you can run `ionic run ios` or open the xCode project under `.\platforms\ios` to deploy to your iPhone.