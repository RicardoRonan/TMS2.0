/**
 * Icon mapping utility for FontAwesome Icons
 * Maps common icon names to FontAwesome icon names
 * Uses dynamic imports for lazy loading
 */

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface IconMapping {
  icon: IconDefinition
}

// Icon import map - maps icon names to their dynamic import paths
const iconImportMap: Record<string, () => Promise<{ default: IconDefinition }>> = {
  // Navigation
  'home': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faHome })),
  'menu': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faBars })),
  'ellipsis-vertical': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faEllipsisVertical })),
  'close': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faXmark })),
  'chevron-down': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faChevronDown })),
  'chevron-up': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faChevronUp })),
  'chevron-left': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faChevronLeft })),
  'chevron-right': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faChevronRight })),
  
  // Actions
  'search': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faMagnifyingGlass })),
  'external-link': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faArrowUpRightFromSquare })),
  'heart': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faHeart })),
  'favorite': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faStar })),
  'bookmark': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faBookmark })),
  'share': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faShare })),
  'download': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faDownload })),
  'upload': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faUpload })),
  'edit': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faPen })),
  'delete': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faTrash })),
  'copy': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCopy })),
  'undo': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faRotateLeft })),
  'redo': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faRotateRight })),
  'save': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFloppyDisk })),
  'settings': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faGear })),
  'cogicon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faGear })),
  'cog': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faGear })),
  'filter': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFilter })),
  
  // User
  'user': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faUser })),
  'user-circle': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faUserCircle })),
  'login': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faRightToBracket })),
  'logout': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faRightFromBracket })),
  'profile': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faIdCard })),
  
  // Content
  'document': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFile })),
  'documenttexticon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFileLines })),
  'article': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFileLines })),
  'blog': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faNewspaper })),
  'folder': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFolder })),
  'foldericon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFolder })),
  'file': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faFile })),
  
  // Communication
  'chat': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faComments })),
  'chatbubbleleftrighticon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faComments })),
  'message': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faComments })),
  'mail': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faEnvelope })),
  'notification': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faBell })),
  
  // Tools & Development
  'tool': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faToolbox })),
  'wrench': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faWrench })),
  'wrenchscrewdrivericon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faWrench })),
  'code': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCode })),
  'tutorial': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faGraduationCap })),
  'academic': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faGraduationCap })),
  'academiccapicon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faGraduationCap })),
  
  // UI Elements
  'check': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCheck })),
  'close-x': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faXmark })),
  'arrow-right': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faArrowRight })),
  'arrow-left': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faArrowLeft })),
  'plus': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faPlus })),
  'minus': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faMinus })),
  'info': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCircleInfo })),
  'warning': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faTriangleExclamation })),
  'error': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faTriangleExclamation })),
  'success': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCheckCircle })),
  
  // Social
  'twitter': () => import('@fortawesome/free-brands-svg-icons').then(m => ({ default: m.faTwitter })),
  'facebook': () => import('@fortawesome/free-brands-svg-icons').then(m => ({ default: m.faFacebook })),
  'github': () => import('@fortawesome/free-brands-svg-icons').then(m => ({ default: m.faGithub })),
  'pinterest': () => import('@fortawesome/free-brands-svg-icons').then(m => ({ default: m.faPinterest })),
  'linkedin': () => import('@fortawesome/free-brands-svg-icons').then(m => ({ default: m.faLinkedin })),
  'reddit': () => import('@fortawesome/free-brands-svg-icons').then(m => ({ default: m.faReddit })),
  
  // Media
  'image': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faImage })),
  'video': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faVideo })),
  'music': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faMusic })),
  
  // Other
  'calendar': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCalendar })),
  'clock': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faClock })),
  'star': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faStar })),
  'tag': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faTag })),
  'link': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faLink })),
  'phone': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faPhone })),
  'location': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faLocationDot })),
  'sun': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faSun })),
  'moon': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faMoon })),
  'expand': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faMaximize })),
  
  // Markdown Editor Icons
  'bold': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faBold })),
  'italic': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faItalic })),
  'strikethrough': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faStrikethrough })),
  'list': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faList })),
  'list-ordered': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faListOl })),
  'checkbox': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faSquareCheck })),
  'quote': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faQuoteLeft })),
  'table': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faTable })),
  'eye': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faEye })),
  'code-block': () => import('@fortawesome/free-solid-svg-icons').then(m => ({ default: m.faCode })),
}

// Cache for loaded icons
const iconCache = new Map<string, IconDefinition>()

/**
 * Gets the icon mapping for a given icon name (async)
 * Returns a promise that resolves to the icon definition
 */
export async function getIconAsync(iconName: string): Promise<IconDefinition | null> {
  const key = iconName.toLowerCase()
  
  // Check cache first
  if (iconCache.has(key)) {
    return iconCache.get(key)!
  }
  
  // Get import function
  const importFn = iconImportMap[key]
  if (!importFn) {
    return null
  }
  
  try {
    // Dynamically import the icon
    const module = await importFn()
    const icon = module.default
    
    // Cache it
    iconCache.set(key, icon)
    
    return icon
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error)
    return null
  }
}

/**
 * Gets the icon mapping for a given icon name (synchronous, deprecated)
 * @deprecated Use getIconAsync instead
 */
export function getIconMapping(iconName: string): IconMapping | null {
  // This is kept for backward compatibility but will return null
  // Components should use getIconAsync instead
  return null
}
