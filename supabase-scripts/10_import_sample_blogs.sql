-- ============================================
-- Import Sample Blog Posts
-- ============================================
-- Run this after setting up your database
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual user ID
-- ============================================

-- First, get your user ID (run this separately to find your ID):
-- SELECT id, email FROM public.users WHERE is_admin = true LIMIT 1;

-- Then replace 'YOUR_USER_ID' below with the UUID from above
-- Or use this query to automatically use the first admin user:
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the first admin user ID
  SELECT id INTO admin_user_id 
  FROM public.users 
  WHERE is_admin = true 
  LIMIT 1;
  
  -- If no admin found, use the first user
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id 
    FROM public.users 
    LIMIT 1;
  END IF;
  
  -- Insert blog posts
  INSERT INTO public.blogs (title, slug, excerpt, content, category, published, read_time, author_id, published_at)
  VALUES
  (
    'Getting Started with Vue 3 Composition API',
    'getting-started-vue3-composition-api',
    'Learn the fundamentals of Vue 3''s Composition API and how it can improve your development workflow.',
    'This is a comprehensive guide to Vue 3''s Composition API. The Composition API provides a more flexible way to organize component logic, especially for larger components.

## Introduction

Vue 3 introduced the Composition API as an alternative to the Options API. It allows you to organize code by feature rather than by option type, making it easier to share and reuse logic.

## Key Benefits

1. Better organization for complex components
2. Improved TypeScript support
3. Better code reuse through composables
4. More flexible code organization

## Getting Started

To use the Composition API, you''ll need to use the `setup` function in your components. This function runs before the component is created and serves as the entry point for composition.

```javascript
import { ref, computed } from ''vue''

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    
    return {
      count,
      doubled
    }
  }
}
```

## Conclusion

The Composition API is a powerful addition to Vue 3 that provides more flexibility and better organization for your components.',
    'Vue.js',
    true,
    5,
    admin_user_id,
    NOW()
  ),
  (
    'Building Scalable React Applications',
    'building-scalable-react-applications',
    'Best practices and patterns for creating maintainable and scalable React applications.',
    'Building scalable React applications requires careful planning and the right architectural decisions. In this article, we''ll explore key patterns and practices that will help you create applications that can grow with your needs.

## Component Architecture

A well-structured component hierarchy is essential for scalability. Consider using:

- Container/Presentational component pattern
- Custom hooks for reusable logic
- Context API for global state management

## State Management

For larger applications, consider using state management libraries like Redux or Zustand. However, React''s built-in state management is often sufficient for smaller to medium-sized applications.

## Performance Optimization

1. Use React.memo() for expensive components
2. Implement code splitting with React.lazy()
3. Optimize re-renders with useMemo() and useCallback()

## Testing

Comprehensive testing is crucial for maintaining scalable applications. Use tools like Jest and React Testing Library to ensure your components work as expected.',
    'React',
    true,
    8,
    admin_user_id,
    NOW()
  ),
  (
    'CSS Grid vs Flexbox: When to Use What',
    'css-grid-vs-flexbox-comparison',
    'A comprehensive comparison of CSS Grid and Flexbox to help you choose the right layout method.',
    'CSS Grid and Flexbox are both powerful layout tools, but they serve different purposes. Understanding when to use each can significantly improve your CSS workflow.

## Flexbox

Flexbox is designed for one-dimensional layouts - either in a row or a column. It''s perfect for:

- Navigation bars
- Centering content
- Distributing space within a container
- Aligning items

## CSS Grid

CSS Grid is designed for two-dimensional layouts - both rows and columns. It''s ideal for:

- Complex page layouts
- Card grids
- Dashboard layouts
- Any layout that needs both row and column control

## When to Use Each

- Use Flexbox for component-level layouts
- Use Grid for page-level layouts
- You can combine both - use Grid for the overall layout and Flexbox for individual components

## Conclusion

Both tools are essential in modern CSS. Choose Flexbox for simpler, one-dimensional layouts, and Grid for complex, two-dimensional layouts.',
    'CSS',
    true,
    6,
    admin_user_id,
    NOW()
  ),
  (
    'TypeScript Best Practices for Large Projects',
    'typescript-best-practices-large-projects',
    'Essential TypeScript patterns and practices for building maintainable large-scale applications.',
    'TypeScript brings type safety to JavaScript, making it an excellent choice for large-scale applications. Here are some best practices to follow.

## Type Definitions

Always define explicit types for function parameters and return values. Use interfaces for object shapes and types for unions and intersections.

```typescript
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User> {
  // implementation
}
```

## Project Structure

Organize your types in a dedicated folder structure:

```
src/
  types/
    user.ts
    api.ts
    common.ts
```

## Strict Mode

Enable strict mode in your tsconfig.json for better type checking:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## Utility Types

Leverage TypeScript''s utility types like `Partial`, `Pick`, and `Omit` to create flexible type definitions.

## Conclusion

Following these practices will help you build more maintainable and type-safe applications.',
    'TypeScript',
    true,
    10,
    admin_user_id,
    NOW()
  ),
  (
    'Modern JavaScript ES2024 Features',
    'modern-javascript-es2024-features',
    'Explore the latest JavaScript features and how they can improve your code quality and developer experience.',
    'JavaScript continues to evolve with new features that make development more enjoyable and code more expressive. Let''s explore some of the latest additions.

## Top-Level Await

You can now use `await` at the top level of modules:

```javascript
const data = await fetch(''/api/data'')
```

## Array Methods

New array methods like `findLast()` and `findLastIndex()` make it easier to work with arrays:

```javascript
const lastEven = [1, 2, 3, 4, 5].findLast(n => n % 2 === 0)
```

## Object.groupBy()

Group array elements by a key:

```javascript
const grouped = Object.groupBy(users, user => user.role)
```

## Promise.withResolvers()

Create promises with external resolve/reject:

```javascript
const { promise, resolve, reject } = Promise.withResolvers()
```

## Conclusion

These features make JavaScript more powerful and expressive. Stay updated with the latest ECMAScript proposals to take advantage of new capabilities.',
    'JavaScript',
    true,
    7,
    admin_user_id,
    NOW()
  ),
  (
    'Building PWAs with Vite and Vue',
    'building-pwas-vite-vue',
    'Step-by-step guide to creating Progressive Web Apps using Vite and Vue.js.',
    'Progressive Web Apps (PWAs) combine the best of web and mobile apps. With Vite and Vue, creating a PWA is straightforward.

## What is a PWA?

A PWA is a web application that:

- Works offline
- Can be installed on devices
- Provides a native app-like experience
- Uses service workers for caching

## Setting Up Vite PWA Plugin

Install the Vite PWA plugin:

```bash
npm install -D vite-plugin-pwa
```

Configure it in `vite.config.js`:

```javascript
import { VitePWA } from ''vite-plugin-pwa''

export default {
  plugins: [
    VitePWA({
      registerType: ''autoUpdate'',
      workbox: {
        globPatterns: [''**/*.{js,css,html,ico,png,svg}'']
      }
    })
  ]
}
```

## Manifest Configuration

Create a `manifest.json` for app metadata:

```json
{
  "name": "My PWA",
  "short_name": "PWA",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

## Service Workers

Vite PWA plugin automatically generates service workers for offline functionality.

## Conclusion

PWAs provide a great user experience and are easier to maintain than native apps. Vite makes the setup process simple and straightforward.',
    'PWA',
    true,
    12,
    admin_user_id,
    NOW()
  )
  ON CONFLICT (slug) DO NOTHING;
  
  RAISE NOTICE 'Sample blog posts imported successfully!';
END $$;

