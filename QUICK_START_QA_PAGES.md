# Quick Start: Adding Q&A Pages Between Tutorial Pages

## The Simple Way (Admin Panel)

### 1. Create the Q&A Page

1. Go to **Admin Panel** → **Tutorials**
2. Click **"+ New Page"**
3. Fill in:
   - **Category**: Your tutorial category
   - **Title**: `Q&A: [Topic]` (e.g., "Q&A: Variables")
   - **Slug**: `qa-topic-name`
   - **Content**: Brief intro (optional)
   - **Page Type**: **Q&A Exercise** ⬅️ Important!
   - **Order**: `2` (or wherever you want it)
   - **Published**: ✓
4. Click **Create**

### 2. Add Questions

1. Find your Q&A page in the list
2. Click **"Q&A"** button
3. Fill in question form and click **Create**
4. Repeat for 5-10 questions

### 3. Reorder Pages (if needed)

If you inserted a Q&A page, you may need to update the order of subsequent pages:

- Edit each page after the Q&A page
- Increment the **Order** number by 1
- Save

## Example: Adding Q&A After Page 2

**Before:**
- Page 0: Introduction
- Page 1: Variables
- Page 2: Functions ← Next page

**After adding Q&A:**
- Page 0: Introduction
- Page 1: Variables
- **Page 2: Q&A: Variables** ← New Q&A page
- Page 3: Functions ← Updated from 2 to 3

## What Happens on the Website

1. Users see all pages in order in the tutorial list
2. Q&A pages show a **"Q&A"** badge
3. Clicking a Q&A page shows:
   - The page content (if you added any)
   - All Q&A questions
   - Interactive answer submission
   - Explanations after answering

## Tips

- **Placement**: Every 2-3 content pages
- **Questions**: 5-10 per Q&A page
- **Mix types**: Multiple choice, text input, and code questions
- **Order matters**: Use sequential numbers (0, 1, 2, 3...)

That's it! Your Q&A pages will automatically appear between tutorial pages based on their `page_order` value.

