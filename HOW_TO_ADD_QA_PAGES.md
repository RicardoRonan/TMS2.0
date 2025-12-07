# How to Add Q&A Exercises Between Tutorial Pages

## Step-by-Step Guide

### Step 1: Create Q&A Pages in Admin Panel

1. Go to **Admin Panel** → **Tutorials** tab
2. Click **"+ New Page"** button
3. Fill in the form:
   - **Category**: Select your tutorial category
   - **Title**: `Q&A: [Topic Name]` (e.g., "Q&A: Variables and Data Types")
   - **Slug**: `qa-topic-name` (e.g., "qa-variables-and-data-types")
   - **Content**: Brief introduction (optional, but recommended)
   - **Page Type**: Select **"Q&A Exercise"** from dropdown
   - **Order**: Set the order number (e.g., if you want it after page 2, set to `2`)
   - **Published**: Check if ready to publish
4. Click **"Create"**

### Step 2: Set Correct Page Order

**Important**: The `page_order` field determines where pages appear in the list.

**Example Structure:**
- Page 0: Content page (Introduction)
- Page 1: Content page (Variables)
- **Page 2: Q&A page** ← Insert here
- Page 3: Content page (Functions)
- Page 4: Content page (Arrays)
- **Page 5: Q&A page** ← Insert here
- Page 6: Mini Project

**To reorder existing pages:**
1. Edit each page in Admin panel
2. Update the **Order** field
3. Save changes

### Step 3: Add Q&A Questions to the Page

After creating the Q&A page:

1. In the **Tutorials** list, find your Q&A page
2. Click the **"Q&A"** button next to the page
3. Fill in the Q&A Question form:

#### For Multiple Choice Questions:
- **Question Type**: Select "Multiple Choice"
- **Question Text**: Enter your question (Markdown supported)
- **Options (JSON)**: 
  ```json
  [
    {"value": "A", "label": "Option A description"},
    {"value": "B", "label": "Option B description"},
    {"value": "C", "label": "Option C description"},
    {"value": "D", "label": "Option D description"}
  ]
  ```
- **Correct Answer(s)**: `["A"]` (JSON array format)
- **Explanation**: Why this answer is correct
- **Points**: 5 (default)
- **Order Index**: 0, 1, 2, etc. (order of questions)

#### For Text Input Questions:
- **Question Type**: Select "Text Input"
- **Question Text**: Enter your question
- **Correct Answer**: The expected answer (case-insensitive matching)
- **Explanation**: Explanation of the answer
- **Points**: 5
- **Order Index**: Sequential number

#### For Code Questions:
- **Question Type**: Select "Code"
- **Question Text**: Enter your coding question
- **Language**: Select language (javascript, typescript, python)
- **Correct Answer**: The expected code solution
- **Explanation**: Explanation of the solution
- **Points**: 10
- **Order Index**: Sequential number

4. Click **"Create"** to add the question
5. Repeat for each question (5-10 questions recommended per Q&A page)

### Step 4: Verify Pages Appear Correctly

1. Go to **Tutorials** page
2. Click on your tutorial category
3. You should see all pages listed in order, including Q&A pages with badges
4. Click on a Q&A page to view it
5. The Q&A questions should appear and be interactive

## Quick Example

**Creating a Q&A page after page 2:**

1. **Create Page:**
   - Title: `Q&A: Variables and Data Types`
   - Slug: `qa-variables-and-data-types`
   - Page Type: `Q&A Exercise`
   - Order: `2`
   - Content: `# Q&A Exercise: Variables and Data Types\n\nTest your understanding...`

2. **Add Questions:**
   - Question 1: Multiple choice about `const` keyword
   - Question 2: Text input asking for variable declaration keyword
   - Question 3: Code question to write a variable declaration
   - etc.

3. **Update Next Pages:**
   - If you had pages with order 2, 3, 4... they now need to be 3, 4, 5...
   - Edit each subsequent page and increment the Order field

## Troubleshooting

### Q&A page doesn't appear in the list
- Check that `page_type` is set to `'qa'` in the database
- Verify the page is published (`published: true`)
- Check the `page_order` is correct

### Q&A questions don't show
- Make sure you've added questions using the "Q&A" button
- Check that questions are in the `tutorial_qa_questions` table
- Verify `tutorial_page_id` matches the Q&A page ID

### Pages are in wrong order
- Edit each page and update the `page_order` field
- Lower numbers appear first
- Q&A pages should have order numbers between content pages

## Database Direct Method (Alternative)

If you prefer to add directly to the database:

```sql
-- 1. Create Q&A page
INSERT INTO tutorial_pages (
  category_id,
  title,
  slug,
  content,
  page_type,
  page_order,
  published
) VALUES (
  'your-category-id',
  'Q&A: Variables and Data Types',
  'qa-variables-and-data-types',
  '# Q&A Exercise\n\nTest your understanding...',
  'qa',
  2,
  true
);

-- 2. Add Q&A questions
INSERT INTO tutorial_qa_questions (
  tutorial_page_id,
  question_type,
  question_text,
  options,
  correct_answers,
  explanation,
  points,
  order_index
) VALUES (
  'page-id-from-above',
  'multiple_choice',
  'What is the purpose of the const keyword?',
  '[{"value": "A", "label": "Declare constants"}, {"value": "B", "label": "Declare variables"}]',
  '["A"]',
  'The const keyword is used to declare constants...',
  5,
  0
);
```

## Best Practices

1. **Placement**: Insert Q&A pages every 2-3 content pages
2. **Question Count**: 5-10 questions per Q&A page
3. **Question Types**: Mix multiple choice, text input, and code questions
4. **Difficulty**: Match the difficulty of recent content pages
5. **Explanations**: Always provide clear explanations for answers

