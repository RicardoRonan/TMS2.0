import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.warn('Error highlighting code:', err)
      }
    }
    // Fallback: try to auto-detect language
    try {
      return hljs.highlightAuto(code).value
    } catch (err) {
      console.warn('Error auto-highlighting code:', err)
      return code
    }
  },
  breaks: true, // Convert line breaks to <br>
  gfm: true // GitHub Flavored Markdown
})

/**
 * Filters out metadata sections from markdown content
 * Removes sections like TEST_CASES, OPTIONS, CORRECT_ANSWER, etc.
 * @param markdown - The markdown content to filter
 * @returns Filtered markdown without metadata sections
 */
export function filterMetadataFromMarkdown(markdown: string): string {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const filteredLines: string[] = []
  let skipSection = false
  let inJsonBlock = false
  let braceCount = 0
  let bracketCount = 0

  // Headers that should be hidden (but keep INSTRUCTIONS as it's the question text)
  const metadataHeaders = [
    'TEST_CASES:',
    'OPTIONS:',
    'CORRECT_ANSWER:',
    'POINTS:',
    'TYPE:',
    'LANGUAGE:',
    'STARTER_CODE:',
    'HINTS:'
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    const upperLine = trimmedLine.toUpperCase()

    // Check if this line starts a metadata section
    let isMetadataHeader = false
    for (const header of metadataHeaders) {
      if (upperLine === header || upperLine.startsWith(header + ' ')) {
        isMetadataHeader = true
        skipSection = true
        inJsonBlock = false
        braceCount = 0
        bracketCount = 0
        break
      }
    }

    // Also check for "EXERCISE" followed by a number
    if (!isMetadataHeader && upperLine.match(/^EXERCISE\s+\d+:/)) {
      isMetadataHeader = true
      skipSection = true
      inJsonBlock = false
      braceCount = 0
      bracketCount = 0
    }

    if (isMetadataHeader) {
      // Skip this header line
      continue
    }

    // If we're in a section to skip, check if we've reached the end
    if (skipSection) {
      // Check if this is the start of a JSON array/object
      if (trimmedLine.startsWith('[')) {
        inJsonBlock = true
        bracketCount = 1
        braceCount = 0
      } else if (trimmedLine.startsWith('{')) {
        inJsonBlock = true
        braceCount = 1
        bracketCount = 0
      } else if (inJsonBlock) {
        // Count braces and brackets to detect end of JSON block
        const openBraces = (trimmedLine.match(/\{/g) || []).length
        const closeBraces = (trimmedLine.match(/\}/g) || []).length
        const openBrackets = (trimmedLine.match(/\[/g) || []).length
        const closeBrackets = (trimmedLine.match(/\]/g) || []).length

        braceCount += openBraces - closeBraces
        bracketCount += openBrackets - closeBrackets

        // If all braces/brackets are closed, we've reached the end
        if (braceCount <= 0 && bracketCount <= 0 && (trimmedLine.endsWith(']') || trimmedLine.endsWith('}'))) {
          inJsonBlock = false
          skipSection = false
          braceCount = 0
          bracketCount = 0
        }
      } else {
        // Check if we've hit a new section header (including INSTRUCTIONS)
        const nextMetadataHeader = metadataHeaders.some(header =>
          upperLine === header || upperLine.startsWith(header + ' ')
        )
        const isNewExercise = upperLine.match(/^EXERCISE\s+\d+:/)
        const isInstructions = upperLine.startsWith('INSTRUCTIONS:')

        if (nextMetadataHeader || isNewExercise || isInstructions) {
          // New section starting, current metadata section ends
          skipSection = false
          // Process this line in the next iteration (don't continue here)
          // We'll handle it in the next loop iteration
        } else if (trimmedLine === '' && !inJsonBlock) {
          // Empty line - check if next non-empty line is a new section
          let foundNextSection = false
          for (let j = i + 1; j < lines.length; j++) {
            const nextTrimmed = lines[j].trim()
            if (nextTrimmed === '') continue // Skip empty lines

            const nextUpper = nextTrimmed.toUpperCase()
            const isNextMetadata = metadataHeaders.some(header =>
              nextUpper === header || nextUpper.startsWith(header + ' ')
            ) || nextUpper.match(/^EXERCISE\s+\d+:/) || nextUpper.startsWith('INSTRUCTIONS:')

            if (isNextMetadata) {
              foundNextSection = true
            }
            break
          }

          if (!foundNextSection) {
            // No more metadata sections, end skipping
            skipSection = false
          }
        }
      }

      // Skip lines in metadata sections
      if (skipSection) {
        continue
      }
    }

    // Keep this line
    filteredLines.push(line)
  }

  return filteredLines.join('\n')
}

/**
 * Renders markdown content to safe HTML
 * @param markdown - The markdown string to render
 * @param filterMetadata - Whether to filter out metadata sections (default: true)
 * @returns Sanitized HTML string
 */
export function renderMarkdown(markdown: string, filterMetadata: boolean = true): string {
  if (!markdown) return ''

  // Filter out metadata sections before rendering
  const filteredMarkdown = filterMetadata ? filterMetadataFromMarkdown(markdown) : markdown

  // Parse markdown to HTML
  const html = marked.parse(filteredMarkdown)

  // Sanitize HTML to prevent XSS attacks
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id',
      'target', 'rel', 'width', 'height'
    ],
    ALLOW_DATA_ATTR: false
  })

  return sanitized
}

/**
 * Parses Q&A questions from markdown content
 * Extracts questions formatted with INSTRUCTIONS, OPTIONS, CORRECT_ANSWER, etc.
 * @param markdown - The markdown content containing Q&A question definitions
 * @returns Array of parsed question objects
 */
export function parseQAQuestionsFromMarkdown(markdown: string): any[] {
  if (!markdown) return []

  const questions: any[] = []
  const lines = markdown.split('\n')

  let currentQuestion: any = null
  let currentSection = ''
  let currentContent: string[] = []

  const saveCurrentSection = () => {
    if (!currentQuestion) return

    if (currentSection === 'instructions' && currentContent.length > 0) {
      currentQuestion.question_text = currentContent.join('\n').trim()
    } else if (currentSection === 'options' && currentContent.length > 0) {
      const optionsText = currentContent.join('\n').trim()
      try {
        currentQuestion.options = JSON.parse(optionsText)
      } catch (e) {
        console.warn('Failed to parse options JSON:', e)
      }
    } else if (currentSection === 'hints' && currentContent.length > 0) {
      // Store hints if needed
      currentQuestion.hints = currentContent.join('\n').trim()
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    const upperLine = trimmedLine.toUpperCase()

    // Check for section headers
    if (upperLine.startsWith('INSTRUCTIONS:')) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question_text) {
        saveCurrentSection()
        questions.push(currentQuestion)
      }

      // Start new question
      currentQuestion = {
        question_type: 'multiple_choice',
        options: [],
        correct_answer: '',
        correct_answers: [],
        points: 5,
        order_index: questions.length,
        explanation: ''
      }
      currentSection = 'instructions'
      currentContent = []

      // Extract question text (everything after "INSTRUCTIONS:")
      const questionText = trimmedLine.substring('INSTRUCTIONS:'.length).trim()
      if (questionText) {
        currentContent.push(questionText)
      }
    } else if (upperLine.startsWith('OPTIONS:')) {
      // Save previous section
      saveCurrentSection()
      currentSection = 'options'
      currentContent = []
    } else if (upperLine.startsWith('CORRECT_ANSWER:')) {
      // Save previous section
      saveCurrentSection()
      currentSection = 'correct_answer'
      const answerLine = trimmedLine.substring('CORRECT_ANSWER:'.length).trim()
      if (answerLine && currentQuestion) {
        currentQuestion.correct_answer = answerLine
        currentQuestion.correct_answers = [answerLine]
      }
      currentContent = []
    } else if (upperLine.startsWith('POINTS:')) {
      saveCurrentSection()
      if (currentQuestion) {
        const pointsText = trimmedLine.substring('POINTS:'.length).trim()
        const points = parseInt(pointsText, 10)
        if (!isNaN(points)) {
          currentQuestion.points = points
        }
      }
      currentSection = ''
      currentContent = []
    } else if (upperLine.startsWith('HINTS:')) {
      saveCurrentSection()
      currentSection = 'hints'
      currentContent = []
    } else if (upperLine.startsWith('TEST_CASES:')) {
      saveCurrentSection()
      currentSection = ''
      currentContent = []
    } else if (upperLine.startsWith('EXERCISE')) {
      // New exercise section, save current question
      if (currentQuestion && currentQuestion.question_text) {
        saveCurrentSection()
        questions.push(currentQuestion)
        currentQuestion = null
      }
      currentSection = ''
      currentContent = []
    } else if (trimmedLine && currentSection) {
      // Accumulate content for current section
      currentContent.push(line)
    } else if (!trimmedLine && currentSection === 'instructions' && currentContent.length > 0) {
      // Allow empty lines within instructions
      currentContent.push('')
    }
  }

  // Save final sections and question
  if (currentQuestion) {
    saveCurrentSection()
    if (currentQuestion.question_text) {
      questions.push(currentQuestion)
    }
  }

  return questions
}

