export type QACategory =
  | "HR"
  | "Python"
  | "Java"
  | "C/C++"
  | "JavaScript"
  | "DSA"
  | "DBMS"
  | "Operating Systems"
  | "Computer Networks"
  | "OOP"
  | "Software Engineering"
  | "AI/ML";

export interface QAQuestion {
  id: string;
  category: QACategory;
  question: string;
  answer: string;
  keyPoints?: string[];
  codeExample?: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface QACategoryInfo {
  id: QACategory;
  title: string;
  description: string;
  iconName: string;
  count?: number;
}

export const QA_CATEGORIES: QACategoryInfo[] = [
  { id: "HR", title: "HR & Behavioral", description: "Common HR questions, STAR method, conflict resolution, & career goals", iconName: "Users" },
  { id: "Python", title: "Python", description: "Core Python syntax, data structures, GIL, generators, & decorators", iconName: "Terminal" },
  { id: "Java", title: "Java", description: "JVM internals, Garbage collection, Multithreading, Streams, & Collections", iconName: "Coffee" },
  { id: "C/C++", title: "C / C++", description: "Pointers, Memory management, RAII, STL, Smart pointers, & Virtual tables", iconName: "Cpu" },
  { id: "JavaScript", title: "JavaScript", description: "Event loop, Closures, Promises, Async/Await, ES6+, & DOM mechanics", iconName: "Code" },
  { id: "DSA", title: "Data Structures & Algorithms", description: "Arrays, Trees, Graphs, Dynamic Programming, Sorting, & Time Complexity", iconName: "Network" },
  { id: "DBMS", title: "Database Systems (DBMS)", description: "SQL queries, Normalization, ACID properties, Indexing, & Transactions", iconName: "Database" },
  { id: "Operating Systems", title: "Operating Systems", description: "Process scheduling, Virtual Memory, Deadlocks, Threads, & System calls", iconName: "HardDrive" },
  { id: "Computer Networks", title: "Computer Networks", description: "OSI Model, TCP/IP, HTTP/HTTPS, DNS, WebSockets, & Network Security", iconName: "Globe" },
  { id: "OOP", title: "Object-Oriented Programming", description: "Abstraction, Encapsulation, Inheritance, Polymorphism, & SOLID Principles", iconName: "Boxes" },
  { id: "Software Engineering", title: "Software Engineering", description: "System Design, Microservices, Agile/Scrum, CI/CD, & Testing strategies", iconName: "Layers" },
  { id: "AI/ML", title: "Artificial Intelligence & ML", description: "Machine Learning models, Neural Networks, Overfitting, NLP, & Transformers", iconName: "Sparkles" },
];

export const INTERVIEW_QUESTIONS: QAQuestion[] = [
  // --- HR CATEGORY ---
  {
    id: "hr-1",
    category: "HR",
    question: "Tell me about yourself.",
    difficulty: "Easy",
    answer: "Structure your response using the Past-Present-Future formula. Highlight relevant academic background, key professional achievements, core technical competencies, and conclude with why you are excited about this specific opportunity.",
    keyPoints: [
      "Keep it under 2 minutes",
      "Focus 70% on technical skills and relevant accomplishments",
      "Explain why this company and role match your career vision"
    ]
  },
  {
    id: "hr-2",
    category: "HR",
    question: "What is your greatest strength and biggest weakness?",
    difficulty: "Easy",
    answer: "For strengths, pick a soft/hard skill backed by quantifiable metrics (e.g. problem-solving under tight deadlines). For weakness, pick a genuine professional growth area you are actively resolving with concrete steps.",
    keyPoints: [
      "Avoid fake weaknesses like 'I work too hard'",
      "Show self-awareness and active self-improvement",
      "Anchor your strength to a real project outcome"
    ]
  },
  {
    id: "hr-3",
    category: "HR",
    question: "Describe a time you dealt with a difficult team member or conflict.",
    difficulty: "Medium",
    answer: "Use the STAR method (Situation, Task, Action, Result). Emphasize empathy, active listening, depersonalizing technical differences, and aligning on common goals to achieve a successful project outcome.",
    keyPoints: [
      "Focus on professional alignment, not personal fault",
      "Highlight your communication & compromise skills",
      "End with positive metrics or deliverables achieved"
    ]
  },
  {
    id: "hr-4",
    category: "HR",
    question: "Where do you see yourself in 5 years?",
    difficulty: "Easy",
    answer: "Demonstrate realistic career growth, continuous learning, and commitment. Express intent to master your technical domain, take on higher ownership, mentor peers, and contribute meaningfully to company goals.",
    keyPoints: [
      "Show enthusiasm for long-term growth within the domain",
      "Focus on skill acquisition and impact over specific job titles",
      "Align personal growth goals with company growth"
    ]
  },

  // --- PYTHON CATEGORY ---
  {
    id: "py-1",
    category: "Python",
    question: "What is the difference between list, tuple, and set in Python?",
    difficulty: "Easy",
    answer: "Lists are ordered, mutable collections defined with square brackets []. Tuples are ordered, immutable collections defined with parentheses (). Sets are unordered, mutable collections of unique elements defined with curly braces {}.",
    keyPoints: [
      "List: Mutable, ordered, allows duplicates — O(n) search",
      "Tuple: Immutable, hashable (can be dict keys), lower memory overhead",
      "Set: Mutable, unique items only — average O(1) hash lookup"
    ],
    codeExample: `my_list = [1, 2, 2, 3]    # Mutable, allows duplicates
my_tuple = (1, 2, 2, 3)   # Immutable
my_set = {1, 2, 3}        # Unique values only ({1, 2, 3})`
  },
  {
    id: "py-2",
    category: "Python",
    question: "How do Python Decorators work?",
    difficulty: "Medium",
    answer: "Decorators are functions that accept another function as an argument and extend/modify its behavior without permanently modifying its code, leveraging Python's first-class functions and closures.",
    keyPoints: [
      "First-class functions allow functions to be passed as variables",
      "@decorator_name is syntactic sugar for func = decorator(func)",
      "Always use @functools.wraps to preserve function metadata"
    ],
    codeExample: `import functools

def log_execution(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper

@log_execution
def add(a, b):
    return a + b`
  },
  {
    id: "py-3",
    category: "Python",
    question: "What is the GIL (Global Interpreter Lock) in Python?",
    difficulty: "Hard",
    answer: "The GIL is a mutual-exclusion lock in CPython that ensures only one native thread executes Python bytecode at a time. It simplifies memory management (reference counting), but prevents multi-core execution for CPU-bound Python threads. Multiprocessing or C extensions can bypass GIL.",
    keyPoints: [
      "Affects CPU-bound multithreaded Python applications",
      "I/O-bound operations release the GIL during execution",
      "Use `multiprocessing` module for CPU parallelism"
    ]
  },

  // --- JAVA CATEGORY ---
  {
    id: "java-1",
    category: "Java",
    question: "What is the difference between final, finally, and finalize in Java?",
    difficulty: "Easy",
    answer: "'final' is a keyword used to declare constant variables, prevent method overriding, or prevent class inheritance. 'finally' is a block used with try-catch for cleanup code. 'finalize()' was a method invoked by Garbage Collector before object reclamation (deprecated since Java 9).",
    keyPoints: [
      "final variable: value cannot be changed",
      "final method: cannot be overridden",
      "finally block: always executes regardless of exception"
    ]
  },
  {
    id: "java-2",
    category: "Java",
    question: "How does Garbage Collection work in Java?",
    difficulty: "Medium",
    answer: "Java Garbage Collection automatically manages memory allocation by identifying unreferenced objects on the Heap. It divides the Heap into Young Generation (Eden, Survivor spaces) and Old/Tenured Generation using algorithms like G1, ZGC, or Parallel GC.",
    keyPoints: [
      "Minor GC cleans Young Generation",
      "Major/Full GC cleans Old Generation",
      "Reachability analysis tracks GC roots to prevent memory leaks"
    ]
  },
  {
    id: "java-3",
    category: "Java",
    question: "Explain String immutability and String Pool in Java.",
    difficulty: "Medium",
    answer: "Strings in Java are immutable for security, thread-safety, and caching efficiency. The String Constant Pool is a special storage area in Heap memory where String literals are cached to avoid redundant object creation.",
    codeExample: `String s1 = "Hello"; // Stored in String Pool
String s2 = "Hello"; // Points to existing s1 in pool (s1 == s2 is true)
String s3 = new String("Hello"); // Creates new object on Heap (s1 == s3 is false)`
  },

  // --- C/C++ CATEGORY ---
  {
    id: "cpp-1",
    category: "C/C++",
    question: "What is the difference between pointers and references in C++?",
    difficulty: "Easy",
    answer: "A pointer stores a memory address and can be reassigned, set to nullptr, or dereferenced. A reference is an alias for an existing variable, cannot be null, and cannot be reassigned once initialized.",
    keyPoints: [
      "Pointers: `int* p = &a;` Can be NULL, allows pointer arithmetic",
      "References: `int& ref = a;` Must be initialized at declaration",
      "Pointers consume separate memory; references share the target's memory location"
    ]
  },
  {
    id: "cpp-2",
    category: "C/C++",
    question: "What are Smart Pointers in C++11 and why use them?",
    difficulty: "Medium",
    answer: "Smart pointers manage raw pointers using RAII (Resource Acquisition Is Initialization) to automatically deallocate memory when out of scope, preventing memory leaks and dangling pointers. Types: std::unique_ptr (exclusive ownership), std::shared_ptr (reference counted), std::weak_ptr (prevents circular dependencies).",
    codeExample: `#include <memory>

std::unique_ptr<MyClass> ptr1 = std::make_unique<MyClass>(); // Auto cleaned
std::shared_ptr<MyClass> ptr2 = std::make_shared<MyClass>(); // Shared ownership`
  },
  {
    id: "cpp-3",
    category: "C/C++",
    question: "Explain Virtual Tables (vtable) and Dynamic Dispatch in C++.",
    difficulty: "Hard",
    answer: "When a class has virtual functions, the C++ compiler creates a static table called the vtable containing pointers to virtual functions. Each object instance contains a hidden vptr pointing to its class vtable to resolve method calls at runtime (polymorphism).",
    keyPoints: [
      "Virtual functions enable runtime polymorphism",
      "vptr adds small memory overhead per object",
      "vtable lookup adds slight performance latency compared to inline static binding"
    ]
  },

  // --- JAVASCRIPT CATEGORY ---
  {
    id: "js-1",
    category: "JavaScript",
    question: "Explain Closures in JavaScript with a real-world use case.",
    difficulty: "Medium",
    answer: "A closure is a function bound together with references to its lexical environment. In JS, inner functions retain access to variables declared in their outer enclosing scope even after the outer function has returned execution context.",
    keyPoints: [
      "Enables private variables and data encapsulation",
      "Used extensively in currying, stateful functions, & module patterns",
      "Be mindful of memory retained by long-lived closure references"
    ],
    codeExample: `function createCounter() {
  let count = 0; // Private variable
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}
const counter = createCounter();
console.log(counter.increment()); // 1`
  },
  {
    id: "js-2",
    category: "JavaScript",
    question: "How does the JavaScript Event Loop work?",
    difficulty: "Hard",
    answer: "JavaScript is single-threaded. The Event Loop continuously checks if the Call Stack is empty. When empty, it pops callbacks from the Microtask Queue (Promises, process.nextTick) before picking tasks from the Macrotask Queue (setTimeout, setInterval, I/O events).",
    keyPoints: [
      "Call Stack: Executes synchronous code",
      "Microtasks Queue: High priority (Promises, queueMicrotask)",
      "Macrotasks Queue: Lower priority (setTimeout, I/O, UI rendering)"
    ]
  },
  {
    id: "js-3",
    category: "JavaScript",
    question: "What is the difference between `var`, `let`, and `const`?",
    difficulty: "Easy",
    answer: "`var` is function-scoped, re-declarable, and hoisted with `undefined`. `let` and `const` are block-scoped, non-re-declarable within scope, and exist in the Temporal Dead Zone until declared. `const` prevents re-assignment (though object properties remain mutable).",
    keyPoints: [
      "var: Function scope, hoisted as undefined",
      "let: Block scope, temporal dead zone",
      "const: Block scope, mandatory value assignment, immutable binding"
    ]
  },

  // --- DSA CATEGORY ---
  {
    id: "dsa-1",
    category: "DSA",
    question: "What is the difference between Breadth-First Search (BFS) and Depth-First Search (DFS)?",
    difficulty: "Medium",
    answer: "BFS explores nodes level by level using a Queue (FIFO), ideal for finding shortest path in unweighted graphs. DFS explores deep along each branch before backtracking using a Stack (LIFO or recursion), ideal for path finding and topological sorting.",
    keyPoints: [
      "BFS: Queue data structure, O(V + E) time, O(V) space (width of graph)",
      "DFS: Stack/Recursion, O(V + E) time, O(H) space (depth/height)",
      "BFS guarantees shortest path in unweighted networks"
    ]
  },
  {
    id: "dsa-2",
    category: "DSA",
    question: "How does QuickSort work and what is its average/worst time complexity?",
    difficulty: "Medium",
    answer: "QuickSort is a divide-and-conquer algorithm that selects a 'pivot' element, partitions array elements smaller than pivot to the left and larger to the right, and recursively sorts sub-arrays.",
    keyPoints: [
      "Average Time: O(n log n)",
      "Worst Time: O(n²) when pivot selection is poor (e.g., sorted array with last element pivot)",
      "Space: O(log n) call stack memory"
    ]
  },
  {
    id: "dsa-3",
    category: "DSA",
    question: "Explain Dynamic Programming and the difference between Memoization and Tabulation.",
    difficulty: "Hard",
    answer: "Dynamic Programming optimizes recursive algorithms with overlapping subproblems and optimal substructure. Memoization is Top-Down (recursion + caching), while Tabulation is Bottom-Up (iterative DP array filling).",
    keyPoints: [
      "Top-Down (Memoization): Solves subproblems on-demand recursively",
      "Bottom-Up (Tabulation): Solves smallest subproblems first iteratively",
      "Saves exponential calculation time O(2ⁿ) down to polynomial O(n)"
    ]
  },

  // --- DBMS CATEGORY ---
  {
    id: "dbms-1",
    category: "DBMS",
    question: "What are ACID properties in Database Management Systems?",
    difficulty: "Easy",
    answer: "ACID ensures reliable transaction processing. Atomicity: All or nothing transaction. Consistency: Moves DB from one valid state to another. Isolation: Concurrent transactions operate independently. Durability: Committed updates persist permanently.",
    keyPoints: [
      "Atomicity (Rollback on failure)",
      "Consistency (Schema & constraint integrity)",
      "Isolation (Concurrency control via locking/MVCC)",
      "Durability (Write-Ahead Logging / Non-volatile storage)"
    ]
  },
  {
    id: "dbms-2",
    category: "DBMS",
    question: "What is Database Indexing and how does B-Tree indexing speed up queries?",
    difficulty: "Medium",
    answer: "An Index is a data structure (commonly B-Tree or B+ Tree) that stores pointer references to table rows. Instead of performing full table scans O(N), B-Trees allow logarithmic O(log N) lookup times.",
    keyPoints: [
      "B+ Trees store all data pointers at leaf nodes for fast range scans",
      "Speed up SELECT queries significantly",
      "Add slight overhead to INSERT, UPDATE, DELETE due to index rebalancing"
    ]
  },
  {
    id: "dbms-3",
    category: "DBMS",
    question: "Explain the difference between SQL and NoSQL databases.",
    difficulty: "Easy",
    answer: "SQL databases (PostgreSQL, MySQL) are relational, structured with fixed schemas, enforce ACID properties, and scale vertically. NoSQL databases (MongoDB, Redis, Cassandra) are non-relational, flexible schema, horizontally scalable, and optimized for high velocity data.",
    keyPoints: [
      "SQL: Relational tables, strong consistency, ACID compliance",
      "NoSQL: Document/Key-Value/Columnar, horizontal partitioning, BASE compliance"
    ]
  },

  // --- OPERATING SYSTEMS CATEGORY ---
  {
    id: "os-1",
    category: "Operating Systems",
    question: "What is a Deadlock and what are the 4 necessary conditions for it?",
    difficulty: "Medium",
    answer: "A Deadlock occurs when a set of processes are blocked because each process holds a resource and waits for another resource held by another process. The 4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
    keyPoints: [
      "Mutual Exclusion: Resource non-shareable",
      "Hold and Wait: Holding resource while waiting for another",
      "No Preemption: Resources cannot be forcibly taken",
      "Circular Wait: Closed chain of dependent processes"
    ]
  },
  {
    id: "os-2",
    category: "Operating Systems",
    question: "What is Virtual Memory and how does Paging work?",
    difficulty: "Medium",
    answer: "Virtual Memory gives processes the illusion of having contiguous physical memory by combining RAM with secondary storage (Disk). Memory is split into fixed-size Pages, mapped via Page Tables to physical Memory Frames.",
    keyPoints: [
      "Page Fault occurs when referenced page is not in RAM",
      "TLB (Translation Lookaside Buffer) caches page mappings",
      "Prevents memory fragmentation and isolates process memory"
    ]
  },

  // --- COMPUTER NETWORKS CATEGORY ---
  {
    id: "cn-1",
    category: "Computer Networks",
    question: "Explain the TCP 3-Way Handshake process.",
    difficulty: "Easy",
    answer: "The TCP 3-Way Handshake establishes a reliable connection between Client and Server before data transmission: 1. Client sends SYN (Synchronize), 2. Server responds with SYN-ACK, 3. Client sends ACK (Acknowledge).",
    keyPoints: [
      "SYN: Client requests connection initialization",
      "SYN-ACK: Server accepts and acknowledges sequence number",
      "ACK: Client confirms, connection is ESTABLISHED"
    ]
  },
  {
    id: "cn-2",
    category: "Computer Networks",
    question: "What happens step-by-step when you type a URL into a web browser?",
    difficulty: "Medium",
    answer: "1. Browser checks cache for DNS mapping. 2. DNS resolution converts domain to IP address. 3. TCP 3-Way Handshake establishes socket connection (TLS handshake if HTTPS). 4. HTTP GET request is sent. 5. Server responds with HTML/CSS/JS. 6. Browser DOM & CSSOM render page.",
    keyPoints: [
      "DNS Resolution -> TCP Handshake -> TLS Handshake -> HTTP Request/Response -> Rendering"
    ]
  },

  // --- OOP CATEGORY ---
  {
    id: "oop-1",
    category: "OOP",
    question: "What are the 4 Pillars of Object-Oriented Programming?",
    difficulty: "Easy",
    answer: "1. Encapsulation: Bundling data and methods into a class while restricting direct access. 2. Abstraction: Hiding internal complexity and revealing essential interfaces. 3. Inheritance: Reusing code from parent classes. 4. Polymorphism: Performing a single action in different ways (Overloading & Overriding).",
    keyPoints: [
      "Encapsulation (Private fields + getters/setters)",
      "Abstraction (Abstract classes & Interfaces)",
      "Inheritance (is-a relationship)",
      "Polymorphism (Method Overriding at runtime, Overloading at compile time)"
    ]
  },
  {
    id: "oop-2",
    category: "OOP",
    question: "What are SOLID principles in Object-Oriented Design?",
    difficulty: "Hard",
    answer: "SOLID is an acronym for 5 design principles: S: Single Responsibility, O: Open/Closed (Open for extension, closed for modification), L: Liskov Substitution, I: Interface Segregation, D: Dependency Inversion.",
    keyPoints: [
      "Single Responsibility: One reason to change",
      "Open/Closed: Extend behavior without modifying source code",
      "Liskov Substitution: Subclasses must be substitutable for base classes",
      "Interface Segregation: Focused interfaces over monolithic ones",
      "Dependency Inversion: Depend on abstractions, not concrete implementations"
    ]
  },

  // --- SOFTWARE ENGINEERING CATEGORY ---
  {
    id: "se-1",
    category: "Software Engineering",
    question: "What is Microservices Architecture and how does it compare to Monolithic Architecture?",
    difficulty: "Medium",
    answer: "Monolithic applications package all features into a single codebase/deployment unit. Microservices decompose systems into independent, loosely coupled services communicating via APIs (REST/gRPC), allowing independent scaling, deployment, and technology stacks.",
    keyPoints: [
      "Monolith: Simple initial development, hard to scale modularly",
      "Microservices: Independent deployment, fault isolation, requires robust DevOps/Observability"
    ]
  },

  // --- AI/ML CATEGORY ---
  {
    id: "aiml-1",
    category: "AI/ML",
    question: "What is Overfitting in Machine Learning and how do you prevent it?",
    difficulty: "Medium",
    answer: "Overfitting occurs when a machine learning model learns noise and training data details so closely that it fails to generalize to unseen test data. Prevent it using Cross-Validation, L1/L2 Regularization, Dropout layers, Early Stopping, and Data Augmentation.",
    keyPoints: [
      "High training accuracy + low test accuracy = Overfitting",
      "L1 (Lasso) / L2 (Ridge) penalize large weights",
      "Dropout randomly deactivates neurons during neural network training"
    ]
  },
  {
    id: "aiml-2",
    category: "AI/ML",
    question: "What is the Transformer architecture and how does Self-Attention work?",
    difficulty: "Hard",
    answer: "Transformers replace recurrent structures (RNNs) with Self-Attention mechanisms that calculate relationship weights between all tokens in a sequence simultaneously. This enables parallelized training and handles long-range dependencies efficiently in LLMs.",
    keyPoints: [
      "Query, Key, Value (Q, K, V) vector matrices",
      "Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V",
      "Powers state-of-the-art models like GPT-4, BERT, and Gemini"
    ]
  }
];
