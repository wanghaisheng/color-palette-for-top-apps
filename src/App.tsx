import React, { useState, useEffect } from 'react';
import AppCard from './components/AppCard';
import MarkdownDisplay from './components/MarkdownDisplay';
import api from './services/api';
import { AppData } from './types';

function App() {
    const [markdownContent, setMarkdownContent] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppData | null>(null);
    const [allApps, setAllApps] = useState<AppData[]>([]);
    const [currentAppIndex, setCurrentAppIndex] = useState(0);

    useEffect(() => {
        const fetchApps = async () => {
            const appIds = await api.fetchAppDataFromDB();
            if (!appIds || appIds.length === 0) {
                console.error('No app ids found.');
                return;
              }
            const appDetailsPromises = appIds.map(async (appId)=> {
                return await api.fetchAppDetails(appId)
              })
             const apps = await Promise.all(appDetailsPromises)
             setAllApps(apps);
            setAppData(apps[0]);
        };
        fetchApps();
    }, []);


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

   const handleNextApp = () => {
        if(currentAppIndex < allApps.length - 1){
            setCurrentAppIndex(currentAppIndex + 1)
            setAppData(allApps[currentAppIndex+1])
            setMarkdownContent(null)
        }

    };
      const handlePreviousApp = () => {
        if(currentAppIndex > 0){
            setCurrentAppIndex(currentAppIndex - 1)
            setAppData(allApps[currentAppIndex-1])
             setMarkdownContent(null)
        }
    };


  return (
    <div className="app">
      {allApps && (
        <div>
           {appData && <AppCard app={appData} />}
          <button onClick={handlePreviousApp} disabled={currentAppIndex===0}>Previous</button>
          <button onClick={handleNextApp} disabled={currentAppIndex === allApps.length -1}>Next</button>
        </div>
      )}

         <MarkdownDisplay markdown={markdownContent} />
    </div>
  );
}

export default App;
