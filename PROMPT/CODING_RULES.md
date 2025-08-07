# Coding Rules and Guidelines

## General Rules

### 1. Comments and Documentation

- **ALL comments must be written in English**
- Use clear, concise English for all code comments
- Document complex logic and business rules
- Use JSDoc format for function documentation

```typescript
// ❌ BAD - Korean comments
// 사용자 인증을 처리하는 함수
function authenticateUser() {}

// ✅ GOOD - English comments
// Handle user authentication and return auth token
function authenticateUser() {}
```

### 2. Variable and Function Naming

- Use descriptive English names for variables, functions, and classes
- Follow camelCase convention for JavaScript/TypeScript
- Use PascalCase for React components and class names

```typescript
// ❌ BAD
const userData = getUserData();
const btn = document.getElementById('submit');

// ✅ GOOD
const currentUserData = getUserData();
const submitButton = document.getElementById('submit');
```

### 3. Error Handling

- Always include proper error handling with try-catch blocks
- Log errors with descriptive English messages
- Provide fallback mechanisms where appropriate

```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Failed to execute risky operation:', error);
  // Provide fallback or rethrow with context
  throw new Error('Operation failed with specific context');
}
```

### 4. Type Safety

- Use TypeScript types extensively
- Define interfaces for complex objects
- Avoid `any` type unless absolutely necessary

```typescript
// ✅ GOOD - Proper typing
interface UserData {
  id: string;
  name: string;
  email: string;
}

const processUserData = (user: UserData): string => {
  return `Processing user ${user.name}`;
};
```

### 5. Code Organization

- Group related functionality together
- Use clear folder structure
- Separate concerns (UI, business logic, utilities)
- Keep functions small and focused (single responsibility)

### 6. Performance Considerations

- Avoid unnecessary re-renders in React components
- Use appropriate data structures
- Implement proper caching where needed
- Consider async/await for I/O operations

### 7. Security

- Validate all user inputs
- Sanitize data before processing
- Use secure authentication methods
- Avoid exposing sensitive information in logs

### 8. Platform-Specific Code

- Always provide fallback mechanisms for platform-specific operations
- Test cross-platform compatibility
- Use proper error handling for OS-specific commands

```typescript
// ✅ GOOD - Platform-aware code with fallbacks
if (platform === "win32") {
  try {
    // Windows-specific implementation
    const result = await execAsync('systeminfo /fo csv');
    return parseWindowsSystemInfo(result);
  } catch (error) {
    console.warn('Failed to get Windows system info:', error);
    // Fallback to generic method
    return getGenericSystemInfo();
  }
}
```

### 9. Logging and Debugging

- Use appropriate log levels (error, warn, info, debug)
- Include context in log messages
- Remove debug logs before production deployment

```typescript
// ✅ GOOD - Informative logging
console.log('Starting system info collection for platform:', platform);
console.warn('Failed to get detailed system info, using fallback method');
console.error('Critical error in authentication:', error.message);
```

### 10. Testing

- Write unit tests for critical functions
- Test error scenarios and edge cases
- Ensure cross-platform compatibility in tests

## React-Specific Rules

### 1. Component Structure

- Use functional components with hooks
- Keep components small and focused
- Extract custom hooks for reusable logic

### 2. State Management

- Use appropriate state management (useState, useContext, external libraries)
- Minimize state dependencies
- Use proper dependency arrays in useEffect

### 3. Props and Types

- Define proper TypeScript interfaces for props
- Use default props where appropriate
- Validate props in development

## Electron-Specific Rules

### 1. IPC Communication

- Always handle IPC errors gracefully
- Use proper typing for IPC channels
- Implement timeouts for long-running operations

### 2. Security

- Use context isolation in preload scripts
- Validate all data from renderer processes
- Implement proper CSP (Content Security Policy)

### 3. Platform Integration

- Handle platform differences properly
- Provide appropriate fallbacks
- Test on all target platforms

## File and Folder Naming

- Use kebab-case for file names: `user-authentication.ts`
- Use PascalCase for React components: `UserProfile.tsx`
- Use camelCase for utility functions and hooks: `useUserData.ts`

## Commit Messages

- Use conventional commit format
- Write commit messages in English
- Be descriptive about changes made

Examples:

```
feat: add Windows system info collection using systeminfo command
fix: resolve IPC handler registration issue on Windows
docs: update coding guidelines with English comment requirements
refactor: improve error handling in hardware info collection
```

## Code Review Guidelines

- Check for English comments and documentation
- Verify error handling is implemented
- Ensure TypeScript types are properly defined
- Test cross-platform functionality
- Validate security considerations
