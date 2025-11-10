/**
 * Icon mapping utility for FontAwesome Icons
 * Maps common icon names to FontAwesome icon names
 */

import { 
  faHome, 
  faBars, 
  faXmark, 
  faChevronDown, 
  faChevronUp, 
  faChevronLeft, 
  faChevronRight,
  faMagnifyingGlass,
  faArrowUpRightFromSquare,
  faHeart,
  faStar,
  faBookmark,
  faShare,
  faDownload,
  faUpload,
  faPen,
  faTrash,
  faCopy,
  faGear,
  faFilter,
  faUser,
  faUserCircle,
  faRightToBracket,
  faRightFromBracket,
  faIdCard,
  faFile,
  faFileLines,
  faNewspaper,
  faFolder,
  faComments,
  faEnvelope,
  faBell,
  faToolbox,
  faWrench,
  faCode,
  faGraduationCap,
  faCheck,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faMinus,
  faCircleInfo,
  faTriangleExclamation,
  faCheckCircle,
  faImage,
  faVideo,
  faMusic,
  faCalendar,
  faClock,
  faTag,
  faLink,
  faPhone,
  faLocationDot,
  faSun,
  faMoon,
  faMaximize,
  faBold,
  faItalic,
  faStrikethrough,
  faList,
  faListOl,
  faSquareCheck,
  faQuoteLeft,
  faTable,
  faEye
} from '@fortawesome/free-solid-svg-icons'

import {
  faTwitter,
  faGithub,
  faLinkedin,
  faFacebook,
  faPinterest
} from '@fortawesome/free-brands-svg-icons'

import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface IconMapping {
  icon: IconDefinition
}

/**
 * Maps common icon names to FontAwesome icon definitions
 */
export const iconMap: Record<string, IconMapping> = {
  // Navigation
  'home': { icon: faHome },
  'menu': { icon: faBars },
  'close': { icon: faXmark },
  'chevron-down': { icon: faChevronDown },
  'chevron-up': { icon: faChevronUp },
  'chevron-left': { icon: faChevronLeft },
  'chevron-right': { icon: faChevronRight },
  
  // Actions
  'search': { icon: faMagnifyingGlass },
  'external-link': { icon: faArrowUpRightFromSquare },
  'heart': { icon: faHeart },
  'favorite': { icon: faStar },
  'bookmark': { icon: faBookmark },
  'share': { icon: faShare },
  'download': { icon: faDownload },
  'upload': { icon: faUpload },
  'edit': { icon: faPen },
  'delete': { icon: faTrash },
  'copy': { icon: faCopy },
  'settings': { icon: faGear },
  'cogicon': { icon: faGear },
  'cog': { icon: faGear },
  'filter': { icon: faFilter },
  
  // User
  'user': { icon: faUser },
  'user-circle': { icon: faUserCircle },
  'login': { icon: faRightToBracket },
  'logout': { icon: faRightFromBracket },
  'profile': { icon: faIdCard },
  
  // Content
  'document': { icon: faFile },
  'documenttexticon': { icon: faFileLines },
  'article': { icon: faFileLines },
  'blog': { icon: faNewspaper },
  'folder': { icon: faFolder },
  'foldericon': { icon: faFolder },
  'file': { icon: faFile },
  
  // Communication
  'chat': { icon: faComments },
  'chatbubbleleftrighticon': { icon: faComments },
  'message': { icon: faComments },
  'mail': { icon: faEnvelope },
  'notification': { icon: faBell },
  
  // Tools & Development
  'tool': { icon: faToolbox },
  'wrench': { icon: faWrench },
  'wrenchscrewdrivericon': { icon: faWrench },
  'code': { icon: faCode },
  'tutorial': { icon: faGraduationCap },
  'academic': { icon: faGraduationCap },
  'academiccapicon': { icon: faGraduationCap },
  
  // UI Elements
  'check': { icon: faCheck },
  'close-x': { icon: faXmark },
  'arrow-right': { icon: faArrowRight },
  'arrow-left': { icon: faArrowLeft },
  'plus': { icon: faPlus },
  'minus': { icon: faMinus },
  'info': { icon: faCircleInfo },
  'warning': { icon: faTriangleExclamation },
  'error': { icon: faTriangleExclamation },
  'success': { icon: faCheckCircle },
  
  // Social
  'twitter': { icon: faTwitter },
  'facebook': { icon: faFacebook },
  'github': { icon: faGithub },
  'pinterest': { icon: faPinterest },
  'linkedin': { icon: faLinkedin },
  
  // Media
  'image': { icon: faImage },
  'video': { icon: faVideo },
  'music': { icon: faMusic },
  
  // Other
  'calendar': { icon: faCalendar },
  'clock': { icon: faClock },
  'star': { icon: faStar },
  'tag': { icon: faTag },
  'link': { icon: faLink },
  'phone': { icon: faPhone },
  'location': { icon: faLocationDot },
  'sun': { icon: faSun },
  'moon': { icon: faMoon },
  'expand': { icon: faMaximize },
  
  // Markdown Editor Icons
  'bold': { icon: faBold },
  'italic': { icon: faItalic },
  'strikethrough': { icon: faStrikethrough },
  'list': { icon: faList },
  'list-ordered': { icon: faListOl },
  'checkbox': { icon: faSquareCheck },
  'quote': { icon: faQuoteLeft },
  'table': { icon: faTable },
  'eye': { icon: faEye },
  'code-block': { icon: faCode },
}

/**
 * Gets the icon mapping for a given icon name
 */
export function getIconMapping(iconName: string): IconMapping | null {
  return iconMap[iconName.toLowerCase()] || null
}
