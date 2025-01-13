import React, { useState, useEffect } from 'react';
import AppCard from './components/AppCard';
import MarkdownDisplay from './components/MarkdownDisplay';
import api from './services/api';
import { AppData } from './types';

function App() {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppData | null>(null);

    useEffect(() => {
        const fetchAppData = async () => {
            const app = {
                "id": 553834731,
                "appId": "com.midasplayer.apps.candycrushsaga",
                "title": "Candy Crush Saga",
                "url": "https://itunes.apple.com/us/app/candy-crush-saga/id553834731?mt=8&uo=4",
                "description": "Candy Crush Saga, from the makers of Candy Crush ...",
                "icon": "http://is5.mzstatic.com/image/thumb/Purple30/v4/7a/e4/a9/7ae4a9a9-ff68-cbe4-eed6-fe0a246e625d/source/512x512bb.jpg",
                "genres": ["Games", "Entertainment", "Puzzle", "Arcade"],
                "genreIds": ["6014", "6016", "7012", "7003"],
                "primaryGenre": "Games",
                "primaryGenreId": 6014,
                "contentRating": "4+",
                "languages": ["EN", "JA"],
                "size": "73974859",
                "requiredOsVersion": "5.1.1",
                "released": "2012-11-14T14:41:32Z",
                "updated": "2016-05-31T06:39:52Z",
                "releaseNotes": "We are back with a tasty Candy Crush Saga update ...",
                "version": "1.76.1",
                "price": 0,
                "currency": "USD",
                "free": true,
                "developerId": 526656015,
                "developer": "King",
                "developerUrl": "https://itunes.apple.com/us/developer/king/id526656015?uo=4",
                "developerWebsite": null,
                "score": 4,
                "reviews": 818816,
                "currentVersionScore": 4.5,
                "currentVersionReviews": 1323,
                "screenshots": [
                    "http://a3.mzstatic.com/us/r30/Purple49/v4/7a/8a/a0/7a8aa0ec-976d-801f-0bd9-7b753fdaf93c/screen1136x1136.jpeg",
                    "http://a1.mzstatic.com/us/r30/Purple49/v4/59/1d/29/591d2974-633e-5953-bb57-5bf9b5394f77/screen1136x1136.jpeg"
                ],
                "ipadScreenshots": [
                    "http://a1.mzstatic.com/us/r30/Purple49/v4/db/45/cf/db45cff9-bdb6-0832-157f-ac3f14565aef/screen480x480.jpeg",
                    "http://a4.mzstatic.com/us/r30/Purple49/v4/c5/55/51/c555517b-1880-d5f1-c923-5d5c04578e77/screen480x480.jpeg"
                ],
                "appletvScreenshots": [],
                "supportedDevices": [
                    "iPhone-3GS",
                    "iPadWifi"
                ]
            }
            setAppData(app);
        };
       fetchAppData();
   },[])

    useEffect(() => {
        if(!appData) return;
        const processApp = async () => {
            const appId = appData.appId;
            const appName = appData.title;
            const screenshotPaths: string[] = [];

            for (let i = 0; i < appData.screenshots.length; i++) {
              const url = appData.screenshots[i];
              const screenshotPath = await api.downloadImage(url, appId, appName, `screen_${i}`);
              if (screenshotPath) {
                screenshotPaths.push(screenshotPath);
              }
            }
             for (let i = 0; i < appData.ipadScreenshots.length; i++) {
                const url = appData.ipadScreenshots[i];
                const screenshotPath = await api.downloadImage(url, appId, appName, `ipad_screen_${i}`);
                if (screenshotPath) {
                    screenshotPaths.push(screenshotPath);
                  }
             }

             if(screenshotPaths.length === 0){
              console.log(`no screenshots found for app ${appName}`);
              return;
            }

            const colorPalette = await api.extractColorPalette(screenshotPaths[0]);
            if (!colorPalette) {
              console.log(`no color palette found for app ${appName}`)
              return;
            }

            const mdContent = await api.generateMarkdownWithGemini(appData, screenshotPaths, colorPalette);
            setMarkdownContent(mdContent);
        }

       processApp();
    }, [appData]);


  return (
    <div className="app">
         {appData && <AppCard app={appData} />}
         <MarkdownDisplay markdown={markdownContent} />
    </div>
  );
}

export default App;
