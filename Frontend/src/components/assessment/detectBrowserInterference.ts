export type EnvironmentStatus = 'CLEAN' | 'KNOWN_EXTENSION' | 'GENERIC_INTERFERENCE';

export interface DetectionResult {
  status: EnvironmentStatus;
  detectedExtensionName: string | null;
}

interface KnownExtensionSignature {
  id: string;
  displayName: string;
  selectors: string[];
}

// Registry for known extensions. 
// Do NOT invent names. Use actual observable DOM signatures.
const KNOWN_EXTENSIONS: KnownExtensionSignature[] = [
  {
    id: 'grammarly',
    displayName: 'Grammarly',
    selectors: [
      'grammarly-extension',
      'grammarly-desktop-integration',
      '[data-gramm="true"]',
      'grammarly-popups'
    ]
  },
  {
    id: 'quillbot',
    displayName: 'QuillBot',
    selectors: [
      'q-box',
      'quillbot-extension',
      '[class^="qb-"]' // Many QuillBot injected elements use the 'qb-' prefix
    ]
  },
  {
    id: 'languagetool',
    displayName: 'LanguageTool',
    selectors: [
      'lt-mirror',
      'lt-div',
      'lt-toolbar',
      '[data-lt-tmp-id]'
    ]
  },
  {
    id: 'quizbot',
    displayName: 'Quizbot AI',
    selectors: [
      '[data-quizbot]'
    ]
  },
  {
    id: 'ms-editor',
    displayName: 'Microsoft Editor',
    selectors: [
      '[data-ms-editor]',
      'ms-editor-toolbar'
    ]
  }
];

export function detectBrowserInterference(workspaceRoot?: HTMLElement | Document): DetectionResult {
  const root = workspaceRoot || document;

  // 1. Check for known extension signatures
  for (const ext of KNOWN_EXTENSIONS) {
    for (const selector of ext.selectors) {
      if (root.querySelector(selector)) {
        return {
          status: 'KNOWN_EXTENSION',
          detectedExtensionName: ext.displayName
        };
      }
    }
  }

  // 2. Generic interference check
  // Extensions often inject custom elements into the body or adjacent to textareas
  // We can look for unexpected shadow roots attached to document body if scanning broadly,
  // but to avoid false positives, we focus on unexpected nodes injected into our assessment workspace.
  // Wait, shadow roots are hard to query from outside. We can check for non-standard HTML tags.
  
  if (workspaceRoot) {
    const allElements = workspaceRoot.querySelectorAll('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      const tagName = el.tagName.toLowerCase();
      // Heuristic: Custom elements with hyphens that are not ours (we don't use web components natively)
      // or injected script/style tags inside the workspace itself.
      if (tagName.includes('-') && !tagName.startsWith('data-') && !tagName.startsWith('lucide-')) {
        return {
          status: 'GENERIC_INTERFERENCE',
          detectedExtensionName: null
        };
      }
    }
  }

  return {
    status: 'CLEAN',
    detectedExtensionName: null
  };
}
