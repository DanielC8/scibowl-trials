import { Subject } from '../types';

// Google Drive API configuration - using environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let gapiInited = false;
let gisInited = false;
let tokenClient: any;

/**
 * Initialize Google API client
 */
export async function initializeGoogleDrive(): Promise<boolean> {
  console.log('🔵 Starting Google Drive initialization...');
  
  return new Promise((resolve) => {
    let checkInterval: any;
    
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      console.error('❌ Google Drive initialization timed out');
      resolve(false);
    }, 10000);
    
    const checkBothReady = () => {
      if (gapiInited && gisInited) {
        clearTimeout(timeout);
        clearInterval(checkInterval);
        console.log('✅ Google Drive ready!');
        resolve(true);
      }
    };
    
    // Check every 100ms if both are ready
    checkInterval = setInterval(checkBothReady, 100);
    
    // Load GAPI
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onerror = () => {
      console.error('❌ Failed to load Google API script');
      clearTimeout(timeout);
      resolve(false);
    };
    script.onload = () => {
      console.log('📥 Google API script loaded');
      (window as any).gapi.load('client', async () => {
        try {
          console.log('🔧 Initializing GAPI client...');
          await (window as any).gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          console.log('✅ GAPI client initialized');
          gapiInited = true;
          checkBothReady();
        } catch (error) {
          console.error('❌ GAPI init error:', error);
          clearTimeout(timeout);
          resolve(false);
        }
      });
    };
    document.body.appendChild(script);

    // Load GIS (Google Identity Services)
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onerror = () => {
      console.error('❌ Failed to load Google Identity script');
      clearTimeout(timeout);
      resolve(false);
    };
    gisScript.onload = () => {
      console.log('📥 Google Identity script loaded');
      try {
        tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        console.log('✅ Token client initialized');
        gisInited = true;
        checkBothReady();
      } catch (error) {
        console.error('❌ GIS init error:', error);
        clearTimeout(timeout);
        resolve(false);
      }
    };
    document.body.appendChild(gisScript);
  });
}

/**
 * Sign in to Google Drive
 */
export async function signIn(): Promise<boolean> {
  console.log('🔐 Starting sign-in process...');
  
  return new Promise((resolve) => {
    try {
      // Set up callback before requesting token
      tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          console.error('❌ OAuth error:', resp);
          resolve(false);
          return;
        }
        
        console.log('✅ OAuth token received');
        resolve(true);
      };

      // Check if already have a token
      const existingToken = (window as any).gapi.client.getToken();
      
      if (existingToken === null) {
        console.log('📝 Requesting new access token...');
        // Request access token with consent prompt
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        console.log('🔄 Refreshing existing token...');
        // Request access token without consent prompt
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      resolve(false);
    }
  });
}

/**
 * Sign out from Google Drive
 */
export function signOut() {
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    (window as any).google.accounts.oauth2.revoke(token.access_token);
    (window as any).gapi.client.setToken('');
  }
}

/**
 * Parse subject from folder name
 * Handles both full names and abbreviations (phys, bio, chem, ess)
 */
function parseSubject(folderName: string): Subject | null {
  const name = folderName.toLowerCase().trim();
  
  // Handle abbreviations
  if (name === 'phys' || name === 'physics') return 'physics';
  if (name === 'bio' || name === 'biology') return 'biology';
  if (name === 'chem' || name === 'chemistry') return 'chemistry';
  if (name === 'ess' || name === 'es' || name === 'earth science' || name === 'earth-science') return 'earth-science';
  
  // Handle partial matches
  if (name.includes('phys')) return 'physics';
  if (name.includes('bio')) return 'biology';
  if (name.includes('chem')) return 'chemistry';
  if (name.includes('earth') || name.includes('space') || name.includes('ess')) return 'earth-science';
  
  console.log(`⚠️ Unknown subject folder: "${folderName}"`);
  return null;
}

/**
 * Parse round number from folder/file name
 * Handles "Round 1", "round1", "Round-1", "R1", etc.
 */
function parseRoundNumber(name: string): number | null {
  const patterns = [
    /round\s*(\d+)/i,     // "Round 1", "round 2"
    /r(\d+)/i,            // "R1", "r2"
    /round[-_](\d+)/i,    // "Round-1", "round_2"
  ];
  
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      const roundNum = parseInt(match[1], 10);
      console.log(`✅ Parsed round ${roundNum} from "${name}"`);
      return roundNum;
    }
  }
  
  console.log(`⚠️ Could not parse round number from "${name}"`);
  return null;
}

/**
 * List folders in a Google Drive folder
 */
async function listFolders(folderId: string): Promise<any[]> {
  const response = await (window as any).gapi.client.drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    orderBy: 'name',
  });
  return response.result.files || [];
}

/**
 * List image files in a Google Drive folder
 */
async function listImages(folderId: string): Promise<any[]> {
  const response = await (window as any).gapi.client.drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
    fields: 'files(id, name, mimeType, webContentLink)',
    orderBy: 'name',
  });
  return response.result.files || [];
}

/**
 * Download image as data URL
 */
async function downloadImage(fileId: string): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${(window as any).gapi.client.getToken().access_token}`,
      },
    }
  );
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export interface GoogleDriveImportProgress {
  total: number;
  current: number;
  currentFile: string;
}

/**
 * Import problems from Google Drive folder structure
 * Expected structure: Root Folder -> Topic Folders (Physics, Biology, etc) -> Round Folders (Round 1, Round 2, etc) -> Image Files
 */
export async function importFromGoogleDrive(
  rootFolderId: string,
  onProgress?: (progress: GoogleDriveImportProgress) => void
): Promise<{
  physics: any[];
  'earth-science': any[];
  biology: any[];
  chemistry: any[];
}> {
  const result: {
    physics: any[];
    'earth-science': any[];
    biology: any[];
    chemistry: any[];
  } = {
    physics: [],
    'earth-science': [],
    biology: [],
    chemistry: [],
  };

  // Get topic folders
  const topicFolders = await listFolders(rootFolderId);
  
  let totalFiles = 0;
  let processedFiles = 0;

  // Count total files first
  for (const topicFolder of topicFolders) {
    const roundFolders = await listFolders(topicFolder.id);
    for (const roundFolder of roundFolders) {
      const images = await listImages(roundFolder.id);
      totalFiles += images.length;
    }
  }

  // Process each topic folder
  for (const topicFolder of topicFolders) {
    console.log(`📂 Processing folder: "${topicFolder.name}"`);
    const subject = parseSubject(topicFolder.name);
    if (!subject) {
      console.log(`⚠️ Skipping folder: "${topicFolder.name}" (unknown subject)`);
      continue;
    }
    console.log(`✅ Mapped to subject: ${subject}`);

    // Get round folders
    const roundFolders = await listFolders(topicFolder.id);
    console.log(`📁 Found ${roundFolders.length} round folders in ${topicFolder.name}`);
    
    for (const roundFolder of roundFolders) {
      console.log(`  📁 Processing round folder: "${roundFolder.name}"`);
      const roundNumber = parseRoundNumber(roundFolder.name);
      
      // Get images in this round folder
      const images = await listImages(roundFolder.id);
      console.log(`  🖼️ Found ${images.length} images in ${roundFolder.name}`);
      
      // Process images in batches for better performance
      const BATCH_SIZE = 5;
      for (let i = 0; i < images.length; i += BATCH_SIZE) {
        const batch = images.slice(i, Math.min(i + BATCH_SIZE, images.length));
        
        // Download batch in parallel
        await Promise.all(
          batch.map(async (image) => {
            processedFiles++;
            
            try {
              if (onProgress) {
                onProgress({
                  total: totalFiles,
                  current: processedFiles,
                  currentFile: image.name,
                });
              }

              const imageUrl = await downloadImage(image.id);

              result[subject].push({
                id: `drive-${image.id}`,
                subject,
                imageUrl,
                fileName: image.name,
                roundNumber,
                questionNumber: undefined,
                questionType: undefined,
                answer: undefined,
              });
            } catch (error) {
              console.error(`Failed to process ${image.name}:`, error);
            }
          })
        );
      }
    }
  }

  return result;
}

/**
 * Load Google Picker API
 */
async function loadPickerApi(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).google?.picker) {
      console.log('✅ Picker already loaded');
      resolve(true);
      return;
    }

    console.log('📥 Loading Google Picker API...');
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('picker', {
        callback: () => {
          console.log('✅ Google Picker loaded');
          resolve(true);
        },
        onerror: () => {
          console.error('❌ Failed to load Picker');
          resolve(false);
        },
      });
    };
    script.onerror = () => {
      console.error('❌ Failed to load Picker script');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Browse and select a folder from Google Drive
 */
export async function selectFolder(): Promise<string | null> {
  console.log('📂 Opening folder picker...');
  
  // Make sure Picker API is loaded
  const pickerLoaded = await loadPickerApi();
  if (!pickerLoaded) {
    console.error('❌ Google Picker API not available');
    alert('Google Picker API failed to load. Make sure:\n1. Google Picker API is enabled in Google Cloud Console\n2. Your API key has access to Picker API');
    return null;
  }

  // Check if google.picker exists
  if (!(window as any).google?.picker) {
    console.error('❌ google.picker is undefined');
    alert('Google Picker not available. Please enable Google Picker API in your Google Cloud Console.');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const token = (window as any).gapi.client.getToken();
      if (!token) {
        console.error('❌ No OAuth token available');
        alert('Not signed in. Please sign in first.');
        resolve(null);
        return;
      }

      console.log('🔨 Building picker...');
      
      // Create a DocsView for folder selection
      const docsView = new (window as any).google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true);
      
      const picker = new (window as any).google.picker.PickerBuilder()
        .addView(docsView)
        .setOAuthToken(token.access_token)
        .setDeveloperKey(API_KEY)
        .setTitle('Select Your Science Bowl Problems Folder')
        .setCallback((data: any) => {
          console.log('📊 Picker callback:', data.action);
          if (data.action === (window as any).google.picker.Action.PICKED) {
            const folderId = data.docs[0].id;
            const folderName = data.docs[0].name;
            console.log(`✅ Folder selected: ${folderName} (${folderId})`);
            resolve(folderId);
          } else if (data.action === (window as any).google.picker.Action.CANCEL) {
            console.log('❌ Picker cancelled');
            resolve(null);
          }
        })
        .build();
      
      console.log('👁️ Showing picker...');
      picker.setVisible(true);
    } catch (error) {
      console.error('❌ Picker error:', error);
      alert(`Failed to open folder picker: ${error}\n\nMake sure Google Picker API is enabled in Google Cloud Console.`);
      resolve(null);
    }
  });
}
