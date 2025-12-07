# Example Tutorial Output - Copy-Paste Format

This is an example of how the AI agent should output tutorials for direct copy-paste into the Admin modal.

---

=== TUTORIAL COURSE: JavaScript Fundamentals ===

CATEGORY:
TITLE: JavaScript Fundamentals
SLUG: javascript-fundamentals
DESCRIPTION: Learn the fundamentals of JavaScript programming from scratch
LEVEL: Beginner
DURATION: 120

---

=== PAGE 1 ===
TITLE: Introduction to JavaScript
SLUG: introduction-to-javascript
PAGE_TYPE: content
ORDER: 0
PUBLISHED: true

CONTENT:
# Introduction to JavaScript

JavaScript is a versatile programming language that powers the interactive elements of websites. In this tutorial, you'll learn the fundamentals of JavaScript and how to use it to create dynamic web applications.

## What is JavaScript?

JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications.

## Why Learn JavaScript?

- **Universal Language**: Works in browsers, servers, and mobile apps
- **Easy to Start**: Simple syntax, great for beginners
- **Powerful**: Can build complex applications
- **In-Demand**: One of the most popular programming languages

## Setting Up Your Environment

To write JavaScript, you only need:
1. A text editor (VS Code, Sublime Text, etc.)
2. A web browser (Chrome, Firefox, Safari)
3. A basic HTML file

## Your First JavaScript Code

Let's write your first JavaScript program:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This simple line of code will output "Hello, World!" to the browser console.

## Summary

In this chapter, you learned:
- What JavaScript is and why it's important
- How to set up your development environment
- How to write your first JavaScript program

In the next chapter, we'll explore variables and data types.

---

=== PAGE 2 ===
TITLE: Variables and Data Types
SLUG: variables-and-data-types
PAGE_TYPE: content
ORDER: 1
PUBLISHED: true

CONTENT:
# Variables and Data Types

Variables are containers for storing data values. In JavaScript, you can declare variables using `let`, `const`, or `var`.

## Declaring Variables

### Using `let`

\`\`\`javascript
let name = "John";
let age = 25;
\`\`\`

### Using `const`

\`\`\`javascript
const PI = 3.14159;
const MAX_SIZE = 100;
\`\`\`

### Using `var`

\`\`\`javascript
var city = "New York";
\`\`\`

## Data Types

JavaScript has several data types:

- **String**: Text data
- **Number**: Numeric data
- **Boolean**: true or false
- **Object**: Collections of data
- **Array**: Lists of data
- **Undefined**: Variable declared but not assigned
- **Null**: Empty value

## Examples

\`\`\`javascript
// String
let greeting = "Hello, World!";

// Number
let count = 42;

// Boolean
let isActive = true;

// Array
let fruits = ["apple", "banana", "orange"];

// Object
let person = {
  name: "John",
  age: 30
};
\`\`\`

## Summary

Variables allow you to store and manipulate data. Understanding data types is crucial for writing effective JavaScript code.

---

EXERCISES:

EXERCISE 1:
TYPE: code_editor
LANGUAGE: javascript
STARTER_CODE:
// Declare three variables below
// 1. A variable named 'name' with your name
// 2. A variable named 'age' with your age
// 3. A variable named 'city' with your city

INSTRUCTIONS:
## Exercise: Declare Variables

Declare three variables:
1. A variable named `name` containing your name (string)
2. A variable named `age` containing your age (number)
3. A variable named `city` containing your city (string)

Use `let` for all three variables.

TEST_CASES:
[
  {
    "input": null,
    "expected_output": null,
    "description": "Code should declare three variables without errors"
  }
]

HINTS:
- Use the `let` keyword to declare variables
- Assign string values in quotes: "your name"
- Assign number values without quotes: 25
- Each variable should be on its own line

POINTS: 10

---

=== PAGE 3 ===
TITLE: Q&A: Variables and Data Types
SLUG: qa-variables-and-data-types
PAGE_TYPE: qa
ORDER: 2
PUBLISHED: true

CONTENT:
# Q&A Exercise: Variables and Data Types

Test your understanding of variables and data types in JavaScript. Answer the following questions to reinforce what you've learned.

---

Q&A QUESTIONS:

QUESTION 1:
TYPE: multiple_choice
QUESTION_TEXT: Which keyword is used to declare a constant in JavaScript?
OPTIONS:
[
  {"value": "A", "label": "let"},
  {"value": "B", "label": "const"},
  {"value": "C", "label": "var"},
  {"value": "D", "label": "constant"}
]
CORRECT_ANSWERS: ["B"]
EXPLANATION: The `const` keyword is used to declare constants in JavaScript. Variables declared with `const` cannot be reassigned after initialization, making them perfect for values that should remain constant throughout your program.
POINTS: 5
ORDER: 0

QUESTION 2:
TYPE: multiple_choice
QUESTION_TEXT: What is the data type of the value `42` in JavaScript?
OPTIONS:
[
  {"value": "A", "label": "String"},
  {"value": "B", "label": "Number"},
  {"value": "C", "label": "Boolean"},
  {"value": "D", "label": "Object"}
]
CORRECT_ANSWERS: ["B"]
EXPLANATION: The value `42` is a Number in JavaScript. Numbers can be integers or floating-point numbers. Unlike some languages, JavaScript doesn't distinguish between different number types.
POINTS: 5
ORDER: 1

QUESTION 3:
TYPE: text_input
QUESTION_TEXT: What keyword is used to declare a variable that can be reassigned?
CORRECT_ANSWER: let
EXPLANATION: The `let` keyword is used to declare variables that can be reassigned. This is the modern way to declare variables in JavaScript, introduced in ES6.
POINTS: 5
ORDER: 2

QUESTION 4:
TYPE: code
QUESTION_TEXT: Write a line of code that declares a constant named `MAX_USERS` with the value 100.
LANGUAGE: javascript
CORRECT_ANSWER: const MAX_USERS = 100;
EXPLANATION: The correct syntax is `const MAX_USERS = 100;`. This declares a constant that cannot be reassigned. Constants are typically written in UPPER_CASE to distinguish them from regular variables.
POINTS: 10
ORDER: 3

---

=== PAGE 5 ===
TITLE: Mini Project: Personal Information Card
SLUG: mini-project-personal-info-card
PAGE_TYPE: mini_project
ORDER: 4
PUBLISHED: true

CONTENT:
# Mini Project: Personal Information Card

## Overview

In this mini project, you'll create a JavaScript program that displays a personal information card. This project will help you practice using variables, data types, and string concatenation.

## Learning Objectives

- Practice declaring and using variables
- Work with different data types
- Combine strings to create formatted output
- Use template literals for string formatting

---

PROJECT CONFIG:

LANGUAGE: javascript
STARTER_CODE:
// Personal Information Card Project
// Complete the function below to return a formatted information card

function createInfoCard() {
  // Declare your variables here
  // name, age, city, email
  
  // Return a formatted string with all information
  // Format: "Name: [name], Age: [age], City: [city], Email: [email]"
}

REQUIREMENTS:
- Declare four variables: name (string), age (number), city (string), and email (string)
- Use template literals or string concatenation to format the output
- Return a string in the format: "Name: [name], Age: [age], City: [city], Email: [email]"
- The function should return the formatted string

TEST_CASES:
[
  {
    "input": null,
    "expected_output": "Name: John Doe, Age: 30, City: New York, Email: john@example.com",
    "description": "Function should return correctly formatted information card"
  }
]

HINTS:
- Hint 1: Use `const` or `let` to declare your variables
- Hint 2: Template literals use backticks and ${variable} syntax
- Hint 3: Make sure to return the formatted string, not just log it

POINTS: 50

---

=== PAGE 15 ===
TITLE: Capstone Project: Interactive Todo Application
SLUG: capstone-interactive-todo-app
PAGE_TYPE: capstone
ORDER: 14
PUBLISHED: true

CONTENT:
# Capstone Project: Interactive Todo Application

## Project Overview

Congratulations on reaching the capstone project! You'll now build a complete interactive Todo application that integrates all the concepts you've learned throughout this course.

## Project Goals

- Create a fully functional todo application
- Implement add, remove, and toggle functionality
- Use arrays and objects to manage todo items
- Apply event handling and DOM manipulation
- Create a user-friendly interface

## Features to Implement

1. Add new todo items
2. Mark todos as complete/incomplete
3. Delete todo items
4. Display all todos in a list
5. Show a count of remaining todos

---

PROJECT CONFIG:

LANGUAGE: javascript
STARTER_CODE:
// Todo Application
class TodoApp {
  constructor() {
    this.todos = [];
  }
  
  // Add your methods here
  // addTodo(text)
  // removeTodo(id)
  // toggleTodo(id)
  // getTodos()
  // getRemainingCount()
}

REQUIREMENTS:
- Implement the `addTodo(text)` method to add a new todo with a unique ID
- Implement the `removeTodo(id)` method to remove a todo by ID
- Implement the `toggleTodo(id)` method to mark a todo as complete/incomplete
- Implement the `getTodos()` method to return all todos
- Implement the `getRemainingCount()` method to return the count of incomplete todos
- Each todo should have: id (number), text (string), completed (boolean)
- Use an array to store all todos

TEST_CASES:
[
  {
    "input": { method: "addTodo", params: ["Buy groceries"] },
    "expected_output": { id: 1, text: "Buy groceries", completed: false },
    "description": "Should add a new todo item"
  },
  {
    "input": { method: "toggleTodo", params: [1] },
    "expected_output": { id: 1, text: "Buy groceries", completed: true },
    "description": "Should toggle todo completion status"
  },
  {
    "input": { method: "getRemainingCount", params: [] },
    "expected_output": 0,
    "description": "Should return count of incomplete todos"
  }
]

HINTS:
- Hint 1: Use an array to store todo objects
- Hint 2: Generate unique IDs using the array length or a counter
- Hint 3: Use `find()` or `filter()` to locate todos by ID
- Hint 4: Use `map()` to update todo properties
- Hint 5: Count incomplete todos using `filter()` and `length`

POINTS: 100

---

