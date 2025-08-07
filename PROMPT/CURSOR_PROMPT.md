# Cursor AI Assistant Prompt

## Project Context

You are working on a Tokamak zkEVM Playground project - an Electron-based application with React frontend that provides tools for blockchain development and testing. The project includes hardware information collection, Docker container management, and various blockchain utilities.

## Core Instructions

### 1. Language and Communication

- **ALL code comments MUST be written in English only**
- Use clear, professional English for all documentation
- Korean comments are strictly prohibited in new code
- When updating existing code, convert Korean comments to English

### 2. Code Quality Standards

- Follow TypeScript best practices with strict typing
- Implement comprehensive error handling with try-catch blocks
- Use descriptive variable and function names in English
- Apply proper code organization and separation of concerns

### 3. Platform Compatibility

- Always consider cross-platform compatibility (Windows, macOS, Linux)
- Implement fallback mechanisms for platform-specific operations
- Test critical paths on multiple platforms
- Use appropriate error handling for OS-specific commands

### 4. Architecture Patterns

- Follow React functional component patterns with hooks
- Use proper Electron IPC communication patterns
- Implement proper state management
- Maintain clear separation between main and renderer processes

### 5. Error Handling Requirements

- Every async operation must have proper error handling
- Provide meaningful error messages in English
- Implement graceful degradation when possible
- Log errors with sufficient context for debugging

### 6. Security Considerations

- Validate all user inputs
- Use context isolation in Electron preload scripts
- Sanitize data before processing
- Never expose sensitive information in logs or error messages

## Specific Project Guidelines

### Hardware Information Collection

- Use platform-appropriate commands (systeminfo for Windows, sysctl for macOS, etc.)
- Implement multiple fallback mechanisms
- Handle command timeouts and failures gracefully
- Parse output data carefully with proper error checking

### Docker Integration

- Handle Docker daemon availability
- Implement proper container lifecycle management
- Stream command output when appropriate
- Handle large file transfers efficiently

### UI/UX Standards

- Maintain consistent design patterns
- Provide user feedback for long-running operations
- Handle loading states and errors in UI
- Use appropriate modal and notification patterns

## Code Review Checklist

When reviewing or generating code, ensure:

- [ ] All comments are in English
- [ ] Proper TypeScript typing is used
- [ ] Error handling is comprehensive
- [ ] Platform compatibility is considered
- [ ] Security best practices are followed
- [ ] Code is well-organized and readable
- [ ] Performance implications are considered

## Examples of Good Practices

### ✅ Good Comment Style

```typescript
// Collect system hardware information using platform-specific commands
// Fallback to generic methods if platform-specific collection fails
export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    // Platform detection and specific implementation
    if (platform === 'win32') {
      return await getWindowsSystemInfo();
    }
    // Fallback implementation
    return await getGenericSystemInfo();
  } catch (error) {
    console.error('Failed to collect system information:', error);
    throw new Error('System information collection failed');
  }
}
```

### ✅ Good Error Handling

```typescript
// Execute system command with proper timeout and error handling
const executeSystemCommand = async (command: string): Promise<string> => {
  try {
    const { stdout } = await execAsync(command, { timeout: 10000 });
    return stdout.trim();
  } catch (error) {
    console.warn(`Command execution failed: ${command}`, error);
    throw new Error(`Failed to execute system command: ${error.message}`);
  }
};
```

### ❌ Bad Practices to Avoid

```typescript
// ❌ Korean comments
// 시스템 정보를 가져오는 함수
function getSystemInfo() {}

// ❌ Missing error handling
const result = await riskyOperation();

// ❌ Vague variable names
const data = getData();
const info = processInfo(data);

// ❌ Using 'any' type unnecessarily
const processData = (input: any): any => {
  return input.someProperty;
};
```

## When Making Changes

1. Read and understand the existing code structure
2. Follow established patterns in the codebase
3. Update related documentation if necessary
4. Test changes across platforms when possible
5. Ensure all new code follows these guidelines

## Priority Order for Code Changes

1. **Security** - Ensure no security vulnerabilities
2. **Functionality** - Code must work correctly
3. **Error Handling** - Comprehensive error management
4. **Platform Compatibility** - Works across target platforms
5. **Code Quality** - Clean, readable, maintainable code
6. **Performance** - Optimize where necessary
7. **Documentation** - Clear English comments and docs

Remember: Quality, security, and maintainability are more important than speed of implementation. Take time to implement proper error handling and cross-platform compatibility.
