

## Things to look for when doing Code Reviews for React


* move inline functions above the render/jsx code
    * reduces recreations of the function on re-renders - can be easier to export and test - can be easier to debug because stacktrace will have function name and not anonymous function

* instead of caching renders, fix issues with better structure and composition
* When state changes, like a useSTate is called by a button, the entire component re-renders again to decide the DOM DIFF
* Components re-render when their props change
* Components ALSO re-render when their parent re-renders.....because the child needs to be used to calculate the DOM DIFF
* This is the more common pitfall – you change the state of a parent and some slow child component is re-rendered everytime the user is interacting with the page and changing state
* What to look for -- you see a useState or useState change function that's called in a onClick -- understand those child JSX WILL BE RE-RENDERED EVERYTIME
* Better way to avoid child re-renders is to make sure that its not a child to the state changing parent but instead is a sibling
* Encapsulate that useState into its own small component – so you isolate the state changes and the re-renders....and now that child is a sibling and doesn't have a parent it has to listen to....
* Another way to avoid re-renders of children is the have a parent element which has changing state to wrap children and its props are the children elements themselves....
* This will only work assuming that those 'children' do not have props that depend on the parent and therefore those children will not re-render because when the parent state changed the child is exactly the same (Object.is())
* Place state as low in the tree as you can
* Pass components as children props - assuming the children isnt coupled to the parent
* Be careful with custom hooks – if they are still changing state useModalDialog -- you still have to encapsulate the user of that hook too
* Can I restructure my components to islate the effects of state changes?
* Careful to use global objects like window. For routing make sure you are using the location on react-router and not global
* move static data and resuable pure functions outside of the component - can be easier to read but especially it means during re-renders its ignored
* key props in mapped components



# Node/JS - dependency management - vulnerability fixing
- Package.json - be cautious of a mix of 'resolutions' and 'overrides'
- Resolutions
  - Yarn only?
  - Allows you to define specific version across entire tree -- so you can force transitive dependencies to use safe versions
- Overrides
  - Same thing but for yarn
  - make a 'overrides-notes json block with comment
- Takeaways
  - Pick a tool - only use resolutions or overrides but not both
  - Need to verify no breaking changes by forcing a different version - especially when forcing transitive dependencies
- 



#### References
https://cekrem.github.io/posts/beyond-react-memo-smarter-performance-optimization/?




# Advanced React Techniques: Custom Hook Composition and Async Patterns

## Custom Hook Composition and Abstraction

When reviewing React code, look for opportunities to compose multiple hooks into a single, well-abstracted custom hook.

**Benefits:**
- Improves code reusability across components
- Encapsulates complex logic
- Creates cleaner component code with better separation of concerns

**Example Pattern:**
```jsx
// useFetch.js
function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (isMounted) {
          setState({
            data,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error
          });
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url]);
  
  return state;
}

// Component using the hook
function MyComponent() {
  const { data, loading, error } = useFetch('/api/data');
  
  // Much cleaner component logic
}
```

## Handling Async Operations in useEffect

**Key Principles:**

1. **useEffect callbacks cannot be async**
   ```jsx
   // This is NOT allowed
   useEffect(async () => {
     // async code
   }, []);
   ```

2. **Define inner async functions instead**
   ```jsx
   useEffect(() => {
     const fetchData = async () => {
       // async logic
     };
     
     fetchData(); // Call without await
     
     return () => {
       // cleanup
     };
   }, []);
   ```

3. **Use isMounted pattern to prevent memory leaks**
   ```jsx
   useEffect(() => {
     let isMounted = true;
     
     const asyncOperation = async () => {
       // ...
       if (isMounted) {
         // Only update state if still mounted
       }
     };
     
     asyncOperation();
     
     return () => {
       isMounted = false;
     };
   }, []);
   ```

4. **Handle errors inside the async function**
   ```jsx
   const fetchData = async () => {
     try {
       // Async operations
     } catch (error) {
       if (isMounted) {
         setError(error);
       }
     }
   };
   ```

5. **Consider AbortController for cancelable fetches**
   ```jsx
   useEffect(() => {
     const controller = new AbortController();
     
     const fetchData = async () => {
       try {
         const response = await fetch(url, {
           signal: controller.signal
         });
         // Handle response
       } catch (error) {
         // Handle error
       }
     };
     
     fetchData();
     
     return () => {
       controller.abort();
     };
   }, [url]);
   ```

## Review Checklist

When reviewing React code, recommend custom hook extraction when you see:
- Duplicate useEffect + useState patterns across components
- Components with too many useState declarations
- Complex state management logic mixed with presentation code
- Opportunities to make logic reusable across the application

These patterns lead to more maintainable, testable, and readable React code while following React's philosophy of composition and reuse.




# Advanced React Technique: Component Compound Pattern

## What is the Compound Component Pattern?

The Compound Component pattern is an advanced React pattern that creates a more expressive and flexible API by allowing components to communicate implicitly using React's Context API. This pattern is particularly useful for complex UI components with multiple related parts.

## Benefits:

- **Improved Readability**: Component usage closely mirrors the component's visual structure
- **Better Encapsulation**: Implementation details remain hidden within the parent component
- **Flexible Composition**: Components can be arranged in various ways while maintaining shared state
- **Self-documenting API**: The structure makes the intended usage obvious

## Example: Custom Select Component

Here's how you might implement a custom select component using the compound pattern:

```jsx
// In Select.js
import React, { createContext, useContext, useState } from 'react';

// Create context
const SelectContext = createContext();

// Main component
function Select({ children, defaultValue = '', onChange = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange(option);
  };
  
  const value = {
    isOpen,
    selectedOption,
    toggleDropdown,
    selectOption
  };
  
  return (
    <SelectContext.Provider value={value}>
      <div className="select-container">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// Trigger component
Select.Trigger = function SelectTrigger() {
  const { selectedOption, toggleDropdown, isOpen } = useContext(SelectContext);
  
  return (
    <button 
      className={`select-trigger ${isOpen ? 'open' : ''}`} 
      onClick={toggleDropdown}
    >
      {selectedOption || 'Select an option'}
      <span className="arrow">▼</span>
    </button>
  );
};

// Options container
Select.OptionList = function SelectOptionList({ children }) {
  const { isOpen } = useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <ul className="select-options">
      {children}
    </ul>
  );
};

// Individual option
Select.Option = function SelectOption({ children, value }) {
  const { selectOption, selectedOption } = useContext(SelectContext);
  const isSelected = value === selectedOption;
  
  return (
    <li 
      className={`select-option ${isSelected ? 'selected' : ''}`}
      onClick={() => selectOption(value)}
    >
      {children}
    </li>
  );
};

export default Select;
```

## Usage Example

The power of compound components becomes clear when you see how they're used:

```jsx
function App() {
  return (
    <div className="app">
      <h1>Choose your favorite fruit:</h1>
      
      <Select onChange={(value) => console.log(`Selected: ${value}`)}>
        <Select.Trigger />
        <Select.OptionList>
          <Select.Option value="apple">Apple 🍎</Select.Option>
          <Select.Option value="banana">Banana 🍌</Select.Option>
          <Select.Option value="orange">Orange 🍊</Select.Option>
          <Select.Option value="strawberry">Strawberry 🍓</Select.Option>
        </Select.OptionList>
      </Select>
    </div>
  );
}
```

## When to Use This Pattern

Look for compound component opportunities when:

1. You have UI components with multiple related parts (tabs, accordions, menus)
2. The components need to share state while remaining flexible in composition
3. You want to create an intuitive API that mirrors the visual hierarchy
4. Current implementations require excessive prop drilling or complex state management

## Code Review Tips

When reviewing React code, recommend this pattern when you see:

- Props being deeply passed through multiple component layers
- Components with numerous configuration props
- Inflexible components that can't be easily customized
- Components with related pieces that need to be aware of each other's state

This pattern leverages React's Context API for elegant component composition while maintaining clean, readable JSX that closely mirrors the final rendered output.



### memoizing
* is the calculation actually expensive?
  * you should measure
  * react doc says you probably need to be creating or looping over thousands of objects to meet the threshold
  * write a console.time() wrapped before and after to measure -- compare that to measure with memo
  * try throttling to get a more accurate user experience