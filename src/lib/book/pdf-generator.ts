import type { RecordingWithPrompt, Storyteller } from '@/lib/types';

export interface BookData {
  storyteller: Storyteller;
  stories: RecordingWithPrompt[];
  title?: string;
  dedication?: string;
}

export function generateBookHTML(bookData: BookData): string {
  const { storyteller, stories, title, dedication } = bookData;
  const bookTitle = title || `Die Geschichten von ${storyteller.name}`;

  const completedStories = stories
    .filter(s => s.status === 'completed' && s.cleaned_story)
    .sort((a, b) => {
      const weekA = a.prompt?.week_number ?? 999;
      const weekB = b.prompt?.week_number ?? 999;
      return weekA - weekB;
    });

  const categoryOrder = ['childhood', 'school', 'career', 'family', 'wisdom', 'history', 'reflection'];
  const categoryLabels: Record<string, string> = {
    childhood: 'Kindheit',
    school: 'Schule & Jugend',
    career: 'Beruf & Karriere',
    family: 'Liebe & Familie',
    wisdom: 'Lebensweisheiten',
    history: 'Historische Momente',
    reflection: 'Rückblick',
  };

  const storyByCategory = new Map<string, typeof completedStories>();
  for (const story of completedStories) {
    const cat = story.prompt?.category || 'reflection';
    if (!storyByCategory.has(cat)) storyByCategory.set(cat, []);
    storyByCategory.get(cat)!.push(story);
  }

  let storiesHTML = '';

  for (const category of categoryOrder) {
    const catStories = storyByCategory.get(category);
    if (!catStories?.length) continue;

    storiesHTML += `
      <div class="chapter-title">
        <h2>${categoryLabels[category] || category}</h2>
      </div>
    `;

    for (const story of catStories) {
      storiesHTML += `
        <div class="story">
          <h3 class="question">${story.prompt?.question_de || ''}</h3>
          <div class="story-text">
            ${story.cleaned_story!.split('\n').map(p => `<p>${p}</p>`).join('')}
          </div>
          ${story.qr_code_url ? `
            <div class="qr-section">
              <img src="${story.qr_code_url}" alt="QR Code" class="qr-code" />
              <p class="qr-label">Scanne den QR-Code, um die Originalaufnahme zu hören</p>
            </div>
          ` : ''}
          <p class="date">
            ${new Date(story.created_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 210mm 297mm;
      margin: 25mm 20mm 30mm 20mm;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }

    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      padding: 40mm 20mm;
    }

    .cover h1 {
      font-size: 32pt;
      font-weight: 700;
      color: #8B4513;
      margin-bottom: 20mm;
      line-height: 1.2;
    }

    .cover .subtitle {
      font-size: 14pt;
      color: #666;
      font-style: italic;
    }

    .cover .year {
      font-size: 12pt;
      color: #888;
      margin-top: 30mm;
    }

    .dedication {
      page-break-after: always;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      font-style: italic;
      font-size: 14pt;
      color: #555;
      padding: 40mm;
    }

    .toc {
      page-break-after: always;
      padding-top: 40mm;
    }

    .toc h2 {
      font-size: 20pt;
      color: #8B4513;
      margin-bottom: 15mm;
      text-align: center;
    }

    .toc ul {
      list-style: none;
      padding: 0;
    }

    .toc li {
      padding: 3mm 0;
      border-bottom: 1px dotted #ccc;
      font-size: 12pt;
    }

    .chapter-title {
      page-break-before: always;
      padding-top: 60mm;
      text-align: center;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chapter-title h2 {
      font-size: 24pt;
      color: #8B4513;
      font-weight: 700;
    }

    .story {
      page-break-inside: avoid;
      margin-bottom: 15mm;
      padding-top: 10mm;
    }

    .question {
      font-size: 14pt;
      color: #8B4513;
      font-style: italic;
      margin-bottom: 5mm;
      border-left: 3px solid #8B4513;
      padding-left: 5mm;
    }

    .story-text p {
      text-indent: 5mm;
      margin: 2mm 0;
    }

    .story-text p:first-child {
      text-indent: 0;
    }

    .qr-section {
      margin-top: 8mm;
      text-align: center;
    }

    .qr-code {
      width: 25mm;
      height: 25mm;
    }

    .qr-label {
      font-size: 8pt;
      color: #888;
      margin-top: 2mm;
    }

    .date {
      font-size: 9pt;
      color: #999;
      text-align: right;
      margin-top: 5mm;
    }

    .footer-page {
      page-break-before: always;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      font-size: 10pt;
      color: #888;
    }
  </style>
</head>
<body>
  <!-- Cover -->
  <div class="cover">
    <h1>${bookTitle}</h1>
    <p class="subtitle">Ein Buch voller Erinnerungen</p>
    <p class="year">${new Date().getFullYear()}</p>
  </div>

  ${dedication ? `
    <div class="dedication">
      <p>${dedication}</p>
    </div>
  ` : ''}

  <!-- Table of Contents -->
  <div class="toc">
    <h2>Inhalt</h2>
    <ul>
      ${categoryOrder
        .filter(cat => storyByCategory.has(cat) && storyByCategory.get(cat)!.length > 0)
        .map(cat => `<li>${categoryLabels[cat] || cat}</li>`)
        .join('')}
    </ul>
  </div>

  <!-- Stories -->
  ${storiesHTML}

  <!-- Back Cover -->
  <div class="footer-page">
    <div>
      <p>Erstellt mit MeineMemoiren.com</p>
      <p>${completedStories.length} Geschichten &middot; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;
}
